import pandas as pd
from sklearn.model_selection import train_test_split
import re

def load_dataset():
    return pd.read_csv("../DataSet/symptoms.csv")

def split_data(df):
    X = df["symptoms"]
    y_triage = df["triage_level"]
    y_specialty = df["specialty"]
    return train_test_split(X, y_triage, y_specialty, test_size=0.2, random_state=42)

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    return text

def normalize_symptoms(text: str) -> str:
    text = text.lower()
    text = re.sub(r'\s+', ' ', text).strip()

    medical_replacements = {
        r"\b(can't|cannot|unable to) breathe\b": "shortness of breath",
        r"\b(difficult|difficulty|hard) breathing\b": "shortness of breath",
        r"\b(breathing problems?|trouble breathing)\b": "shortness of breath",
        r"\b(chest tightness|pressure on chest|tightness in chest)\b": "chest pain",
        r"\b(pain in chest|pain on chest)\b": "chest pain",
        r"\b(head ache|headaches?|headeach)\b": "headache",
        r"\b(high temperature|very high temperature|feverish)\b": "fever",
        r"\b(stomach|belly)\b": "abdominal",
        r"\b(hurts|aching)\b": "pain",
        r"\b(sore throat|throat pain)\b": "throat pain",
        r"\b(runny nose|nasal discharge)\b": "runny nose",
    }

    for pattern, replacement in medical_replacements.items():
        text = re.sub(pattern, replacement, text)

    return text