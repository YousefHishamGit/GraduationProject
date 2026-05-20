from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

print("🔍 Loading database...")
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vectorstore = Chroma(persist_directory="./medical_db", embedding_function=embeddings)

# اسأل أي سؤال طبي
query = input("Ask a medical question: ")
docs = vectorstore.similarity_search(query, k=3)

print("\n📚 Top 3 related answers:\n")
for i, doc in enumerate(docs, 1):
    print(f"{i}. {doc.page_content[:500]}\n")