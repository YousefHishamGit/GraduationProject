from flask import Flask, request, jsonify
from groq import Groq
import json
import os

app = Flask(__name__)

# ── Groq Client ──────────────────────────────────
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

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
    data = request.get_json()

    if not data or 'symptoms' not in data:
        return jsonify({'error': 'symptoms field is required'}), 400

    symptoms = data['symptoms']

    try:
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

        # نظف الـ Response لو فيه ```json
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        result = json.loads(response_text)

        return jsonify({
            'symptoms': symptoms,
            'diagnosis': result.get('diagnosis', 'Unable to determine'),
            'recommended_specialty': result.get('recommended_specialty', 'General Medicine'),
            'urgency_level': result.get('urgency_level', 'normal'),
            'urgency_message': result.get('urgency_message', 'يمكنك زيارة الطبيب في أقرب وقت'),
            'tips': result.get('tips', ['استرح', 'اشرب ماء', 'راقب الأعراض'])
        })

    except json.JSONDecodeError:
        # لو الـ JSON مش صح نرجع Default
        return jsonify({
            'symptoms': symptoms,
            'diagnosis': 'Please consult a doctor',
            'recommended_specialty': 'General Medicine',
            'urgency_level': 'normal',
            'urgency_message': 'يرجى استشارة طبيب',
            'tips': ['استرح', 'اشرب ماء كتير', 'راجع طبيب قريب']
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model': 'LLaMA 3 70B via Groq'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)