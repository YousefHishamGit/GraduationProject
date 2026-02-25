import sys
import pickle
import re
sys.path.insert(0, "../Training")
from preprocess import clean_text, normalize_symptoms
from deep_translator import GoogleTranslator

model = pickle.load(open("../Model/model.pkl", "rb"))
vectorizer = pickle.load(open("../Model/vectorizer.pkl", "rb"))

def translate_to_english(text):
    try:
        translated = GoogleTranslator(source='auto', target='en').translate(text)
        return translated
    except:
        return text

text = sys.argv[1]
text = translate_to_english(text)
print(f"Translated: {text}")
text = clean_text(text)
text = normalize_symptoms(text)
X = vectorizer.transform([text])
prediction = model.predict(X)[0]

print(prediction)