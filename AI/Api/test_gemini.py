import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("❌ GEMINI_API_KEY not found in .env")
    exit(1)

print(f"✅ API Key found: {API_KEY[:10]}...")

# تكوين Gemini
genai.configure(api_key=API_KEY)

# قائمة النماذج المتاحة (للتأكد)
print("\n📋 Available models:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f"  - {m.name}")

# تجربة نموذج حقيقي
try:
    # استخدم واحداً من هذه الأسماء (جرب الأول، ثم الثاني)
    model_name = "gemini-2.0-flash"  # أو gemini-1.5-flash-latest
    print(f"\n🔄 Trying model: {model_name}")
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Say 'Hello, Gemini works!'")
    print(f"✅ Response: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")