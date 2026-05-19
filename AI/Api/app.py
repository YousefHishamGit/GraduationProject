from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import json
import os
from dotenv import load_dotenv
import logging
import base64
import io
import PyPDF2
import google.generativeai as genai
from PIL import Image
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from deep_translator import GoogleTranslator
import uuid
import re
from datetime import datetime, timedelta

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB

# ---------- جلسات المحادثة في الذاكرة ----------
sessions = {}  # {session_id: {"history": [...], "last_used": datetime}}

def cleanup_old_sessions():
    """إزالة الجلسات اللي معدّت عليها أكتر من ساعة"""
    cutoff = datetime.now() - timedelta(hours=1)
    expired = [sid for sid, s in sessions.items() if s["last_used"] < cutoff]
    for sid in expired:
        sessions.pop(sid, None)
        logger.info(f"🗑️ Session expired and removed: {sid}")

# ---------- ترجمة ----------
def translate_to_arabic(text: str) -> str:
    if not text or not isinstance(text, str) or len(text.strip()) < 2:
        return text
    if any('\u0600' <= c <= '\u06FF' for c in text):
        return text
    try:
        translator = GoogleTranslator(source='en', target='ar')
        return translator.translate(text) or text
    except Exception:
        return text

# ---------- Gemini ----------
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    gemini_model = genai.GenerativeModel('gemini-2.0-flash')
    GEMINI_AVAILABLE = True
else:
    gemini_model = None
    GEMINI_AVAILABLE = False

# ---------- Groq ----------
try:
    api_key = os.environ.get("GROQ_API_KEY")
    client = Groq(api_key=api_key) if api_key else None
except Exception as e:
    client = None
    logger.error(f"Groq init error: {e}")

# ---------- Local Model ----------
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../Training')))
LOCAL_MODEL_AVAILABLE = False
local_triage_model = local_specialty_model = local_vectorizer = None
try:
    from preprocess import clean_text, normalize_symptoms
    LOCAL_MODEL_AVAILABLE = True
    local_triage_model = pickle.load(open(os.path.join(os.path.dirname(__file__), "../Model/model.pkl"), "rb"))
    local_specialty_model = pickle.load(open(os.path.join(os.path.dirname(__file__), "../Model/specialty_model.pkl"), "rb"))
    local_vectorizer = pickle.load(open(os.path.join(os.path.dirname(__file__), "../Model/vectorizer.pkl"), "rb"))
except Exception as e:
    logger.error(f"Local model error: {e}")

# ---------- RAG ----------
MEDICAL_DB_PATH = "./medical_db"
RAG_AVAILABLE = False
retriever = None
try:
    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectorstore = Chroma(persist_directory=MEDICAL_DB_PATH, embedding_function=embedding_model)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    RAG_AVAILABLE = True
    logger.info("✅ Medical vector database loaded")
except Exception as e:
    logger.warning(f"RAG error: {e}")

def get_medical_context(query: str) -> str:
    if not RAG_AVAILABLE or retriever is None:
        return ""
    try:
        if any('\u0600' <= c <= '\u06FF' for c in query):
            query_en = GoogleTranslator(source='auto', target='en').translate(query)
        else:
            query_en = query
        docs = retriever.invoke(query_en)
        if not docs:
            return ""
        context = "\n\n".join([doc.page_content for doc in docs])
        return f"معلومات طبية موثوقة من قاعدة البيانات:\n{context}\n\n"
    except Exception as e:
        logger.error(f"RAG error: {e}")
        return ""

# ---------- معالجة الملفات ----------
def extract_file_content_from_bytes(file_bytes: bytes, filename: str) -> str:
    """استخراج النص من PDF أو وصف الصورة عبر Gemini Vision (بتشتغل مع bytes مباشرة)"""
    filename_lower = filename.lower()
    
    if filename_lower.endswith('.pdf'):
        try:
            reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return f"[محتوى PDF مستخرج]:\n{text[:2000]}"
        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
            return "[خطأ في قراءة PDF]"
            
    elif filename_lower.endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp')):
        if not GEMINI_AVAILABLE:
            return "[الصورة مرفوعة لكن خدمة تحليل الصور غير متاحة]"
        try:
            # التحقق من حجم الصورة (Groq بيحد بـ 4MB تقريباً للـ base64)
            if len(file_bytes) > 4 * 1024 * 1024:
                return "[الصورة كبيرة جداً، الحد الأقصى 4 ميجا]"
                
            image = Image.open(io.BytesIO(file_bytes))
            prompt = "وصف هذه الصورة الطبية بالعربية بشكل مختصر، مع ذكر أي تفاصيل طبية مهمة (مثل أشعة، جروح، أعراض ظاهرة)."
            response = gemini_model.generate_content([prompt, image])
            return f"[وصف الصورة الطبية]:\n{response.text.strip()}"
        except Exception as e:
            logger.error(f"Image analysis error: {e}")
            return "[خطأ في تحليل الصورة]"
    else:
        return "[نوع ملف غير مدعوم]"

# للتوافق مع الكود القديم اللي بيستخدم file object
def extract_file_content(file) -> str:
    """Wrapper لـ extract_file_content_from_bytes بيشتغل مع file object"""
    filename = file.filename.lower()
    file_bytes = file.read()
    result = extract_file_content_from_bytes(file_bytes, filename)
    file.seek(0)
    return result

# ---------- System Prompts (عربية) ----------
CHAT_SYSTEM_PROMPT_AR = """أنت مساعد طبي ودود ومحترف اسمه MediCare AI.
تحدث باللغة العربية فقط.
سيتم إعطاؤك تاريخ المحادثة وأي معلومات مستخلصة من ملفات (PDF أو صور) أو من قاعدة المعرفة الطبية (RAG).
استخدم هذه المعلومات للإجابة بدقة.

تعليمات:
- كن متعاطفًا ومهنيًا.
- اسأل أسئلة توضيحية عن الأعراض إذا لزم الأمر.
- إذا كان هناك حالة طارئة (ألم صدر، صعوبة تنفس، نزيف حاد) انصح بالاتصال بالإسعاف (123).
- أجب بإجابات مختصرة (جملتين إلى 4 جمل) ولكن مفيدة.
- عندما تجمع معلومات كافية، ضع كتلة JSON تحتوي على التشخيص في نهاية رسالتك داخل وسم <diagnosis> مثل هذا:
<<diagnosis>
{"diagnosis": "اسم المرض بالعربية", "recommended_specialty": "التخصص بالعربية", "urgency_level": "critical|moderate|normal"}
</diagnosis>
لا تضع التشخيص إلا إذا كنت واثقاً.
"""

SYSTEM_PROMPT_AR = """أنت مساعد طبي خبير اسمه MediCare AI.
أجب دائمًا باللغة العربية فقط. استخدم المعرفة الطبية المقدمة إن وجدت.
قم بالرد بصيغة JSON فقط وفق هذا التنسيق (بدون أي نص خارج JSON):
{
  "diagnosis": "التشخيص الطبي المختصر بالعربية",
  "recommended_specialty": "التخصص الطبي الموصى به بالعربية (مثال: قلبية، عظام، أعصاب)",
  "urgency_level": "critical أو moderate أو normal",
  "urgency_message": "رسالة تنبيه عاجلة بالعربية",
  "tips": ["نصيحة 1 بالعربية", "نصيحة 2 بالعربية", "نصيحة 3 بالعربية"]
}
ملاحظات: urgency_level تكون إنجليزية (critical, moderate, normal) لأنها قيمة نظامية، ولكن كل الحقول النصية الأخرى بالعربية.
"""

# ---------- Chat Endpoint (مع الجلسات والملفات) ----------
@app.route('/chat', methods=['POST'])
def chat():
    cleanup_old_sessions()  # تنظيف الجلسات المنتهية

    # محاولة استخراج sessionId من الهيدر أو الجسم
    session_id = request.headers.get('X-Session-Id') or request.form.get('sessionId')
    if not session_id and request.is_json:
        data = request.get_json()
        session_id = data.get('sessionId')
    if not session_id:
        session_id = str(uuid.uuid4())

    # تهيئة الجلسة إذا كانت جديدة
    if session_id not in sessions:
        sessions[session_id] = {
            "history": [],
            "last_used": datetime.now()
        }

    session = sessions[session_id]
    session["last_used"] = datetime.now()
    history = session["history"]

    # قراءة الرسالة والملفات
    user_message = ""
    files_content = []

    if request.is_json:
        data = request.get_json()
        user_message = data.get('message', '') or ''
        files_data = data.get('files', [])
        for f in files_data:
            try:
                file_bytes = base64.b64decode(f['content'])
                content = extract_file_content_from_bytes(file_bytes, f.get('name', 'unknown'))
                files_content.append(content)
            except Exception as e:
                logger.error(f"Error processing base64 file: {e}")
    else:
        user_message = request.form.get('message', '') or ''
        uploaded_files = request.files.getlist('files')
        for file in uploaded_files:
            if file and file.filename:
                content = extract_file_content(file)
                files_content.append(content)

    # دمج محتوى الملفات مع الرسالة
    if files_content:
        combined = user_message + "\n\n" + "\n\n".join(files_content)
    else:
        combined = user_message

    if not combined.strip():
        return jsonify({"error": "لا توجد رسالة أو ملفات للمعالجة"}), 400

    # إضافة رسالة المستخدم إلى التاريخ
    history.append({"role": "user", "content": combined})

    # الاحتفاظ بآخر 30 رسالة فقط
    if len(history) > 30:
        history[:] = history[-30:]

    # بناء سياق المحادثة للنموذج
    llm_messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT_AR}]
    llm_messages.extend(history)

    # إضافة سياق RAG استناداً إلى آخر رسالة للمستخدم
    last_user_content = history[-1]["content"]
    rag_context = get_medical_context(last_user_content)
    if rag_context:
        llm_messages[-1]["content"] = rag_context + "\n" + llm_messages[-1]["content"]

    # استدعاء النموذج (Groq أو Gemini)
    response_text = ""
    diagnosis_data = {
        "diagnosis": "تحتاج لاستشارة طبيب لتحديد الحالة بدقة",
        "recommended_specialty": "طب عام",
        "urgency_level": "normal"
    }

    if client:
        try:
            completion = client.chat.completions.create(
                messages=llm_messages,
                model="llama-3.3-70b-versatile",
                temperature=0.5,
                max_tokens=600
            )
            response_text = completion.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Groq error: {e}")
            response_text = "عذراً، حدث خطأ في الاتصال بخدمة الذكاء الاصطناعي."
    elif GEMINI_AVAILABLE:
        try:
            prompt = "\n".join([f"{m['role']}: {m['content']}" for m in llm_messages])
            resp = gemini_model.generate_content(prompt)
            response_text = resp.text.strip()
        except Exception as e:
            logger.error(f"Gemini error: {e}")
            response_text = "عذراً، حدث خطأ في الاتصال بخدمة Gemini."
    else:
        response_text = "عذراً، خدمة الذكاء الاصطناعي غير متاحة حالياً. يرجى استشارة طبيب."

    # استخراج كتلة التشخيص من الرد
    diag_match = re.search(r'<diagnosis>(.*?)</diagnosis>', response_text, re.DOTALL)
    if diag_match:
        try:
            diag_json = json.loads(diag_match.group(1).strip())
            diagnosis_data = {
                "diagnosis": diag_json.get("diagnosis", diagnosis_data["diagnosis"]),
                "recommended_specialty": diag_json.get("recommended_specialty", diagnosis_data["recommended_specialty"]),
                "urgency_level": diag_json.get("urgency_level", "normal")
            }
            response_text = re.sub(r'<diagnosis>.*?</diagnosis>', '', response_text, flags=re.DOTALL).strip()
        except:
            pass

    # تأكيد أن الرد بالعربية
    if not any('\u0600' <= c <= '\u06FF' for c in response_text):
        response_text = translate_to_arabic(response_text)

    # إضافة رد المساعد إلى التاريخ
    history.append({"role": "assistant", "content": response_text})

    return jsonify({
        "sessionId": session_id,
        "reply": response_text,
        "diagnosis": diagnosis_data
    }), 200

# ---------- Predict Endpoint (تحليل الأعراض فقط) ----------
@app.route('/predict', methods=['POST'])
def predict():
    if not client and not LOCAL_MODEL_AVAILABLE:
        return jsonify({'error': 'الخدمة غير متاحة'}), 503

    data = request.get_json()
    if not data or 'symptoms' not in data:
        return jsonify({'error': 'الرجاء إرسال الأعراض'}), 400
    symptoms = data['symptoms'].strip()
    if not symptoms:
        return jsonify({'error': 'الأعراض لا يمكن أن تكون فارغة'}), 400

    try:
        medical_context = get_medical_context(symptoms) if client else ""

        if client:
            user_msg = f"أعراض المريض: {symptoms}"
            if medical_context:
                user_msg = f"{medical_context}\nبناء على المعرفة الطبية أعلاه، قم بتحليل الأعراض وأخرج JSON بالعربية:\n{user_msg}"

            completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT_AR},
                    {"role": "user", "content": user_msg}
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.3,
                max_tokens=500
            )
            response_text = completion.choices[0].message.content.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            result = json.loads(response_text)

            response = {
                'symptoms': symptoms,
                'diagnosis': result.get('diagnosis', 'غير معروف'),
                'recommended_specialty': result.get('recommended_specialty', 'طب عام'),
                'urgency_level': result.get('urgency_level', 'normal'),
                'urgency_message': result.get('urgency_message', 'يمكنك مراجعة الطبيب قريباً'),
                'tips': result.get('tips', ['استرح', 'اشرب ماء', 'راقب الأعراض']),
                'disclaimer': 'هذا تحليل أولي بالذكاء الاصطناعي، استشر طبيباً حقيقياً.',
                'rag_used': bool(medical_context)
            }
            # ترجمة أي حقل إنجليزي ظهر بالخطأ
            if not any('\u0600' <= c <= '\u06FF' for c in response['diagnosis']):
                response['diagnosis'] = translate_to_arabic(response['diagnosis'])
            if not any('\u0600' <= c <= '\u06FF' for c in response['recommended_specialty']):
                response['recommended_specialty'] = translate_to_arabic(response['recommended_specialty'])
            response['tips'] = [tip if any('\u0600' <= c <= '\u06FF' for c in tip) else translate_to_arabic(tip) for tip in response['tips']]
            return jsonify(response)
        else:
            # النموذج المحلي
            try:
                eng_symptoms = GoogleTranslator(source='auto', target='en').translate(symptoms)
            except:
                eng_symptoms = symptoms
            cleaned = clean_text(eng_symptoms)
            normalized = normalize_symptoms(cleaned)
            X = local_vectorizer.transform([normalized])
            triage = local_triage_model.predict(X)[0]
            specialty = local_specialty_model.predict(X)[0]
            response = {
                'symptoms': symptoms,
                'diagnosis': translate_to_arabic('تشخيص مؤقت (نموذج محلي)'),
                'recommended_specialty': translate_to_arabic(specialty),
                'urgency_level': triage,
                'urgency_message': 'تم التقييم بواسطة النموذج المحلي، يُرجى استشارة طبيب.',
                'tips': [translate_to_arabic('استشر طبيباً'), translate_to_arabic('هذا تحليل أولي')],
                'disclaimer': 'تحليل آلي محلي، ليس بديلاً عن الطبيب.',
                'rag_used': False
            }
            return jsonify(response)
    except Exception as e:
        logger.error(f"Predict error: {e}")
        return jsonify({'error': f'فشل التحليل: {str(e)}'}), 500

# ---------- تحليل تقرير PDF مستقل ----------
@app.route('/analyze-report', methods=['POST'])
def analyze_report():
    if not client:
        return jsonify({'error': 'خدمة الذكاء الاصطناعي غير متاحة'}), 503
    if 'file' not in request.files:
        return jsonify({'error': 'لم يتم رفع ملف'}), 400
    file = request.files['file']
    if file.filename == '' or not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'الملف يجب أن يكون PDF'}), 400
    try:
        pdf_bytes = file.read()
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        if not text.strip():
            return jsonify({'error': 'لا يمكن استخراج النص من PDF'}), 400
        text = text[:3000]

        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": """أنت طبيب خبير. حلل التقرير الطبي التالي وأخرج JSON بالعربية فقط بهذا الشكل:
{
  "summary": "ملخص عام للتقرير بالعربية",
  "normal_results": ["نتيجة طبيعية 1", "نتيجة طبيعية 2"],
  "abnormal_results": ["نتيجة غير طبيعية 1"],
  "recommendations": ["توصية 1", "توصية 2"],
  "urgency_level": "normal/moderate/critical",
  "urgency_message": "رسالة عاجلة بالعربية"
}
"""},
                {"role": "user", "content": f"التقرير الطبي:\n{text}"}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=1000
        )
        response_text = completion.choices[0].message.content.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        result = json.loads(response_text)
        return jsonify({'success': True, 'filename': file.filename, 'analysis': result})
    except Exception as e:
        logger.error(f"Report error: {e}")
        return jsonify({'error': f'فشل تحليل التقرير: {str(e)}'}), 500

# ---------- تحليل صورة مستقلة ----------
@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    if not client:
        return jsonify({"error": "خدمة Groq غير متاحة"}), 503
    if 'file' not in request.files:
        return jsonify({"error": "لا يوجد ملف"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "الملف فارغ"}), 400
    
    try:
        img_bytes = file.read()
        
        # التحقق من حجم الصورة
        if len(img_bytes) > 4 * 1024 * 1024:
            return jsonify({"error": "حجم الصورة كبير جداً. الحد الأقصى 4 ميجابايت"}), 400
            
        base64_image = base64.b64encode(img_bytes).decode('utf-8')
        
        prompt = """أنت طبيب خبير. حلل هذه الصورة الطبية وأخرج JSON بالعربية فقط:
{
  "description": "وصف الصورة بالعربية",
  "findings": ["ملاحظة طبية 1", "ملاحظة طبية 2"],
  "recommendations": ["توصية 1", "توصية 2"],
  "urgency_level": "normal",
  "urgency_message": "رسالة مناسبة بالعربية"
}
"""
        completion = client.chat.completions.create(
            model="llama-3.2-11b-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                }
            ],
            temperature=0.2,
            max_tokens=500
            # ملاحظة: شلنا response_format لأن Groq vision models مش بيدعم json_object
        )
        result_text = completion.choices[0].message.content
        
        # محاولة استخراج JSON من الرد
        try:
            # لو فيه ```json ... ```
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            result = json.loads(result_text)
        except json.JSONDecodeError:
            # لو مش JSON صريح، نبني structure يدوياً
            result = {
                "description": result_text[:500],
                "findings": [],
                "recommendations": ["استشر طبيباً"],
                "urgency_level": "normal",
                "urgency_message": "يرجى مراجعة طبيب لتقييم الحالة"
            }
            
        return jsonify({"success": True, "filename": file.filename, "analysis": result}), 200
        
    except Exception as e:
        logger.error(f"Image error: {e}")
        return jsonify({"error": "فشل تحليل الصورة", "details": str(e)}), 500

# ---------- البحث المباشر في قاعدة المعرفة (RAG) ----------
@app.route('/ask', methods=['POST'])
def ask_rag():
    if not RAG_AVAILABLE:
        return jsonify({'error': 'قاعدة المعرفة الطبية غير متاحة'}), 503
    data = request.get_json()
    if not data or 'query' not in data:
        return jsonify({'error': 'الاستعلام مطلوب'}), 400
    query = data['query'].strip()
    if not query:
        return jsonify({'error': 'لا يمكن أن يكون الاستعلام فارغاً'}), 400
    if any('\u0600' <= c <= '\u06FF' for c in query):
        try:
            query = GoogleTranslator(source='auto', target='en').translate(query)
        except:
            pass
    docs = retriever.invoke(query)
    results = [{"content": doc.page_content, "metadata": doc.metadata} for doc in docs]
    return jsonify({"query": query, "results": results})

# ---------- الصحة والمعلومات ----------
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok" if (client or LOCAL_MODEL_AVAILABLE) else "degraded",
        "message": "الخدمة تعمل",
        "sessions": len(sessions),
        "arabic_response": "مفعل"
    }), 200 if (client or LOCAL_MODEL_AVAILABLE) else 503

@app.route('/info', methods=['GET'])
def info():
    return jsonify({
        "name": "MediCare AI API with Session Memory & File Analysis",
        "version": "5.1",
        "description": "محادثة طبية مستمرة مع تحليل ملفات PDF والصور، بالكامل بالعربية",
        "lang": "Arabic",
        "endpoints": ["/chat (POST multipart)", "/predict (POST JSON)", "/analyze-report (POST file)", "/analyze-image (POST file)", "/ask (POST JSON)", "/health", "/info"]
    })

if __name__ == '__main__':
    port = int(os.environ.get('API_PORT', 7860))
    app.run(host='0.0.0.0', port=port, debug=False)