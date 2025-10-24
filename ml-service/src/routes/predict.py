"""Prediction API routes."""
import logging
import time
import pandas as pd
from fastapi import APIRouter, HTTPException, Request
from datetime import datetime

from src.schemas import (
    PredictRequest, PredictionResponse,
    ExplainRequest, ExplainResponse,
    AnomalyDetectionRequest, AnomalyDetectionResponse,
    TransactionPredictionRequest, TransactionPredictionResponse,
    FeatureImportance
)
from src.services.feature_engineering import FeatureEngineer
from src.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize feature engineer
feature_engineer = FeatureEngineer()


@router.post("/", response_model=PredictionResponse)
async def predict_fraud(request: PredictRequest, http_request: Request):
    """
    Predict fraud probability for a wallet.

    Args:
        request: Prediction request

    Returns:
        Fraud prediction with probability and risk score
    """
    start_time = time.time()

    try:
        # Get model manager from app state
        model_manager = http_request.app.state.model_manager

        if not model_manager.is_ready():
            raise HTTPException(
                status_code=503,
                detail="Models not loaded. Please train models first."
            )

        # Get features
        if request.features:
            features = request.features
        else:
            # TODO: Fetch wallet data from blockchain and extract features
            # For now, return error
            raise HTTPException(
                status_code=400,
                detail="Features must be provided. Wallet data fetching not yet implemented."
            )

        # Convert features to DataFrame
        features_df = pd.DataFrame([features])

        # Get fraud detector
        fraud_detector = model_manager.get_fraud_detector()

        # Predict
        fraud_proba = fraud_detector.predict_proba(features_df)[0]
        risk_score = int(fraud_proba * 100)
        is_fraud = fraud_proba >= 0.5

        # Calculate confidence (based on prediction probability)
        # High confidence when probability is close to 0 or 1
        confidence = abs(fraud_proba - 0.5) * 2

        processing_time = (time.time() - start_time) * 1000

        return PredictionResponse(
            wallet_address=request.wallet_address.lower(),
            fraud_probability=float(fraud_proba),
            risk_score=risk_score,
            is_fraud=bool(is_fraud),
            confidence=float(confidence),
            model_version=settings.model_version,
            timestamp=datetime.now(),
            processing_time_ms=processing_time
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/explain", response_model=ExplainResponse)
async def explain_prediction(request: ExplainRequest, http_request: Request):
    """
    Get explainable prediction with SHAP values.

    Args:
        request: Explain request

    Returns:
        Prediction with feature contributions
    """
    try:
        model_manager = http_request.app.state.model_manager

        if not model_manager.is_ready():
            raise HTTPException(status_code=503, detail="Models not loaded")

        # TODO: Get features from wallet
        raise HTTPException(
            status_code=501,
            detail="Explainable predictions not yet implemented. Use /predict first."
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Explanation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/anomaly", response_model=AnomalyDetectionResponse)
async def detect_anomaly(request: AnomalyDetectionRequest, http_request: Request):
    """
    Detect if wallet behavior is anomalous.

    Args:
        request: Anomaly detection request

    Returns:
        Anomaly detection result
    """
    try:
        model_manager = http_request.app.state.model_manager

        if not model_manager.is_ready():
            raise HTTPException(status_code=503, detail="Models not loaded")

        # Get features
        if request.features:
            features = request.features
        else:
            raise HTTPException(
                status_code=400,
                detail="Features must be provided"
            )

        # Convert to DataFrame
        features_df = pd.DataFrame([features])

        # Get anomaly detector
        anomaly_detector = model_manager.get_anomaly_detector()

        # Predict
        predictions, scores = anomaly_detector.predict(features_df)
        is_anomaly = predictions[0] == -1
        anomaly_score = float(scores[0])

        # Get explanation
        explanations = anomaly_detector.explain_anomaly(features_df)
        reasons = explanations[0]['anomaly_reasons'] if explanations else []

        return AnomalyDetectionResponse(
            wallet_address=request.wallet_address.lower(),
            is_anomaly=bool(is_anomaly),
            anomaly_score=anomaly_score,
            anomaly_threshold=float(anomaly_detector.threshold),
            anomaly_reasons=reasons,
            timestamp=datetime.now()
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Anomaly detection error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/behavior", response_model=TransactionPredictionResponse)
async def predict_transaction_behavior(
    request: TransactionPredictionRequest,
    http_request: Request
):
    """
    Predict future wallet transaction behavior.

    Args:
        request: Transaction prediction request

    Returns:
        Transaction behavior prediction
    """
    try:
        model_manager = http_request.app.state.model_manager

        if not model_manager.is_ready():
            raise HTTPException(status_code=503, detail="Models not loaded")

        # TODO: Get wallet data and features
        raise HTTPException(
            status_code=501,
            detail="Transaction prediction not yet fully implemented"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
