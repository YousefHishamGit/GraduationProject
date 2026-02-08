import pandas as pd
from sklearn.model_selection import train_test_split

def load_dataset():
    return pd.read_csv("../DataSet/symptoms.csv")

def split_data(df):
    X = df["symptoms"]
    y = df["triage_level"]
    return train_test_split(X, y, test_size=0.2, random_state=42)

import re

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    return text

import re

def normalize_symptoms(text: str) -> str:
    # 1. lowercase
    text = text.lower()

    # 2. remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()

    # 3. standard medical normalization rules
    medical_replacements = {
        # Breathing
        r"\b(can't|cannot|unable to) breathe\b": "shortness of breath",
        r"\b(difficult|difficulty|hard) breathing\b": "shortness of breath",
        r"\b(breathing problems?|trouble breathing)\b": "shortness of breath",

        # Chest
        r"\b(chest tightness|pressure on chest|tightness in chest)\b": "chest pain",
        r"\b(pain in chest|pain on chest)\b": "chest pain",

        # Head
        r"\b(head ache|headaches?|headeach)\b": "headache",

        # Fever
        r"\b(high temperature|very high temperature|feverish)\b": "fever",

        # Abdominal / stomach
        r"\b(stomach|belly)\b": "abdominal",
        r"\b(hurts|aching)\b": "pain",

        # Throat / cold
        r"\b(sore throat|throat pain)\b": "throat pain",
        r"\b(runny nose|nasal discharge)\b": "runny nose",
    }

    for pattern, replacement in medical_replacements.items():
        text = re.sub(pattern, replacement, text)

    return text
