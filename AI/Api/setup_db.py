from datasets import load_dataset
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

print("📥 Loading Medical Dataset...")

dataset = load_dataset("SubashNeupane/clean_medQA", split="train")

# التحقق من بنية الداتا
print(f"🔍 Keys in dataset: {dataset.column_names}")
sample = dataset[0]
print(f"🔍 Sample keys: {sample.keys()}")
print(f"🔍 Sample content:\n{sample}")

# محاولة استخراج السؤال والإجابة بشكل ديناميكي
texts = []
for item in dataset:
    # نبحث عن حقل يشبه السؤال
    question = None
    answer = None
    for key in ['question', 'Question', 'q', 'input', 'text']:
        if key in item and item[key]:
            question = item[key]
            break
    for key in ['answer', 'Answer', 'a', 'output', 'long_answer', 'response']:
        if key in item and item[key]:
            answer = item[key]
            break
    # إذا لم نجد إجابة، نستخدم ثاني حقل نصي
    if not answer:
        for key in item:
            if key != question and isinstance(item[key], str) and len(item[key]) > 20:
                answer = item[key]
                break
    if question and answer:
        texts.append(f"Q: {question}\nA: {answer}")

print(f"✅ Loaded {len(texts)} medical Q&A")

# إذا لم يتم تحميل أي شيء، نعرض تحذير ونستمر لتجربة كل الحقول
if len(texts) == 0:
    print("❌ No Q&A pairs found! Using entire dataset as texts...")
    for item in dataset:
        # نأخذ كل الحقول النصية
        full_text = "\n".join([f"{k}: {v}" for k, v in item.items() if isinstance(v, str) and len(v) > 10])
        if full_text:
            texts.append(full_text)

if len(texts) == 0:
    raise ValueError("No text data found in dataset. Please check dataset structure.")

# تقسيم النصوص
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.create_documents(texts)
print(f"✅ Created {len(chunks)} chunks")

print("⏳ Creating database (few minutes)...")

# استخدام الاستيراد الحديث لتجنب التحذير
try:
    from langchain_huggingface import HuggingFaceEmbeddings
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
except ImportError:
    # التحذير القديم لكن لا يزال يعمل
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./medical_db"
)

print("✅ Medical Database Ready!")