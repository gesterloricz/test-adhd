from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import os
from pydantic import BaseModel
from typing import List
import xgboost as xgb

# Import our preprocessing logic
from preprocessing import process_file_to_features

app = FastAPI(title="ADHD Classification API")

# Setup CORS for the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, lock this down
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to hold models
scaler = None
baseline_model = None
proposed_model = None

@app.on_event("startup")
async def load_models():
    global scaler, baseline_model, proposed_model
    try:
        scaler = joblib.load("scaler.pkl")
        baseline_model = joblib.load("baseline_model.pkl")
        proposed_model = joblib.load("proposed_model.pkl")
        print("Models and scaler loaded successfully!")
    except Exception as e:
        print(f"Error loading models: {e}")

class PredictionResult(BaseModel):
    filename: str
    baseline_prediction: int
    baseline_confidence: float
    proposed_prediction: int
    proposed_confidence: float
    total_epochs: int
    message: str

@app.get("/")
def read_root():
    return {"status": "Backend is running. Models loaded: " + str(scaler is not None)}

@app.post("/predict", response_model=PredictionResult)
async def predict_adhd(file: UploadFile = File(...)):
    """
    Endpoint to receive an EEG file (.mat, .edf, .csv), process it,
    and return the classification from both Baseline and Proposed models.
    """
    if not file.filename.endswith(('.mat', '.csv', '.edf')):
        raise HTTPException(status_code=400, detail="Only .mat, .csv, and .edf files are supported")

    file_bytes = await file.read()
    
    try:
        # 1. Process the raw file into features
        X = process_file_to_features(file_bytes, file.filename, sampling_rate=128)
        
        # 2. Scale the features
        X_scaled = scaler.transform(X)
        
        # 3. Predict using Baseline Model
        # Predict on all epochs. If > 50% are ADHD (1), classify as ADHD
        baseline_preds = baseline_model.predict(X_scaled)
        baseline_ADHD_epochs = np.sum(baseline_preds == 1)
        baseline_pred = 1 if baseline_ADHD_epochs > (len(baseline_preds) / 2) else 0
        baseline_conf = float(baseline_ADHD_epochs / len(baseline_preds)) if baseline_pred == 1 else float(1 - (baseline_ADHD_epochs / len(baseline_preds)))

        # 4. Predict using Proposed Model
        dtest = xgb.DMatrix(X_scaled)
        proposed_proba = proposed_model.predict(dtest)
        proposed_preds = np.round(proposed_proba).astype(int)
        proposed_ADHD_epochs = np.sum(proposed_preds == 1)
        proposed_pred = 1 if proposed_ADHD_epochs > (len(proposed_preds) / 2) else 0
        proposed_conf = float(proposed_ADHD_epochs / len(proposed_preds)) if proposed_pred == 1 else float(1 - (proposed_ADHD_epochs / len(proposed_preds)))
        
        msg = "Classified based on majority epoch voting."

        return PredictionResult(
            filename=file.filename,
            baseline_prediction=baseline_pred,
            baseline_confidence=round(baseline_conf * 100, 2),
            proposed_prediction=proposed_pred,
            proposed_confidence=round(proposed_conf * 100, 2),
            total_epochs=len(X),
            message=msg
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

