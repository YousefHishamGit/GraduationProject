import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from preprocess import load_dataset, split_data, clean_text , normalize_symptoms

print("Loading dataset...")
df = load_dataset()

X_train, X_test, y_train, y_test = split_data(df)
X_train = X_train.apply(clean_text)
X_test = X_test.apply(clean_text)
X_train = X_train.apply(normalize_symptoms)
X_test = X_test.apply(normalize_symptoms)



print("Vectorizing...")
vectorizer = TfidfVectorizer(ngram_range=(1,2))

X_train_vec = vectorizer.fit_transform(X_train)

print("Training model...")
model = LogisticRegression(max_iter=1000)
model.fit(X_train_vec, y_train)

print("Saving model...")
pickle.dump(model, open("../Model/model.pkl", "wb"))
pickle.dump(vectorizer, open("../Model/vectorizer.pkl", "wb"))

print("Done")
