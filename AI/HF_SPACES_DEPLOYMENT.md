# Hugging Face Spaces Deployment Guide

## Overview

This guide walks you through deploying the Medical Triage AI System to Hugging Face Spaces.

## Prerequisites

1. **Hugging Face Account**: Create one at https://huggingface.co if you don't have one
2. **Groq API Key**: Get from https://console.groq.com
3. **Git**: Installed and configured
4. **HF CLI** (Optional): `pip install huggingface_hub`

## Deployment Steps

### Step 1: Prepare Your Repository

Make sure your project structure is clean:

```
AI/
├── Api/
│   ├── app.py
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── spaces-requirements.txt
│   └── predict.py
├── Training/
├── Model/
├── DataSet/
├── README.md
├── MODEL_CARD.md
├── .gitignore
└── .env.example
```

### Step 2: Create a Hugging Face Space

1. Go to https://huggingface.co/spaces
2. Click "Create new Space"
3. Fill in details:
   - **Space name**: `medical-triage-ai` (or your choice)
   - **Space type**: `Docker`
   - **Visibility**: Public or Private
4. Click "Create Space"

### Step 3: Clone and Configure

```bash
# Clone the HF Space
git clone https://huggingface.co/spaces/<your-username>/medical-triage-ai
cd medical-triage-ai

# Copy your AI project files (excluding venv, Model folder if too large)
cp -r /path/to/AI/Api ./
cp -r /path/to/AI/Model ./
cp -r /path/to/AI/DataSet ./
cp -r /path/to/AI/Training ./
cp /path/to/AI/README.md ./
cp /path/to/AI/MODEL_CARD.md ./
cp /path/to/AI/Dockerfile ./
```

### Step 4: Create Dockerfile for HF Spaces

Create a `Dockerfile` in the root directory:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Copy requirements
COPY Api/spaces-requirements.txt requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY Api/app.py .
COPY Api/predict.py .
COPY Model Model/
COPY DataSet DataSet/
COPY Training Training/

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=7860

EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:7860/health')" || exit 1

# Run application
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=7860"]
```

### Step 5: Add Environment Variables

1. In your Space settings:
   - Go to **Settings** → **Repository secrets**
   - Add secret: `GROQ_API_KEY` = `your-api-key-here`
   - Click "Add secret"

⚠️ **Important**: Never commit your API key to the repository!

### Step 6: Create app.py Entry Point

Ensure your `app.py` has:

```python
import os
from dotenv import load_dotenv
load_dotenv()

# Your Flask app initialization here
# Make sure to use os.environ.get("GROQ_API_KEY")
```

### Step 7: Push to HF Spaces

```bash
# Add files
git add .

# Commit
git commit -m "Deploy Medical Triage AI to HF Spaces"

# Push (this triggers deployment)
git push origin main
```

The Space will automatically build and deploy. Check the "Logs" tab to monitor the build process.

## Post-Deployment

### Testing Your API

```bash
# Get your Space URL (e.g., https://huggingface.co/spaces/username/medical-triage-ai)

# Test health endpoint
curl https://huggingface.co/spaces/username/medical-triage-ai/call/health

# Test prediction
curl -X POST https://huggingface.co/spaces/username/medical-triage-ai/call/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "chest pain and shortness of breath"}'
```

### Monitoring

1. **Logs**: View in the Space's "Logs" tab
2. **Usage**: Check "Files" tab for activity
3. **Errors**: Check "Build" and "Logs" tabs

## Troubleshooting

### Build Fails

**Issue**: Docker build error

**Solutions**:
- Check requirements.txt for compatibility
- Ensure all dependencies are Python 3.10 compatible
- Check Model/ and DataSet/ sizes (may need to use git-lfs)

### API Returns 503 Error

**Issue**: Groq client not initialized

**Solutions**:
- Verify `GROQ_API_KEY` is set in Space secrets
- Restart the Space
- Check API key is valid at https://console.groq.com

### Timeout Errors

**Issue**: Requests timeout

**Solutions**:
- Increase timeout in client code
- Check Groq API status
- Monitor Space CPU/Memory usage

### Space Won't Start

**Issue**: Container fails to start

**Solutions**:
- Check `Dockerfile` syntax
- Verify all dependencies are compatible
- Check logs for specific errors
- Ensure requirements.txt doesn't have local paths

## Advanced Configuration

### Gradio Interface (Optional)

For a better user experience, create a Gradio interface instead of raw API:

```python
# Create gradio_app.py
import gradio as gr
import requests

def analyze_symptoms(symptoms):
    response = requests.post("http://localhost:7860/predict", 
                            json={"symptoms": symptoms})
    return response.json()

iface = gr.Interface(
    fn=analyze_symptoms,
    inputs=gr.Textbox(placeholder="Enter symptoms..."),
    outputs="json",
    title="Medical Triage AI",
)

if __name__ == "__main__":
    iface.launch(share=True)
```

Then update `Dockerfile`:
```dockerfile
RUN pip install gradio
CMD ["python", "-m", "gradio", "gradio_app.py", "--server-name", "0.0.0.0", "--server-port", "7860"]
```

### Using Git LFS for Large Files

If Model/ or DataSet/ are large:

```bash
# Install git-lfs
git lfs install

# Track large files
git lfs track "Model/*.pkl"
git lfs track "DataSet/*.csv"

# Commit
git add .gitattributes
git commit -m "Add LFS tracking"
git push
```

## Scaling Considerations

1. **Concurrent Requests**: Use gunicorn with multiple workers
2. **API Rate Limits**: Groq API has rate limits; implement queuing if needed
3. **Model Size**: Keep models optimized for cloud deployment
4. **Cold Start**: First request may be slow; implement warming strategy

## Cost Considerations

- **Free Tier**: 1 CPU, 8GB RAM (sufficient for this project)
- **Paid Tier**: Additional resources if needed
- **API Costs**: Groq API charges apply based on usage

## Support & Resources

- **HF Documentation**: https://huggingface.co/docs/hub/spaces
- **Docker Guide**: https://docs.docker.com/
- **Groq API**: https://console.groq.com/docs
- **Flask Guide**: https://flask.palletsprojects.com/

## Deployment Checklist

- [ ] Create Hugging Face account
- [ ] Get Groq API key
- [ ] Create HF Space (Docker type)
- [ ] Add GROQ_API_KEY to Space secrets
- [ ] Push code to Space repository
- [ ] Monitor build logs
- [ ] Test API endpoints
- [ ] Monitor performance
- [ ] Update Space description/README
- [ ] Set up monitoring/alerts if needed

---

**Happy deploying! 🚀**

For questions or issues, refer to the main [README.md](README.md) or create an issue in the repository.
