import sys
import pickle

model = pickle.load(open("../Model/model.pkl", "rb"))
vectorizer = pickle.load(open("../Model/vectorizer.pkl", "rb"))

text = sys.argv[1]
X = vectorizer.transform([text])
prediction = model.predict(X)[0]

print(prediction)
