from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import json
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# ── Groq Client ──────────────────────────────────
try:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        logger.warning("GROQ_API_KEY not set. API will fail without this key.")
    client = Groq(api_key=api_key)
except Exception as e:
    logger.error(f"Failed to initialize Groq client: {e}")
    client = None

# ── System Prompt الطبي ───────────────────────────
SYSTEM_PROMPT = """You are MediCare AI, an expert medical assistant. 
When a patient describes their symptoms, analyze them and respond ONLY with a valid JSON object in this exact format:

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
- Be medically accurate
- Do NOT add any text outside the JSON

Urgency guidelines:
- critical: chest pain, difficulty breathing, stroke symptoms, severe bleeding
- moderate: high fever, severe pain, infection signs
- normal: mild symptoms, routine checkup needed
"""

@app.route('/predict', methods=['POST'])
def predict():
    """
    Analyze patient symptoms and provide medical triage information.
    
    Expected JSON: {"symptoms": "patient symptoms description"}
    """
    if not client:
        return jsonify({'error': 'AI service not initialized. Check GROQ_API_KEY.'}), 503
    
    data = request.get_json()

    if not data or 'symptoms' not in data:
        return jsonify({'error': 'symptoms field is required'}), 400
    
    if not isinstance(data['symptoms'], str) or len(data['symptoms'].strip()) == 0:
        return jsonify({'error': 'symptoms must be a non-empty string'}), 400

    symptoms = data['symptoms'].strip()

    try:
        logger.info(f"Processing symptoms: {symptoms[:50]}...")
        
        # ── Call Groq API ──────────────────────────
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": f"Patient symptoms: {symptoms}"
                }
            ],
            model="llama3-70b-8192",
            temperature=0.3,
            max_tokens=500
        )

        # ── Parse Response ─────────────────────────
        response_text = chat_completion.choices[0].message.content.strip()

        # Clean the response if it contains code blocks
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        result = json.loads(response_text)
        
        # Validate response structure
        response = {
            'symptoms': symptoms,
            'diagnosis': result.get('diagnosis', 'Unable to determine'),
            'recommended_specialty': result.get('recommended_specialty', 'General Medicine'),
            'urgency_level': result.get('urgency_level', 'normal'),
            'urgency_message': result.get('urgency_message', 'يمكنك زيارة الطبيب في أقرب وقت'),
            'tips': result.get('tips', ['استرح', 'اشرب ماء', 'راقب الأعراض']),
            'disclaimer': 'This is AI-generated preliminary analysis. Always consult a medical professional.'
        }
        
        logger.info(f"Successfully processed symptoms with urgency: {response['urgency_level']}")
        return jsonify(response)

    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {e}")
        # Return safe default response
        return jsonify({
            'symptoms': symptoms,
            'diagnosis': 'Please consult a doctor',
            'recommended_specialty': 'General Medicine',
            'urgency_level': 'normal',
            'urgency_message': 'يرجى استشارة طبيب',
            'tips': ['استرح', 'اشرب ماء كتير', 'راجع طبيب قريب'],
            'disclaimer': 'This is AI-generated preliminary analysis. Always consult a medical professional.',
            'error': 'Could not parse AI response, providing default guidance'
        })

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    status = {
        'status': 'ok' if client else 'degraded',
        'model': 'LLaMA 3 70B via Groq',
        'client_initialized': client is not None
    }
    status_code = 200 if client else 503
    return jsonify(status), status_code


@app.route('/info', methods=['GET'])
def info():
    """API information endpoint"""
    return jsonify({
        'name': 'Medical Triage AI API',
        'version': '1.0',
        'description': 'AI-powered medical symptom analysis and triage',
        'endpoints': [
            {'path': '/predict', 'method': 'POST', 'description': 'Analyze symptoms'},
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