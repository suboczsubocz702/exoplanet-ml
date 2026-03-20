import numpy as np


def fill_missing(X):
    col_mean = np.nanmean(X, axis=0)
    col_mean = np.where(np.isnan(col_mean), 0, col_mean)

    inds = np.where(np.isnan(X))
    X[inds] = np.take(col_mean, inds[1])

    return X


def remove_infinite(X):
    X = np.where(np.isinf(X), np.nan, X)
    return fill_missing(X)


def train_test_split(X, y, test_size=0.2):
    n = len(X)
    idx = np.random.permutation(n)

    test_n = int(n * test_size)

    test_idx = idx[:test_n]
    train_idx = idx[test_n:]

    return X[train_idx], X[test_idx], y[train_idx], y[test_idx]