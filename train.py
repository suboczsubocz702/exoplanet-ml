from src.data_loader import load_dataset
from src.preprocessing import fill_missing, remove_infinite, train_test_split
from src.gradient_boosting import GradientBoostingClassifier
from src.metrics import accuracy, precision, recall, f1_score
import matplotlib.pyplot as plt
import pickle

X, y = load_dataset("data/kepler_clean.csv")

X = remove_infinite(X)
X = fill_missing(X)

X_train, X_test, y_train, y_test = train_test_split(X, y)

model = GradientBoostingClassifier(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=3
)

model.fit(X_train, y_train)

pred = model.predict(X_test)

print("\nResults")
print("Accuracy:", accuracy(y_test, pred))
print("Precision:", precision(y_test, pred))
print("Recall:", recall(y_test, pred))
print("F1:", f1_score(y_test, pred))

plt.figure()
plt.plot(model.loss_history)
plt.title("Training Loss (LogLoss)")
plt.xlabel("Iteration")
plt.ylabel("Loss")
plt.show()

plt.figure()
plt.plot(model.acc_history)
plt.title("Training Accuracy")
plt.xlabel("Iteration")
plt.ylabel("Accuracy")
plt.show()

with open("model.pkl", "wb") as f:
    pickle.dump(model, f)