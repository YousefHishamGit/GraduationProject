from flask import Flask, request, jsonify
import sys
import pickle
sys.path.insert(0, "../Training")
from preprocess import clean_text, normalize_symptoms
from deep_translator import GoogleTranslator

app = Flask(__name__)

model = pickle.load(open("../Model/model.pkl", "rb"))
specialty_model = pickle.load(open("../Model/specialty_model.pkl", "rb"))
vectorizer = pickle.load(open("../Model/vectorizer.pkl", "rb"))

TIPS = {
    "critical": {
        "urgency_message": "اتصل بالإسعاف فوراً",
        "tips": ["لا تتحرك", "اطلب المساعدة فوراً", "لا تأكل أو تشرب"]
    },
    "moderate": {
        "urgency_message": "يرجى زيارة الطبيب خلال 24 ساعة",
        "tips": ["استرح", "اشرب ماء كتير", "خذ مسكن ألم لو محتاج"]
    },
    "normal": {
        "urgency_message": "يمكنك زيارة الطبيب في أقرب وقت مناسب",
        "tips": ["استرح", "اشرب ماء", "راقب الأعراض"]
    }
}

def translate_to_english(text):
    try:
        return GoogleTranslator(source='auto', target='en').translate(text)
    except:
        return text

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    if not data or 'symptoms' not in data:
        return jsonify({'error': 'symptoms field is required'}), 400

    symptoms = data['symptoms']
    translated = translate_to_english(symptoms)
    cleaned = clean_text(translated)
    normalized = normalize_symptoms(cleaned)

    X = vectorizer.transform([normalized])
    triage = model.predict(X)[0]
    specialty = specialty_model.predict(X)[0]

    tips_data = TIPS.get(triage, TIPS["normal"])

    return jsonify({
        'symptoms': symptoms,
        'translated': translated,
        'diagnosis': triage,
        'recommended_specialty': specialty,
        'urgency_message': tips_data['urgency_message'],
        'tips': tips_data['tips']
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)