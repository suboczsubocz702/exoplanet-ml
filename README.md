# Exoplanet Classifier – Kepler ML Project

A binary classification model for detecting exoplanets from Kepler Space Telescope transit data. The model is implemented from scratch using NumPy with a custom Gradient Boosting algorithm.

## Model Performance

| Metric | Value |
|--------|-------|
| Accuracy | 0.90 |
| Precision | 0.88 |
| Recall | 0.79 |
| F1 Score | 0.83 |

## Project Structure

```
exoplanet_ml/
├── data/
│   └── kepler_clean.csv          # Training data
├── src/
│   ├── data_loader.py            # Data loading utilities
│   ├── preprocessing.py          # Feature engineering
│   ├── decision_tree.py          # Custom decision tree regressor
│   ├── gradient_boosting.py      # Gradient Boosting implementation
│   └── metrics.py                # Evaluation metrics
├──website/
|   ├── index.html                # Website structure
│   ├── script.js                 # Website functions
│   └── style.css                 # Webiste stylng
├── train.py                      # Training script
├── api.py                        # FastAPI endpoint
├── model.pkl                     # Serialized model
├── requirements.txt
└── README.md
```

## Installation

```bash
pip install numpy pandas matplotlib fastapi uvicorn
```

## Training

```bash
python train.py
```

This loads and preprocesses the Kepler data, trains the Gradient Boosting model, displays metrics, plots training curves, and saves `model.pkl`.

## Feature Engineering

Additional features derived from base parameters to improve performance:

- `depth / duration`
- `snr / period`
- `depth * duration`
- `prad / period`
- `duration / period`
- `log(snr)`
- `log(depth)`

## API

Run the FastAPI server:

```bash
uvicorn api:app --reload
```

**Endpoint:** `POST /predict`

**Request:**
```json
{
  "snr": 10,
  "depth": 500,
  "duration": 5,
  "prad": 1,
  "period": 50,
  "impact": 0.5
}
```

**Response:**
```json
{
  "probability": 0.225,
  "prediction": False Positive
}
```

## Deployment

- **Backend:** Render
- **Frontend:** Netlify

## How Input Parameters Affect Output

| Parameter | Increase → Effect | Decrease → Effect |
|-----------|-------------------|-------------------|
| **SNR** | Higher probability (stronger signal) | Lower probability (weak detection) |
| **Depth** | Higher probability (larger planet) | Lower probability (signal too small) |
| **Duration** | Higher for 2–8 hrs; decreases for very long transits | Lower for very short transits (<1 hr) |
| **prad** | Higher for 0.5–3; decreases for extreme values | Lower if too small (<0.5) |
| **Period** | Short periods (<10 days) favor planets; long periods (>200 days) lower probability | Very short periods (<1 day) decrease probability |
| **Impact** | Lower probability if >0.8 (grazing transits) | Higher probability if <0.4 (central transits) |

**Examples:**
- Hot Jupiter (SNR 28.5, depth 1280, period 3.5) -> Probability >0.60 (exoplanet)
- Kepler-22b (SNR 15.2, depth 520, period 289) -> Probability ~0.43 (false positive)
