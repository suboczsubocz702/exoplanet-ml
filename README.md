# Exoplanet Classifier (Kepler ML Project)

A machine learning project for detecting exoplanets using data from the
Kepler Space Telescope.

------------------------------------------------------------------------

## Overview

This project builds a binary classification model that predicts whether
a detected signal corresponds to a real exoplanet or a false positive.

The model is implemented from scratch using NumPy and is based on
Gradient Boosting.

------------------------------------------------------------------------

## Features

-   Gradient Boosting implemented from scratch
-   Custom Decision Tree Regressor
-   Log-loss optimization for classification
-   Feature engineering based on domain knowledge
-   REST API using FastAPI
-   Frontend deployed on Netlify
-   Real-time prediction via browser
-   Training visualization (loss and accuracy)

------------------------------------------------------------------------

## Model Performance

  Metric      Value
  ----------- --------
  Accuracy    \~0.90
  Precision   \~0.88
  Recall      \~0.79
  F1 Score    \~0.83

------------------------------------------------------------------------

## Project Structure

    exoplanet_ml/
    │
    ├── data/
    │   └── kepler_clean.csv
    │
    ├── src/
    │   ├── data_loader.py
    │   ├── preprocessing.py
    │   ├── decision_tree.py
    │   ├── gradient_boosting.py
    │   └── metrics.py
    │
    ├── train.py
    ├── api.py
    ├── model.pkl
    ├── index.html
    └── README.md

------------------------------------------------------------------------

## Installation

``` bash
pip install numpy pandas matplotlib fastapi uvicorn
```

------------------------------------------------------------------------

## Training the Model

``` bash
python train.py
```

This will:

-   Load and preprocess data
-   Train the Gradient Boosting model
-   Display metrics
-   Plot training curves
-   Save model to `model.pkl`

------------------------------------------------------------------------

## API (FastAPI)

Run the API:

``` bash
uvicorn api:app --reload
```

Endpoint:

POST /predict

Example request:

``` json
{
  "snr": 10,
  "depth": 500,
  "duration": 5,
  "prad": 1,
  "period": 50,
  "impact": 0.5
}
```

Example response:

``` json
{
  "probability": 0.87,
  "prediction": 1
}
```

------------------------------------------------------------------------

## Frontend

The frontend is a simple HTML interface deployed on Netlify.

It allows users to:

-   Input transit parameters
-   Use predefined examples
-   Get predictions from the model

------------------------------------------------------------------------

## Feature Engineering

Additional features are created from base parameters:

-   depth / duration
-   snr / period
-   depth \* duration
-   prad / period
-   duration / period
-   log(snr)
-   log(depth)

These improve model performance by capturing relationships between
variables.

------------------------------------------------------------------------

## How It Works

1.  Input astrophysical parameters
2.  Apply feature engineering
3.  Pass data to Gradient Boosting model
4.  Output probability and classification

------------------------------------------------------------------------

## Architecture

Frontend (Netlify) ↓ FastAPI (Render) ↓ ML Model (NumPy)

------------------------------------------------------------------------

## Training Visualization

The model tracks:

-   Log-loss over iterations
-   Accuracy over iterations

These help monitor training progress and convergence.

------------------------------------------------------------------------

## Deployment

-   Frontend: Netlify
-   Backend: Render
-   Model: serialized using pickle

------------------------------------------------------------------------

## Notes

-   Feature engineering must be identical in training and API
-   Dataset contains missing values handled in preprocessing
-   Classification threshold (default 0.6) affects precision/recall
    balance

------------------------------------------------------------------------

## Future Improvements

-   ROC curve and threshold optimization
-   Hyperparameter tuning
-   Faster tree implementation
-   UI improvements
-   Batch prediction from CSV
-   Docker deployment

------------------------------------------------------------------------

## Author

Machine learning project focused on astrophysics and model deployment.
