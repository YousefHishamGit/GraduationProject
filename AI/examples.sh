#!/bin/bash
# API Testing Examples
# Usage: bash examples.sh

API_URL="http://localhost:7860"

echo "🏥 Medical Triage AI - API Testing Examples"
echo "==========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Health Check
echo -e "${BLUE}1. Health Check${NC}"
echo "Command: curl $API_URL/health"
curl -s $API_URL/health | python -m json.tool
echo ""
echo ""

# 2. API Info
echo -e "${BLUE}2. API Information${NC}"
echo "Command: curl $API_URL/info"
curl -s $API_URL/info | python -m json.tool
echo ""
echo ""

# 3. Simple symptom
echo -e "${BLUE}3. Simple Symptom - Headache${NC}"
echo "Command: curl -X POST $API_URL/predict -H 'Content-Type: application/json' -d '{\"symptoms\": \"headache\"}'"
curl -s -X POST $API_URL/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "headache"}' | python -m json.tool
echo ""
echo ""

# 4. Multiple symptoms
echo -e "${BLUE}4. Multiple Symptoms${NC}"
echo "Command: curl -X POST $API_URL/predict -H 'Content-Type: application/json' -d '{\"symptoms\": \"chest pain and shortness of breath\"}'"
curl -s -X POST $API_URL/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "chest pain and shortness of breath"}' | python -m json.tool
echo ""
echo ""

# 5. Critical symptom
echo -e "${BLUE}5. Critical Symptoms${NC}"
echo "Command: curl -X POST $API_URL/predict -H 'Content-Type: application/json' -d '{\"symptoms\": \"severe chest pain, difficulty breathing, dizziness\"}'"
curl -s -X POST $API_URL/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "severe chest pain, difficulty breathing, dizziness"}' | python -m json.tool
echo ""
echo ""

# 6. Arabic symptoms
echo -e "${BLUE}6. Arabic Symptoms${NC}"
echo "Command: curl -X POST $API_URL/predict -H 'Content-Type: application/json' -d '{\"symptoms\": \"ألم في الصدر وضيق التنفس\"}'"
curl -s -X POST $API_URL/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "ألم في الصدر وضيق التنفس"}' | python -m json.tool
echo ""
echo ""

# 7. Error handling - missing symptoms field
echo -e "${BLUE}7. Error Test - Missing Symptoms${NC}"
echo "Command: curl -X POST $API_URL/predict -H 'Content-Type: application/json' -d '{}'"
curl -s -X POST $API_URL/predict \
  -H "Content-Type: application/json" \
  -d '{}' | python -m json.tool
echo ""
echo ""

# 8. Error handling - empty symptoms
echo -e "${BLUE}8. Error Test - Empty Symptoms${NC}"
echo "Command: curl -X POST $API_URL/predict -H 'Content-Type: application/json' -d '{\"symptoms\": \"\"}'"
curl -s -X POST $API_URL/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ""}' | python -m json.tool
echo ""
echo ""

# 9. High fever and cough
echo -e "${BLUE}9. Respiratory Infection Symptoms${NC}"
echo "Command: curl -X POST $API_URL/predict -H 'Content-Type: application/json' -d '{\"symptoms\": \"high fever, persistent cough, sore throat\"}'"
curl -s -X POST $API_URL/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "high fever, persistent cough, sore throat"}' | python -m json.tool
echo ""
echo ""

# 10. Abdominal symptoms
echo -e "${BLUE}10. Abdominal Symptoms${NC}"
echo "Command: curl -X POST $API_URL/predict -H 'Content-Type: application/json' -d '{\"symptoms\": \"severe abdominal pain, nausea, vomiting\"}'"
curl -s -X POST $API_URL/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "severe abdominal pain, nausea, vomiting"}' | python -m json.tool
echo ""
echo ""

echo -e "${GREEN}✅ Testing Complete!${NC}"
echo ""
echo "Notes:"
echo "- Ensure API is running on http://localhost:7860"
echo "- Results depend on Groq API availability"
echo "- API requires valid GROQ_API_KEY environment variable"
