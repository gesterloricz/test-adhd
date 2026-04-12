"""
ADHD Classification Backend
============================
Loads TWO separately trained model sets:
  - IEEE  → ieee_baseline_model.pkl, ieee_proposed_model.pkl, ieee_scaler.pkl, ieee_metrics.json
  - HBN   → hbn_baseline_model.pkl,  hbn_proposed_model.pkl,  hbn_scaler.pkl,  hbn_metrics.json

The metrics.json files are saved automatically by the training script —
no hardcoded numbers needed here.

Start:
    uvicorn main:app --reload
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import joblib
import json
import os
import numpy as np
from pydantic import BaseModel
import xgboost as xgb

from preprocessing import process_file_to_features, EEGPreprocessor, load_eeg_from_bytes

app = FastAPI(title="ADHD Classification API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Dataset file map ───────────────────────────────────────────────────────────
DATASET_FILES = {
    "IEEE": {
        "baseline": "ieee_baseline_model.pkl",
        "proposed": "ieee_proposed_model.pkl",
        "scaler": "ieee_scaler.pkl",
        "metrics": "ieee_metrics.json",
        "label": "IEEE (Balanced)",
        "note": "Trained on a balanced dataset of ADHD and Control subjects.",
    },
    "HBN": {
        "baseline": "hbn_baseline_model.pkl",
        "proposed": "hbn_proposed_model.pkl",
        "scaler": "hbn_scaler.pkl",
        "metrics": "hbn_metrics.json",
        "label": "HBN (Imbalanced)",
        "note": "Trained on a imbalanced dataset of ADHD and Control subjects.",
    },
}

# Runtime registry — populated at startup
registry: dict = {}


def load_metrics_json(path: str) -> dict | None:
    """
    Load metrics from the JSON file saved by the training script.
    Returns None if the file doesn't exist.
    """
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


@app.on_event("startup")
async def load_models():
    print("\n=== Loading ADHD Classification Models ===")

    for key, cfg in DATASET_FILES.items():

        # Check all 3 pkl files exist
        missing_pkl = [
            cfg[k]
            for k in ("baseline", "proposed", "scaler")
            if not os.path.exists(cfg[k])
        ]
        if missing_pkl:
            print(f"  ⚠  [{key}] Skipped — missing: {missing_pkl}")
            continue

        try:
            # Load models and scaler
            baseline = joblib.load(cfg["baseline"])
            proposed = joblib.load(cfg["proposed"])
            scaler = joblib.load(cfg["scaler"])

            # Load metrics from JSON (saved automatically by training script)
            metrics = load_metrics_json(cfg["metrics"])
            if metrics:
                print(f"  ✓  [{key}] Metrics loaded from {cfg['metrics']}")
            else:
                # JSON missing — warn but still load the models
                print(f"  ⚠  [{key}] {cfg['metrics']} not found.")
                print(f"       Run the training script to generate it,")
                print(f"       or metrics will show as unavailable in the UI.")
                metrics = None

            registry[key] = {
                "baseline": baseline,
                "proposed": proposed,
                "scaler": scaler,
                "metrics": metrics,
                "label": cfg["label"],
                "note": cfg["note"],
            }
            print(f"  ✓  [{key}] Models ready — {cfg['baseline']}, {cfg['proposed']}")

        except Exception as e:
            print(f"  ✗  [{key}] Failed to load: {e}")

    if not registry:
        print("\n  No models loaded.")
        print("  Run adhd_train_both_datasets.py in Colab, then copy the")
        print("  .pkl and .json files into this backend/ folder.")
    else:
        print(f"\n  Ready. Loaded datasets: {list(registry.keys())}")


# ── Helpers ────────────────────────────────────────────────────────────────────


def run_prediction(model, X_scaled):
    """Works with both XGBClassifier and raw xgb.Booster."""
    if isinstance(model, xgb.XGBClassifier):
        proba = model.predict_proba(X_scaled)[:, 1]
        preds = model.predict(X_scaled)
    else:  # xgb.Booster (DART-IBL)
        dmat = xgb.DMatrix(X_scaled)
        proba = model.predict(dmat)
        preds = np.round(proba).astype(int)
    return preds, proba


# ── Response schemas


class PredictionResult(BaseModel):
    filename: str
    dataset: str
    dataset_label: str
    baseline_prediction: int
    baseline_label: str
    baseline_confidence: float
    baseline_adhd_epochs: int
    proposed_prediction: int
    proposed_label: str
    proposed_confidence: float
    proposed_adhd_epochs: int
    total_epochs: int
    metrics: dict
    eeg_data: list  # Preprocessed EEG data: list of [channels, samples]


class DatasetsResponse(BaseModel):
    available: list
    details: dict


# ── Endpoints ──────────────────────────────────────────────────────────────────


@app.get("/")
def root():
    return {
        "status": "running",
        "loaded": list(registry.keys()),
        "message": "POST /predict?dataset=IEEE  or  POST /predict?dataset=HBN",
    }


@app.get("/datasets", response_model=DatasetsResponse)
def get_datasets():
    """Return which datasets are loaded and their descriptions."""
    details = {
        k: {
            "label": v["label"],
            "note": v["note"],
            "metrics_loaded": v["metrics"] is not None,
        }
        for k, v in registry.items()
    }
    return {"available": list(registry.keys()), "details": details}


@app.get("/metrics")
def get_metrics(dataset: str = Query(default="IEEE")):
    """
    Return training metrics for a dataset.
    These come directly from the metrics.json file saved during training —
    they are the real numbers from your Colab run, not hardcoded.
    """
    if dataset not in registry:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset}' not loaded.")

    metrics = registry[dataset]["metrics"]

    if metrics is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Metrics file for '{dataset}' not found. "
                f"Re-run the training script to generate {dataset.lower()}_metrics.json "
                f"and copy it to the backend/ folder."
            ),
        )

    return {
        "dataset": dataset,
        "baseline": metrics["baseline"],
        "proposed": metrics["proposed"],
    }


@app.post("/predict", response_model=PredictionResult)
async def predict(
    file: UploadFile = File(...),
    dataset: str = Query(
        default="IEEE",
        description="Which trained model to use: IEEE (balanced) or HBN (imbalanced)",
    ),
):
    """
    Classify one unseen EEG file as ADHD or Control.

    - Preprocessing:  bandpass filter → epochs → 190 PSD+entropy features
    - Scaling:        uses the scaler fitted on this dataset's training data
    - Prediction:     both Baseline XGBoost and Proposed DART-IBL classify
    - Vote:           majority of epochs → final label
    - Confidence:     average ADHD probability across all epochs
    - Metrics:        loaded from {dataset}_metrics.json (saved during training)
    """
    if not file.filename.endswith((".mat", ".csv", ".edf")):
        raise HTTPException(
            status_code=400, detail="Only .mat, .csv, .edf files supported."
        )

    if dataset not in registry:
        raise HTTPException(
            status_code=404,
            detail=f"Dataset '{dataset}' not loaded. Available: {list(registry.keys())}",
        )

    entry = registry[dataset]
    file_bytes = await file.read()

    try:
        # 1. Load raw EEG data for visualization
        raw_eeg_data = load_eeg_from_bytes(file_bytes, file.filename)

        if raw_eeg_data.shape[0] != 19:
            raise ValueError(
                f"CRITICAL ERROR: Invalid file format.\nExpected exactly 19 EEG channels, but found {raw_eeg_data.shape[0]}.\nPlease provide a valid EEG recording formatted for the 10-20 system."
            )

        # Apply preprocessing to get filtered EEG
        preprocessor = EEGPreprocessor(sampling_rate=128)
        filtered_eeg = preprocessor.preprocess_signal(raw_eeg_data)

        # Convert to list for JSON serialization (channels x samples)
        eeg_data_list = filtered_eeg.tolist()

        # 2. Preprocess + extract features → (n_epochs, 190)
        X = process_file_to_features(file_bytes, file.filename, sampling_rate=128)

        # 3. Scale using THIS dataset's scaler (fitted on same training data)
        X_scaled = entry["scaler"].transform(X)

        # 4. Baseline prediction
        b_preds, b_proba = run_prediction(entry["baseline"], X_scaled)
        b_adhd = int(np.sum(b_preds == 1))
        b_vote = 1 if b_adhd > len(b_preds) / 2 else 0
        b_avg = float(b_proba.mean())
        b_conf = round(b_avg * 100 if b_vote == 1 else (1 - b_avg) * 100, 2)

        # 5. Proposed prediction
        p_preds, p_proba = run_prediction(entry["proposed"], X_scaled)
        p_adhd = int(np.sum(p_preds == 1))
        p_vote = 1 if p_adhd > len(p_preds) / 2 else 0
        p_avg = float(p_proba.mean())
        p_conf = round(p_avg * 100 if p_vote == 1 else (1 - p_avg) * 100, 2)

        # 6. Attach metrics from JSON (or empty dict if file was missing)
        metrics = entry["metrics"] or {}

        return PredictionResult(
            filename=file.filename,
            dataset=dataset,
            dataset_label=entry["label"],
            baseline_prediction=b_vote,
            baseline_label="ADHD Detected" if b_vote == 1 else "Control (No ADHD)",
            baseline_confidence=b_conf,
            baseline_adhd_epochs=b_adhd,
            proposed_prediction=p_vote,
            proposed_label="ADHD Detected" if p_vote == 1 else "Control (No ADHD)",
            proposed_confidence=p_conf,
            proposed_adhd_epochs=p_adhd,
            total_epochs=len(X),
            metrics=metrics,
            eeg_data=eeg_data_list,
        )

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
