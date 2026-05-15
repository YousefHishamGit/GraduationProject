from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import json
import os
from dotenv import load_dotenv
import logging

# ── RAG additions ─────────────────────────────────
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from deep_translator import GoogleTranslator

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# ── Translation helper (for guaranteed Arabic output) ──
def translate_to_arabic(text: str) -> str:
    """Translate English text to Arabic using GoogleTranslator."""
    if not text or not isinstance(text, str) or len(text.strip()) < 2:
        return text
    # Avoid re-translating if text is already Arabic (contains Arabic unicode range)
    if any('\u0600' <= c <= '\u06FF' for c in text):
        return text
    try:
        translator = GoogleTranslator(source='en', target='ar')
        translated = translator.translate(text)
        return translated if translated else text
    except Exception as e:
        logger.warning(f"Translation failed for text '{text[:30]}...': {e}")
        return text

# ── Groq Client ──────────────────────────────────
try:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        logger.warning("GROQ_API_KEY not set. Please set it in .env file.")
        client = None
    else:
        client = Groq(api_key=api_key)
except Exception as e:
    logger.error(f"Failed to initialize Groq client: {e}")
    client = None

# ── Local Model Fallback ─────────────────────────
import sys
import pickle
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../Training')))
try:
    from preprocess import clean_text, normalize_symptoms
    LOCAL_MODEL_AVAILABLE = True
    local_triage_model = pickle.load(open(os.path.join(os.path.dirname(__file__), "../Model/model.pkl"), "rb"))
    local_specialty_model = pickle.load(open(os.path.join(os.path.dirname(__file__), "../Model/specialty_model.pkl"), "rb"))
    local_vectorizer = pickle.load(open(os.path.join(os.path.dirname(__file__), "../Model/vectorizer.pkl"), "rb"))
except Exception as e:
    logger.error(f"Failed to load local models: {e}")
    LOCAL_MODEL_AVAILABLE = False

# ── Load Medical Vector Database (RAG) ───────────
MEDICAL_DB_PATH = "./medical_db"  # تأكد أن هذا المسار صحيح
RAG_AVAILABLE = False
retriever = None
try:
    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectorstore = Chroma(persist_directory=MEDICAL_DB_PATH, embedding_function=embedding_model)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    RAG_AVAILABLE = True
    logger.info("✅ Medical vector database loaded successfully!")
except Exception as e:
    logger.warning(f"Could not load medical_db: {e}. RAG will be disabled.")

def get_medical_context(query: str) -> str:
    """Retrieve relevant medical Q&A from vector database."""
    if not RAG_AVAILABLE or retriever is None:
        return ""
    try:
        # Translate Arabic query to English for better retrieval
        if any('\u0600' <= c <= '\u06FF' for c in query):
            try:
                query_en = GoogleTranslator(source='auto', target='en').translate(query)
                logger.info(f"Translated query: {query} -> {query_en}")
            except:
                query_en = query
        else:
            query_en = query
        
        docs = retriever.invoke(query_en)
        if not docs:
            return ""
        context = "\n\n".join([doc.page_content for doc in docs])
        return f"Relevant medical knowledge from trusted database:\n{context}\n\n"
    except Exception as e:
        logger.error(f"RAG retrieval error: {e}")
        return ""

# ── System Prompt الطبي ───────────────────────────
SYSTEM_PROMPT = """You are MediCare AI, an expert medical assistant.
When a patient describes their symptoms, you will be given a "Relevant medical knowledge" section as part of the user's message. Use that knowledge to answer accurately and to support your diagnosis.

Respond ONLY with a valid JSON object in this exact format:

{
  "diagnosis": "Brief medical diagnosis or most likely condition",
  "recommended_specialty": "Medical specialty (e.g. Cardiology, Neurology, etc.)",
  "urgency_level": "critical OR moderate OR normal",
  "urgency_message": "Arabic urgency message",
  "tips": ["tip1 in Arabic", "tip2 in Arabic", "tip3 in Arabic"]
}

Rules:
- urgency_level must be exactly: critical, moderate, or normal
- urgency_message in Arabic
- tips array must have 3 items in Arabic
- diagnosis in English
- recommended_specialty in English
- Be medically accurate and rely on the provided knowledge when possible
- Do NOT add any text outside the JSON

Urgency guidelines:
- critical: chest pain, difficulty breathing, stroke symptoms, severe bleeding
- moderate: high fever, severe pain, infection signs
- normal: mild symptoms, routine checkup needed
"""

# ── Chat System Prompt (Conversational) ───────────
CHAT_SYSTEM_PROMPT = """You are MediCare AI, a friendly and professional medical assistant chatbot.
You have a natural, empathetic conversation with patients about their health concerns.

**Important:** You will sometimes receive "Relevant medical knowledge" as part of the user's message. Use this information to provide accurate, evidence-based answers to the patient's questions. If the knowledge is provided, prioritize it over your general knowledge.

Conversation guidelines:
- Greet the patient warmly if it's the start of the conversation
- Ask clarifying follow-up questions about their symptoms (location, duration, severity, etc.)
- Show empathy and understanding
- Provide helpful medical information and advice, especially using the retrieved knowledge if available
- When you have enough information, provide your assessment
- Always remind patients that this is preliminary guidance and they should see a real doctor
- You can respond in Arabic or English depending on what the patient uses
- Keep responses concise but helpful (2-4 sentences typically)
- If the patient describes an emergency (chest pain, difficulty breathing, severe bleeding), immediately advise them to call emergency services (123)

When you feel you have gathered enough information to provide an assessment, include a JSON block at the END of your message wrapped in <diagnosis> tags like this:
<diagnosis>
{"diagnosis": "condition name", "recommended_specialty": "specialty", "urgency_level": "critical|moderate|normal"}
</diagnosis>

But ONLY include the diagnosis block when you're confident enough to make an assessment. Otherwise, just continue the conversation naturally.
"""

@app.route('/chat', methods=['POST'])
def chat():
    """
    Multi-turn conversational chat endpoint with RAG context injection into the last user message.
    """
    if not client:
        return jsonify({'error': 'AI chat service not available. Check GROQ_API_KEY.'}), 503
    
    data = request.get_json()
    if not data or 'messages' not in data:
        return jsonify({'error': 'messages field is required'}), 400
    if not isinstance(data['messages'], list) or len(data['messages']) == 0:
        return jsonify({'error': 'messages must be a non-empty array'}), 400

    try:
        # Get the last user message for RAG retrieval
        last_user_msg = ""
        last_user_index = -1
        for i, msg in enumerate(data['messages']):
            if msg.get('role') == 'user':
                last_user_msg = msg.get('content', '')
                last_user_index = i
        
        # Retrieve medical context based on the last user message
        medical_context = get_medical_context(last_user_msg) if last_user_msg else ""
        
        # Build messages for Groq
        groq_messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}]
        
        # Inject RAG context into the last user message
        augmented_messages = []
        for idx, msg in enumerate(data['messages']):
            if idx == last_user_index and medical_context:
                original_content = msg.get('content', '')
                augmented_content = f"{medical_context}\n\nBased on the above medical knowledge, answer the patient's question naturally.\n\nPatient: {original_content}"
                augmented_messages.append({"role": "user", "content": augmented_content})
                logger.info("RAG context injected into last user message")
            else:
                augmented_messages.append(msg)
        
        for msg in augmented_messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            if role in ('user', 'assistant') and content.strip():
                groq_messages.append({"role": role, "content": content})

        logger.info(f"Chat request with {len(data['messages'])} messages (RAG used: {bool(medical_context)})")

        chat_completion = client.chat.completions.create(
            messages=groq_messages,
            model="llama-3.3-70b-versatile",
            temperature=0.6,
            max_tokens=800
        )
        response_text = chat_completion.choices[0].message.content.strip()
        
        # Extract diagnosis block if present
        diagnosis = None
        clean_text_response = response_text
        if '<diagnosis>' in response_text and '</diagnosis>' in response_text:
            try:
                diag_start = response_text.index('<diagnosis>') + len('<diagnosis>')
                diag_end = response_text.index('</diagnosis>')
                diag_json = response_text[diag_start:diag_end].strip()
                diagnosis = json.loads(diag_json)
                # Translate diagnosis fields if present
                if diagnosis:
                    if 'diagnosis' in diagnosis:
                        diagnosis['diagnosis'] = translate_to_arabic(diagnosis['diagnosis'])
                    if 'recommended_specialty' in diagnosis:
                        diagnosis['recommended_specialty'] = translate_to_arabic(diagnosis['recommended_specialty'])
                    # urgency_level stays as is (critical/moderate/normal)
                clean_text_response = response_text[:response_text.index('<diagnosis>')].strip()
            except (json.JSONDecodeError, ValueError):
                pass

        # Translate the reply text to Arabic
        arabic_reply = translate_to_arabic(clean_text_response) if clean_text_response else ""

        response = {
            'reply': arabic_reply,
            'diagnosis': diagnosis,
            'rag_used': bool(medical_context)
        }
        logger.info(f"Chat response sent (has_diagnosis: {diagnosis is not None}, rag_used: {bool(medical_context)})")
        return jsonify(response)

    except Exception as e:
        logger.error(f"Chat error: {str(e)}", exc_info=True)
        return jsonify({'error': f'Chat processing failed: {str(e)}'}), 500

@app.route('/predict', methods=['POST'])
def predict():
    """
    Analyze patient symptoms and provide medical triage information, enhanced with RAG.
    """
    if not client and not LOCAL_MODEL_AVAILABLE:
        return jsonify({'error': 'AI service not initialized and local model unavailable.'}), 503
    
    data = request.get_json()
    if not data or 'symptoms' not in data:
        return jsonify({'error': 'symptoms field is required'}), 400
    if not isinstance(data['symptoms'], str) or len(data['symptoms'].strip()) == 0:
        return jsonify({'error': 'symptoms must be a non-empty string'}), 400

    symptoms = data['symptoms'].strip()

    try:
        logger.info(f"Processing symptoms: {symptoms[:50]}...")
        
        # Fallback to local model if Groq not available
        if not client:
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
                'diagnosis': translate_to_arabic('Unknown (Local Fallback)'),
                'recommended_specialty': translate_to_arabic(specialty),
                'urgency_level': triage,
                'urgency_message': 'تم التقييم بواسطة النموذج المحلي',
                'tips': [translate_to_arabic('Consult a doctor'), translate_to_arabic('This is a preliminary assessment using local model')],
                'disclaimer': 'This is AI-generated preliminary analysis using a local fallback model.',
                'rag_used': False
            }
            logger.info(f"Processed symptoms locally, urgency: {response['urgency_level']}")
            return jsonify(response)
        
        # Groq with RAG – inject context into the user message
        medical_context = get_medical_context(symptoms)
        user_message = f"Patient symptoms: {symptoms}"
        if medical_context:
            user_message = f"{medical_context}\nBased on the above medical knowledge, answer the following:\nPatient symptoms: {symptoms}"
            logger.info("RAG context injected into user message for /predict")
        
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=500
        )

        response_text = chat_completion.choices[0].message.content.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        result = json.loads(response_text)
        
        # Translate relevant fields to Arabic
        diagnosis_ar = translate_to_arabic(result.get('diagnosis', 'Unable to determine'))
        specialty_ar = translate_to_arabic(result.get('recommended_specialty', 'General Medicine'))
        urgency_message_ar = result.get('urgency_message', 'يمكنك زيارة الطبيب في أقرب وقت')
        # urgency_message may already be Arabic, but we can pass as is
        tips_ar = [translate_to_arabic(tip) for tip in result.get('tips', ['استرح', 'اشرب ماء', 'راقب الأعراض'])]
        
        response = {
            'symptoms': symptoms,
            'diagnosis': diagnosis_ar,
            'recommended_specialty': specialty_ar,
            'urgency_level': result.get('urgency_level', 'normal'),
            'urgency_message': urgency_message_ar,
            'tips': tips_ar,
            'disclaimer': 'This is AI-generated preliminary analysis. Always consult a medical professional.',
            'rag_used': bool(medical_context)
        }
        logger.info(f"Processed symptoms with urgency: {response['urgency_level']}")
        return jsonify(response)

    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {e}")
        return jsonify({
            'symptoms': symptoms,
            'diagnosis': translate_to_arabic('Please consult a doctor'),
            'recommended_specialty': translate_to_arabic('General Medicine'),
            'urgency_level': 'normal',
            'urgency_message': 'يرجى استشارة طبيب',
            'tips': [translate_to_arabic('Rest'), translate_to_arabic('Drink water'), translate_to_arabic('See a doctor soon')],
            'disclaimer': 'This is AI-generated preliminary analysis.',
            'error': 'Could not parse AI response',
            'rag_used': False
        })
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

@app.route('/ask', methods=['POST'])
def ask_rag():
    """Direct retrieval from vector database (no LLM)."""
    if not RAG_AVAILABLE or retriever is None:
        return jsonify({'error': 'Medical database not available'}), 503
    data = request.get_json()
    if not data or 'query' not in data:
        return jsonify({'error': 'query field is required'}), 400
    query = data['query'].strip()
    if not query:
        return jsonify({'error': 'query cannot be empty'}), 400
    # Translate if needed
    if any('\u0600' <= c <= '\u06FF' for c in query):
        try:
            query = GoogleTranslator(source='auto', target='en').translate(query)
        except:
            pass
    docs = retriever.invoke(query)
    results = [{"content": doc.page_content, "metadata": doc.metadata} for doc in docs]
    return jsonify({"query": query, "results": results})

@app.route('/health', methods=['GET'])
def health():
    status = {
        'status': 'ok' if client or LOCAL_MODEL_AVAILABLE else 'degraded',
        'model': 'LLaMA 3 70B via Groq' if client else 'Local Model Fallback',
        'client_initialized': client is not None,
        'local_model_available': LOCAL_MODEL_AVAILABLE,
        'rag_available': RAG_AVAILABLE
    }
    status_code = 200 if client or LOCAL_MODEL_AVAILABLE else 503
    return jsonify(status), status_code

@app.route('/info', methods=['GET'])
def info():
    return jsonify({
        'name': 'Medical Triage AI API with RAG',
        'version': '2.0',
        'description': 'AI-powered medical symptom analysis enhanced with vector database retrieval',
        'endpoints': [
            {'path': '/predict', 'method': 'POST', 'description': 'Analyze symptoms (uses RAG if available)'},
            {'path': '/chat', 'method': 'POST', 'description': 'Multi-turn conversation (uses RAG injection)'},
            {'path': '/ask', 'method': 'POST', 'description': 'Direct retrieval from medical vector database'},
            {'path': '/health', 'method': 'GET', 'description': 'Health check'},
            {'path': '/info', 'method': 'GET', 'description': 'API information'}
        ]
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}", exc_info=True)
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('API_PORT', 7860))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)