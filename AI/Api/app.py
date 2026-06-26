from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import pickle
import json
import os
from dotenv import load_dotenv
import logging
import base64
import io
import PyPDF2
from google import genai
from PIL import Image
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from deep_translator import GoogleTranslator
import uuid
import re
from datetime import datetime, timedelta
from copy import deepcopy
from typing import Optional, Tuple
from prompts.dr_aida import (
    DR_AIDA_SYSTEM_PROMPT,
    DR_AIDA_IMAGE_PROMPT,
    DR_AIDA_PDF_PROMPT,
    DEFAULT_SESSION_DATA,
)

_api_dir = os.path.dirname(os.path.abspath(__file__))
_ai_dir = os.path.dirname(_api_dir)
def _valid_api_key(key: Optional[str], min_len: int = 20) -> bool:
    if not key or len(key.strip()) < min_len:
        return False
    low = key.lower()
    if "your_key" in low or "your-" in low or "example" in low or low.startswith("xxx"):
        return False
    return True


_env_loaded = None
for _env in (os.path.join(_ai_dir, ".env"), os.path.join(_api_dir, ".env")):
    if os.path.isfile(_env):
        load_dotenv(_env, override=True)
        _env_loaded = _env
        break
else:
    load_dotenv(override=True)
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

# ---------- Gemini (اختياري — للصور أو احتياطي) ----------
gemini_api_key = (os.environ.get("GEMINI_API_KEY") or "").strip()
gemini_model = None
GEMINI_AVAILABLE = False
if _valid_api_key(gemini_api_key) and gemini_api_key.startswith("AI"):
    try:
        genai.configure(api_key=gemini_api_key)
        gemini_model = genai.GenerativeModel("gemini-2.0-flash")
        GEMINI_AVAILABLE = True
    except Exception as e:
        logger.error(f"Gemini init error: {e}")
elif gemini_api_key:
    logger.warning("GEMINI_API_KEY موجود لكن يبدو غير صالح — سيتم تجاهله. استخدم GROQ_API_KEY.")

# ---------- Groq (مفضل للشات) ----------
client = None
groq_api_key = (os.environ.get("GROQ_API_KEY") or "").strip()
if _valid_api_key(groq_api_key):
    try:
        client = Groq(api_key=groq_api_key)
    except Exception as e:
        logger.error(f"Groq init error: {e}")
else:
    logger.warning(
        "GROQ_API_KEY غير موجود أو غير صالح. أنشئ ملف AI/.env — انظر AI/.env.example"
    )

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

GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"


def _image_mime(filename_lower: str) -> str:
    if filename_lower.endswith(".png"):
        return "image/png"
    if filename_lower.endswith(".gif"):
        return "image/gif"
    if filename_lower.endswith(".webp"):
        return "image/webp"
    return "image/jpeg"


def analyze_image_with_groq(
    file_bytes: bytes, filename_lower: str, *, vision_prompt: Optional[str] = None
) -> Optional[str]:
    if not client:
        return None
    prompt = vision_prompt or DR_AIDA_IMAGE_PROMPT
    try:
        b64 = base64.b64encode(file_bytes).decode("utf-8")
        mime = _image_mime(filename_lower)
        completion = client.chat.completions.create(
            model=GROQ_VISION_MODEL,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
                ],
            }],
            temperature=0.35,
            max_tokens=1500,
        )
        text = completion.choices[0].message.content.strip()
        logger.info("✅ Image analyzed with %s (%d chars)", GROQ_VISION_MODEL, len(text))
        return text
    except Exception as e:
        logger.error("Groq vision error (%s): %s", GROQ_VISION_MODEL, e)
        return None


def _extract_image_analysis(files_content: list) -> Optional[str]:
    for block in files_content:
        if "[تحليل الصورة" in block and "كامل]" in block:
            parts = block.split("]:\n", 1)
            return parts[1].strip() if len(parts) > 1 else block
    return None


def _extract_pdf_text(files_content: list) -> Optional[str]:
    for block in files_content:
        if "[محتوى PDF مستخرج]" in block and "فارغ" not in block:
            parts = block.split("]:\n", 1)
            return parts[1].strip() if len(parts) > 1 else ""
    return None


def _extract_pdf_report(files_content: list) -> Optional[str]:
    """تحليل جاهز (مسحوب بالرؤية أو نصي)."""
    for block in files_content:
        if "[تحليل PDF" in block and "كامل]" in block:
            parts = block.split("]:\n", 1)
            return parts[1].strip() if len(parts) > 1 else None
    return None


def render_pdf_pages_as_png(file_bytes: bytes, max_pages: int = 3) -> list:
    try:
        import fitz
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        images = []
        for i in range(min(len(doc), max_pages)):
            pix = doc[i].get_pixmap(matrix=fitz.Matrix(2, 2))
            images.append(pix.tobytes("png"))
        doc.close()
        return images
    except Exception as e:
        logger.error(f"PDF render error: {e}")
        return []


def analyze_scanned_pdf(file_bytes: bytes) -> Optional[str]:
    """PDF ممسوح (بدون نص) — تحويل صفحات لصور وتحليلها بـ Vision."""
    pages = render_pdf_pages_as_png(file_bytes)
    if not pages:
        return None
    sections = []
    for idx, png_bytes in enumerate(pages):
        if len(png_bytes) > 4 * 1024 * 1024:
            logger.warning("PDF page %d too large for vision, skipped", idx + 1)
            continue
        page_text = analyze_image_with_groq(
            png_bytes,
            "page.png",
            vision_prompt=(
                f"{DR_AIDA_PDF_PROMPT}\n\n"
                "هذه صورة لصفحة من تقرير طبي PDF (ممسوح). اقرأ الجداول والأرقام وقدّم التحليل بالهيكل أعلاه."
            ),
        )
        if page_text:
            sections.append(f"## صفحة {idx + 1}\n{page_text}")
    if sections:
        logger.info("✅ Scanned PDF analyzed via vision (%d pages)", len(sections))
    return "\n\n".join(sections) if sections else None


def analyze_pdf_with_groq(pdf_text: str) -> Optional[str]:
    if not client or not pdf_text or len(pdf_text.strip()) < 5:
        return None
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "أنت Dr. AIDA. حلل التقرير الطبي التالي بالمصري. "
                        "ممنوع رفض تحليل PDF. قدّم ملخصاً وخطوات عملية."
                    ),
                },
                {
                    "role": "user",
                    "content": f"{DR_AIDA_PDF_PROMPT}\n\n--- نص التقرير ---\n{pdf_text[:6000]}",
                },
            ],
            temperature=0.4,
            max_tokens=1500,
        )
        text = completion.choices[0].message.content.strip()
        logger.info("✅ PDF analyzed (%d chars in → %d out)", len(pdf_text), len(text))
        return text
    except Exception as e:
        logger.error(f"PDF analysis error: {e}")
        return None


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
            extracted = text.strip()
            logger.info("PDF text extraction: %d chars", len(extracted))

            if len(extracted) >= 40:
                analysis = analyze_pdf_with_groq(extracted)
                if analysis:
                    return f"[تحليل PDF نصي — كامل]:\n{analysis}"
                return f"[محتوى PDF مستخرج]:\n{extracted[:6000]}"

            scanned = analyze_scanned_pdf(file_bytes)
            if scanned:
                return f"[تحليل PDF مسحوب — كامل]:\n{scanned}"

            return "[تعذر تحليل PDF]: التقرير ممسوح ضوئياً ولم نتمكن من قراءته. جرّب صورة أوضح للصفحات."
        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
            return "[خطأ في قراءة PDF]"
            
    elif filename_lower.endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp')):
        if len(file_bytes) > 4 * 1024 * 1024:
            return "[الصورة كبيرة جداً، الحد الأقصى 4 ميجا]"
        text = analyze_image_with_groq(file_bytes, filename_lower)
        if text:
            return f"[تحليل الصورة الطبية — كامل]:\n{text}"
        if GEMINI_AVAILABLE and gemini_model:
            try:
                image = Image.open(io.BytesIO(file_bytes))
                response = gemini_model.generate_content([DR_AIDA_IMAGE_PROMPT, image])
                return f"[تحليل الصورة الطبية — كامل]:\n{response.text.strip()}"
            except Exception as e:
                logger.error(f"Gemini image error: {e}")
        return "[تعذر تحليل الصورة — تأكد من GROQ_API_KEY وأعد المحاولة]"
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

# ---------- Dr. AIDA ----------
def normalize_urgency(level: str) -> str:
    m = {"critical": "critical", "emergency": "critical", "urgent": "moderate",
         "moderate": "moderate", "non_urgent": "normal", "normal": "normal"}
    return m.get((level or "normal").lower().strip(), "normal")


def build_system_prompt(session_data: dict) -> str:
    return (
        DR_AIDA_SYSTEM_PROMPT
        + "\n\nCURRENT_SESSION_DATA:\n"
        + json.dumps(session_data, ensure_ascii=False)
    )


def _api_setup_hint() -> str:
    return (
        "أضف مفتاح Groq (مجاني) في الملف: AI/.env\n"
        "GROQ_API_KEY=gsk_xxxxxxxx\n"
        "احصل على المفتاح من: https://console.groq.com/keys\n"
        "ثم أعد تشغيل: python app.py"
    )


def invoke_chat_llm(messages: list) -> Tuple[Optional[str], Optional[str]]:
    groq_failed = False
    if client:
        try:
            r = client.chat.completions.create(
                messages=messages,
                model="llama-3.3-70b-versatile",
                temperature=0.65,
                max_tokens=1400,
            )
            return r.choices[0].message.content.strip(), None
        except Exception as e:
            groq_failed = True
            logger.error(f"Groq error: {e}")
            err = str(e).lower()
            if "invalid_api_key" in err or "401" in err:
                return None, "مفتاح Groq غير صالح. راجع GROQ_API_KEY في AI/.env\n" + _api_setup_hint()

    if GEMINI_AVAILABLE and gemini_model:
        try:
            prompt = "\n".join(f"{m['role']}: {m['content']}" for m in messages)
            return gemini_model.generate_content(prompt).text.strip(), None
        except Exception as e:
            logger.error(f"Gemini error: {e}")

    if not client:
        return None, _api_setup_hint()
    if groq_failed:
        return None, "فشل Groq ولا يوجد Gemini صالح. " + _api_setup_hint()
    return None, "تعذر الاتصال بالذكاء الاصطناعي. " + _api_setup_hint()


SYSTEM_PROMPT_AR = """أنت Dr. AIDA، مساعد طبي خبير.
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
لا تقترح زيارة الطبيب في نهاية الرد إذا كانت الحالة غير حرجة. بدلاً من ذلك، قدم إجراءات منزلية أو خطوات متابعة واضحة.
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
            "last_used": datetime.now(),
            "session_data": deepcopy(DEFAULT_SESSION_DATA),
        }

    session = sessions[session_id]
    session["last_used"] = datetime.now()
    history = session["history"]
    session_data = session.setdefault("session_data", deepcopy(DEFAULT_SESSION_DATA))

    # قراءة الرسالة والملفات
    user_message = ""
    lang = "ar"
    files_content = []
    uploaded_image_names = []
    uploaded_pdf_names = []

    if request.is_json:
        data = request.get_json()
        user_message = data.get('message', '') or ''
        lang = data.get('lang', 'ar') or 'ar'
        files_data = data.get('files', [])
        for f in files_data:
            try:
                fname = f.get('name', 'unknown')
                fl = fname.lower()
                if fl.endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp')):
                    uploaded_image_names.append(fname)
                elif fl.endswith('.pdf'):
                    uploaded_pdf_names.append(fname)
                file_bytes = base64.b64decode(f['content'])
                logger.info("📎 File received: %s (%d bytes)", fname, len(file_bytes))
                content = extract_file_content_from_bytes(file_bytes, fname)
                files_content.append(content)
            except Exception as e:
                logger.error(f"Error processing base64 file: {e}")
                files_content.append(f"[خطأ في قراءة الملف: {f.get('name', '?')}]")
    else:
        user_message = request.form.get('message', '') or ''
        lang = request.form.get('lang', 'ar') or 'ar'
        uploaded_files = request.files.getlist('files')
        for file in uploaded_files:
            if file and file.filename:
                content = extract_file_content(file)
                files_content.append(content)

    is_english = (lang.lower() == 'en') or (user_message and not any('\u0600' <= c <= '\u06FF' for c in user_message))

    image_analysis = _extract_image_analysis(files_content)
    pdf_report = _extract_pdf_report(files_content)
    pdf_text = _extract_pdf_text(files_content)
    if not pdf_report and pdf_text and len(pdf_text.strip()) >= 40:
        pdf_report = analyze_pdf_with_groq(pdf_text)

    _fail_markers = ("تعذر تحليل", "الصورة مرفوعة", "خطأ في تحليل", "أضف GROQ", "4 ميجا")
    image_failed = any(any(m in c for m in _fail_markers) for c in files_content)
    image_uploaded = bool(uploaded_image_names) or any("[تحليل الصورة" in c for c in files_content)
    if uploaded_image_names and not image_analysis:
        image_failed = True

    pdf_failed = any(
        "خطأ في قراءة PDF" in c or "تعذر تحليل PDF" in c for c in files_content
    )
    pdf_uploaded = bool(uploaded_pdf_names) or bool(pdf_report) or bool(pdf_text)
    if uploaded_pdf_names and not pdf_report:
        pdf_failed = True

    image_only = image_uploaded and not pdf_uploaded and len((user_message or "").strip()) < 15
    pdf_only = pdf_uploaded and not image_uploaded and len((user_message or "").strip()) < 15

    if image_analysis:
        session_data["image_uploaded"] = True
        session_data["current_phase"] = "IMAGE"
    if pdf_report:
        session_data["current_phase"] = "PDF"

    # استخراج الاسم من المحادثة إن وُجد
    for h in reversed(history):
        if h.get("role") == "user" and "اسمي" in h.get("content", ""):
            m = re.search(r"اسمي\s+(\S+)", h["content"])
            if m:
                session_data["patient_name"] = m.group(1)
            break
    if "اسمي" in (user_message or ""):
        m = re.search(r"اسمي\s+(\S+)", user_message)
        if m:
            session_data["patient_name"] = m.group(1)

    if files_content:
        combined = (user_message + "\n\n" + "\n\n".join(files_content)).strip()
        if pdf_report or pdf_text:
            combined += (
                "\n\n[تعليمات: تم رفع PDF وتحليله. اعرض التحليل للمريض. ممنوع رفض PDF.]"
            )
    else:
        combined = user_message

    if is_english and combined.strip():
        combined += "\n\n[Instruction: The patient is communicating in English. Please write your entire response, including all sections, in English. Do not write any Arabic in your response.]"

    if not combined.strip():
        return jsonify({"error": "لا توجد رسالة أو ملفات للمعالجة"}), 400

    pdf_in_text_only = (
        not uploaded_pdf_names
        and not files_content
        and re.search(r"\.pdf\b|📎|تقرير\s*(طبي|تحاليل)?", user_message or "", re.I)
    )
    if pdf_in_text_only:
        hint = (
            "📎 **ملف PDF لم يُرفع للخادم**\n\n"
            "كتابة اسم الملف في الشات مش كفاية — لازم ترفع الملف:\n"
            "1) اضغط أيقونة 📎 بجانب مربع الكتابة\n"
            "2) اختر ملف PDF من جهازك\n"
            "3) اضغط إرسال (ممكن تكتب «حلّل التقرير»)\n\n"
            "أو اضغط **«تحليل تقرير تجريبي»** في رسالة الترحيب."
        )
        history.append({"role": "user", "content": user_message})
        history.append({"role": "assistant", "content": hint})
        return jsonify({"sessionId": session_id, "reply": hint, "diagnosis": None})

    history.append({"role": "user", "content": combined})
    if len(history) > 30:
        history[:] = history[-30:]

    diagnosis_data = None
    pname = session_data.get("patient_name") or ""

    # ── فشل تحليل الصورة ──
    if image_uploaded and image_failed:
        response_text = (
            "عذراً، لم أتمكن من تحليل الصورة.\n\n"
            f"🔧 نموذج التحليل الحالي: `{GROQ_VISION_MODEL}`\n\n"
            "**لازم تعيد تشغيل الخادم:**\n"
            "1) في طرفية Python اضغط **Ctrl+C**\n"
            "2) ثم: `python app.py`\n"
            "3) تأكد يظهر: `Vision: meta-llama/llama-4-scout...`\n\n"
            "• الصورة: jpg أو png وأقل من 4 ميجا\n"
            "• أو اكتب وصف اللي في الصورة وأنا أساعدك"
        )
    elif uploaded_pdf_names and not files_content:
        response_text = (
            "لم يصل ملف PDF للخادم.\n\n"
            "📎 اضغط أيقونة المرفقات واختر الملف، ثم اكتب «حلّل التقرير»."
        )
    elif pdf_uploaded and pdf_failed:
        response_text = (
            "عذراً، لم أتمكن من تحليل ملف PDF.\n\n"
            "• تأكد أن الملف مرفوع عبر 📎 (وليس اسم الملف في النص فقط)\n"
            "• أعد تشغيل الخادم إن استمرت المشكلة\n"
            "• أو ارفع صورة واضحة لصفحات التقرير"
        )
    elif pdf_report:
        greet = f"شكراً على التقرير{' يا ' + pname if pname else ''}.\n\n"
        response_text = greet + pdf_report
    elif image_analysis:
        greet = f"شكراً على الصورة{' يا ' + pname if pname else ''}.\n\n"
        if image_only:
            response_text = greet + image_analysis
        else:
            polish = [
                {
                    "role": "system",
                    "content": (
                        "أنت Dr. AIDA. التحليل البصري جاهز. اعرضه للمريض بالمصري. "
                        "ممنوع «إيه في الصورة».\n\n" + image_analysis
                    ),
                },
                {"role": "user", "content": user_message or "حلّل الصورة وقولي أعمل إيه"},
            ]
            response_text, llm_error = invoke_chat_llm(polish)
            if not response_text:
                response_text = greet + image_analysis
            elif pname and pname not in response_text:
                response_text = greet + response_text
    else:
        llm_messages = [{"role": "system", "content": build_system_prompt(session_data)}]
        llm_messages.extend(history)
        rag_context = get_medical_context(history[-1]["content"])
        if rag_context:
            llm_messages[-1]["content"] = rag_context + "\n" + llm_messages[-1]["content"]
        response_text, llm_error = invoke_chat_llm(llm_messages)
        if not response_text:
            response_text = f"عذراً، {llm_error}"

    diag_match = re.search(r'<diagnosis>(.*?)</diagnosis>', response_text or "", re.DOTALL)
    if diag_match:
        try:
            d = json.loads(diag_match.group(1).strip())
            urg = normalize_urgency(d.get("urgency_level", "normal"))
            spec = (d.get("recommended_specialty") or "").strip()
            if urg == "normal":
                spec = ""
            diagnosis_data = {
                "diagnosis": d.get("diagnosis", ""),
                "recommended_specialty": spec,
                "urgency_level": urg,
            }
            response_text = re.sub(r'<diagnosis>.*?</diagnosis>', '', response_text, flags=re.DOTALL).strip()
        except Exception:
            pass

    # تأكيد أن الرد بالعربية (فقط إذا لم يكن المستخدم يتحدث بالإنجليزية)
    if not is_english and not any('\u0600' <= c <= '\u06FF' for c in response_text):
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
            
        fn_lower = (file.filename or "img.jpg").lower()
        analysis_text = analyze_image_with_groq(img_bytes, fn_lower)
        if not analysis_text:
            return jsonify({"error": "فشل تحليل الصورة. أعد المحاولة."}), 500
        result_text = analysis_text
        
        # محاولة استخراج JSON من الرد
        try:
            # لو فيه ```json ... ```
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            result = json.loads(result_text)
        except json.JSONDecodeError:
            result = {
                "description": result_text,
                "findings": [],
                "recommendations": [],
                "full_analysis": result_text,
                "urgency_level": "normal",
                "urgency_message": "اتبع الخطوات في التحليل. طوارئ: اتصل 123 عند الأعراض الخطيرة المذكورة.",
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

@app.route('/config-check', methods=['GET'])
def config_check():
    return jsonify({
        "env_file": _env_loaded or "not found — create AI/.env",
        "groq_configured": bool(client),
        "vision_model": GROQ_VISION_MODEL,
        "gemini_configured": GEMINI_AVAILABLE,
        "server_needs_restart": True,
        "hint": None if client else _api_setup_hint(),
    })


if __name__ == '__main__':
    logger.info(
        "Env: %s | Groq chat: %s | Vision: %s | Gemini: %s",
        _env_loaded or "none",
        "OK" if client else "MISSING",
        GROQ_VISION_MODEL if client else "n/a",
        "OK" if GEMINI_AVAILABLE else "off",
    )
    if not client:
        logger.warning(_api_setup_hint().replace("\n", " "))
    port = int(os.environ.get('API_PORT', 7860))
    app.run(host='0.0.0.0', port=port, debug=False)