import numpy as np


class Node:
    def __init__(self, feature=None, threshold=None, left=None, right=None, value=None):
        self.feature = feature
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value


class DecisionTreeRegressor:
    def __init__(self, max_depth=3):
        self.max_depth = max_depth
        self.root = None
        self.feature_importances_ = None

    def fit(self, X, y):
        self.feature_importances_ = None
        self.root = self._build_tree(X, y)

    def predict(self, X):
        return np.array([self._predict(x, self.root) for x in X])

    def _predict(self, x, node):
        if node.value is not None:
            return node.value

        if x[node.feature] <= node.threshold:
            return self._predict(x, node.left)
        else:
            return self._predict(x, node.right)

    def _build_tree(self, X, y, depth=0):
        if depth >= self.max_depth or len(y) < 2:
            return Node(value=np.mean(y))

        feature, threshold = self._best_split(X, y)

        if feature is None:
            return Node(value=np.mean(y))

        left_idx = X[:, feature] <= threshold
        right_idx = ~left_idx

        left = self._build_tree(X[left_idx], y[left_idx], depth + 1)
        right = self._build_tree(X[right_idx], y[right_idx], depth + 1)

        return Node(feature, threshold, left, right)

    def _best_split(self, X, y):
        best_feature = None
        best_threshold = None
        best_mse = float("inf")

        n_features = X.shape[1]

        if self.feature_importances_ is None:
            self.feature_importances_ = np.zeros(n_features)

        for f in range(n_features):
            values = np.sort(X[:, f])
            thresholds = values[::max(1, len(values)//20)]

            for t in thresholds:
                left = X[:, f] <= t
                right = ~left

                if np.sum(left) == 0 or np.sum(right) == 0:
                    continue

                mse = self._mse(y[left], y[right])

                if mse < best_mse:
                    best_mse = mse
                    best_feature = f
                    best_threshold = t

        return best_feature, best_threshold

    def _mse(self, left_y, right_y):
        n = len(left_y) + len(right_y)
        return (np.var(left_y)*len(left_y) + np.var(right_y)*len(right_y)) / n