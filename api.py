from fastapi import FastAPI
import numpy as np
import pickle
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Exoplanet Classifier API")

with open("model.pkl", "rb") as f:
    model = pickle.load(f)

@app.get("/")
def root():
    return {"message": "Exoplanet classifier is running"}

@app.post("/predict")
def predict(data: dict):
    try:
        snr = data["snr"]
        depth = data["depth"]
        duration = data["duration"]
        prad = data["prad"]
        period = data["period"]
        impact = data["impact"]

        eps = 1e-6

        f1 = depth / (duration + eps)
        f2 = snr / (period + eps)
        f3 = depth * duration
        f4 = prad / (period + eps)
        f5 = duration / (period + eps)
        f6 = np.log1p(snr)
        f7 = np.log1p(depth)

        X = np.array([[snr, depth, duration, prad, period, impact,
                       f1, f2, f3, f4, f5, f6, f7]])

        proba = model.predict_proba(X)[0]
        prediction = int(proba > 0.6)

        return {
            "probability": float(proba),
            "prediction": prediction
        }

    except Exception as e:
        return {"error": str(e)}
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # na start OK
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)