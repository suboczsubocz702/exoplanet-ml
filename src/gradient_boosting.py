import numpy as np
from src.decision_tree import DecisionTreeRegressor


class GradientBoostingClassifier:
    def __init__(self, n_estimators=200, learning_rate=0.05, max_depth=3):
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.max_depth = max_depth
        self.trees = []
        self.loss_history = []
        self.acc_history = []

    def fit(self, X, y):
        y_pred = np.zeros_like(y, dtype=float)

        for i in range(self.n_estimators):
            p = 1 / (1 + np.exp(-y_pred))
            residuals = y - p

            tree = DecisionTreeRegressor(max_depth=self.max_depth)
            tree.fit(X, residuals)

            y_pred += self.learning_rate * tree.predict(X)
            self.trees.append(tree)

            loss = -np.mean(
                y * np.log(p + 1e-10) +
                (1 - y) * np.log(1 - p + 1e-10)
            )

            self.loss_history.append(loss)

            pred_labels = (p > 0.5).astype(int)
            acc = np.mean(pred_labels == y)
            self.acc_history.append(acc)

            if i % 20 == 0:
                print(f"Iteration {i}, LogLoss: {loss:.4f}")

    def predict_proba(self, X):
        y_pred = np.zeros(X.shape[0])

        for tree in self.trees:
            y_pred += self.learning_rate * tree.predict(X)

        return 1 / (1 + np.exp(-y_pred))

    def predict(self, X):
        return (self.predict_proba(X) > 0.6).astype(int)