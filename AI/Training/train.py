import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from preprocess import load_dataset, split_data, clean_text, normalize_symptoms

print("Loading dataset...")
df = load_dataset()

X_train, X_test, y_triage_train, y_triage_test, y_specialty_train, y_specialty_test = split_data(df)

X_train = X_train.apply(clean_text).apply(normalize_symptoms)
X_test = X_test.apply(clean_text).apply(normalize_symptoms)

print("Vectorizing...")
vectorizer = TfidfVectorizer(ngram_range=(1, 2))
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

print("Training triage model...")
triage_model = LogisticRegression(max_iter=1000)
triage_model.fit(X_train_vec, y_triage_train)

print("Training specialty model...")
specialty_model = LogisticRegression(max_iter=1000)
specialty_model.fit(X_train_vec, y_specialty_train)

print("Saving models...")
pickle.dump(triage_model, open("../Model/model.pkl", "wb"))
pickle.dump(specialty_model, open("../Model/specialty_model.pkl", "wb"))
pickle.dump(vectorizer, open("../Model/vectorizer.pkl", "wb"))

print("Done!")