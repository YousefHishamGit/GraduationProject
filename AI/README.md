# Medical Triage AI System

A machine learning-powered medical triage system that analyzes patient symptoms and provides preliminary diagnostic information using AI.

## 🏥 Features

- **Symptom Analysis**: Processes patient symptoms in English and Arabic
- **AI-Powered Diagnosis**: Uses Groq's LLaMA 3 70B model for intelligent analysis
- **Medical Triage**: Classifies urgency levels (critical, moderate, normal)
- **Specialty Recommendation**: Suggests appropriate medical specialties
- **Multilingual Support**: Handles both Arabic and English input
- **REST API**: Easy-to-use Flask API for integration

## 📋 Project Structure

```
AI/
├── Api/                 # Flask REST API
│   ├── app.py          # Main Flask application
│   ├── predict.py      # ML prediction logic
│   ├── Dockerfile      # Docker configuration
│   └── requirements.txt # API dependencies
├── Training/           # Model training scripts
│   ├── train.py        # Model training
│   ├── preprocess.py   # Data preprocessing
├── Model/              # Trained models
│   ├── model.pkl       # Main triage model
│   ├── specialty_model.pkl # Specialty classifier
│   └── vectorizer.pkl  # TF-IDF vectorizer
├── DataSet/            # Training data
│   └── symptoms.csv    # Medical symptoms dataset
└── requirements.txt    # Project dependencies
```

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Groq API Key (from [Groq Console](https://console.groq.com))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AI
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set environment variables:
```bash
export GROQ_API_KEY="your-api-key-here"
```

### Running the API

```bash
cd Api
python app.py
```

The API will be available at `http://localhost:7860`

### Docker Deployment

```bash
cd Api
docker build -t medical-triage-api .
docker run -e GROQ_API_KEY="your-key" -p 7860:7860 medical-triage-api
```

## 📚 API Endpoints

### POST `/predict`
Analyzes patient symptoms and provides diagnosis recommendation.

**Request:**
```json
{
  "symptoms": "chest pain and shortness of breath"
}
```

**Response:**
```json
{
  "symptoms": "chest pain and shortness of breath",
  "diagnosis": "Acute coronary syndrome",
  "recommended_specialty": "Cardiology",
  "urgency_level": "critical",
  "urgency_message": "يحتاج علاج فوري في المستشفى",
  "tips": [
    "اتصل بالإسعاف فوراً",
    "خذ الأسبرين إذا أمكن",
    "حاول تهدئة نفسك"
  ]
}
```

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "model": "LLaMA 3 70B via Groq"
}
```

## 🤖 Model Details

- **Architecture**: TF-IDF Vectorizer + Logistic Regression
- **Training Data**: Medical symptoms dataset
- **Primary LLM**: Groq LLaMA 3 70B (for final diagnosis)
- **Language Support**: English and Arabic
- **Input**: Natural language symptom descriptions
- **Output**: JSON with diagnosis, specialty, urgency, and tips

## ⚙️ Environment Variables

```
GROQ_API_KEY      # Your Groq API key (required)
```

## 📝 Training

To retrain the model with new data:

```bash
cd Training
python train.py
```

The script will:
1. Load the symptoms dataset
2. Preprocess the text
3. Train TF-IDF vectorizer
4. Train triage and specialty models
5. Save models to `../Model/`

## ⚠️ Important Notes

- **Medical Disclaimer**: This system provides preliminary analysis only. Always consult qualified medical professionals for actual diagnosis and treatment.
- **API Key**: Keep your Groq API key secure and never commit it to version control
- **Rate Limiting**: Groq API has rate limits; monitor your usage
- **Data Privacy**: This system doesn't store patient data permanently

## 🔄 Model Updates

Models are automatically saved after training:
- `model.pkl` - Triage classification model
- `specialty_model.pkl` - Specialty recommendation model
- `vectorizer.pkl` - Text vectorizer for preprocessing

## 📄 License

This project is part of a graduation project for medical system development.

## 👥 Support

For issues, questions, or improvements, please open an issue in the repository.

---

**Version**: 1.0  
**Last Updated**: May 2026
