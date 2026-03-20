import pandas as pd
import numpy as np

def load_dataset(path):
    df = pd.read_csv(path, comment="#")

    if "koi_disposition" not in df.columns:
        raise ValueError("Target column 'koi_disposition' not found")

    df = df[df["koi_disposition"].isin(["CONFIRMED", "FALSE POSITIVE"])]
    df["koi_disposition"] = df["koi_disposition"].map({
        "CONFIRMED": 1,
        "FALSE POSITIVE": 0
    })

    df = df.dropna(axis=1, how='all')
    df = df.loc[:, df.isnull().mean() < 0.3]

    important_features = [
        "koi_model_snr",
        "koi_depth",
        "koi_duration",
        "koi_prad",
        "koi_period",
        "koi_impact"
    ]

    available_features = [f for f in important_features if f in df.columns]

    base = df[available_features]

    snr = df["koi_model_snr"].values
    depth = df["koi_depth"].values
    duration = df["koi_duration"].values
    period = df["koi_period"].values
    prad = df["koi_prad"].values

    eps = 1e-6

    f1 = depth / (duration + eps)

    f2 = snr / (period + eps)

    f3 = depth * duration

    f4 = prad / (period + eps)

    f5 = duration / (period + eps)

    f6 = np.log1p(snr)
    f7 = np.log1p(depth)

    X = np.column_stack([
        base.values,
        f1, f2, f3, f4, f5, f6, f7
    ])

    y = df["koi_disposition"].values

    X = np.array(X, dtype=float)
    y = np.array(y, dtype=float)
    X = np.nan_to_num(X)
    
    print("Dataset loaded")
    print("Samples:", X.shape[0])
    print("Features:", X.shape[1])
    print("Missing values:", np.isnan(X).sum())

    return X, y