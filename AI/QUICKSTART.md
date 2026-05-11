# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Option 1: Using Docker (Recommended)

```bash
# 1. Set up environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# 2. Build and run
cd Api
docker build -t medical-triage-api .
docker run -e GROQ_API_KEY="your-key-here" -p 7860:7860 medical-triage-api

# 3. Test the API
curl -X POST http://localhost:7860/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "chest pain"}'
```

### Option 2: Local Python

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set API key
export GROQ_API_KEY="your-key-here"  # On Windows: set GROQ_API_KEY=your-key-here

# 4. Run the API
cd Api
python app.py

# 5. Test in another terminal
curl -X POST http://localhost:7860/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "high fever and cough"}'
```

### Option 3: Docker Compose

```bash
# 1. Set up environment
cp .env.example .env
# Edit .env with your GROQ_API_KEY

# 2. Run
docker-compose up

# 3. Test
curl http://localhost:7860/health
```

## 📝 API Examples

### Health Check

```bash
curl http://localhost:7860/health
```

Response:
```json
{
  "status": "ok",
  "model": "LLaMA 3 70B via Groq",
  "client_initialized": true
}
```

### API Info

```bash
curl http://localhost:7860/info
```

### Predict Symptoms

```bash
curl -X POST http://localhost:7860/predict \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": "persistent headache, high fever, and stiff neck"
  }'
```

Response:
```json
{
  "symptoms": "persistent headache, high fever, and stiff neck",
  "diagnosis": "Meningitis or similar CNS infection",
  "recommended_specialty": "Infectious Disease",
  "urgency_level": "critical",
  "urgency_message": "اطلب الإسعاف فوراً - حالة حرجة",
  "tips": [
    "اتصل بالإسعاف فوراً",
    "لا تأخر - قد تكون حالة خطيرة",
    "اذهب للمستشفى على الفور"
  ],
  "disclaimer": "This is AI-generated preliminary analysis. Always consult a medical professional."
}
```

### With Python

```python
import requests
import json

API_URL = "http://localhost:7860/predict"

symptoms = "chest pain, shortness of breath, dizziness"
data = {"symptoms": symptoms}

response = requests.post(API_URL, json=data)
result = response.json()

print(json.dumps(result, indent=2, ensure_ascii=False))
```

## 🧪 Testing

### Run Tests

```bash
# Install test dependencies
pip install -r requirements-dev.txt

# Run tests
pytest tests/

# With coverage
pytest --cov=. tests/
```

### Manual Testing

Use the provided `examples.sh` script:

```bash
bash examples.sh
```

## 📦 Deployment to Hugging Face

See [HF_SPACES_DEPLOYMENT.md](HF_SPACES_DEPLOYMENT.md) for detailed instructions.

Quick version:
```bash
# Create Space on HF
# Clone it locally
# Copy your code
# Set GROQ_API_KEY secret
# Push code
```

## 🔑 Environment Setup

Create `.env` file:

```env
GROQ_API_KEY=your-groq-api-key-here
FLASK_ENV=production
FLASK_DEBUG=False
API_HOST=0.0.0.0
API_PORT=7860
```

Get your API key:
1. Go to https://console.groq.com
2. Create account or login
3. Generate API key
4. Copy to `.env` file

## 📊 Check Logs

```bash
# View Docker logs
docker logs <container-id>

# Follow logs
docker logs -f <container-id>

# View last 50 lines
docker logs --tail 50 <container-id>
```

## 🐛 Troubleshooting

### API not responding?
```bash
# Check if service is running
curl http://localhost:7860/health

# Check if port is in use
lsof -i :7860  # On Windows: netstat -ano | findstr :7860

# Check logs
docker logs <container-id>
```

### Getting errors?
- Verify GROQ_API_KEY is set
- Check API key validity
- Ensure internet connection to Groq API
- Check Python version (3.10+)

### Model not found?
```bash
# Make sure models are in the right place
ls Model/
# Should show: model.pkl, specialty_model.pkl, vectorizer.pkl

# If missing, train them
cd Training
python train.py
```

## ✨ Next Steps

1. ✅ Get API running locally
2. ✅ Test endpoints
3. ✅ Configure environment properly
4. 🔄 Deploy to Hugging Face Spaces
5. 🔄 Integrate with frontend
6. 🔄 Monitor in production

---

**Need help?** Check [README.md](README.md) or [HF_SPACES_DEPLOYMENT.md](HF_SPACES_DEPLOYMENT.md)
