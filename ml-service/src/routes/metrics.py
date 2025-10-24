"""Metrics API routes."""
import logging
from fastapi import APIRouter, HTTPException, Request
from datetime import datetime

from src.schemas import MetricsResponse, ModelMetrics
from src.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=MetricsResponse)
async def get_metrics(http_request: Request):
    """
    Get model performance metrics.

    Returns:
        Metrics for all models
    """
    try:
        model_manager = http_request.app.state.model_manager

        if not model_manager.is_ready():
            raise HTTPException(status_code=503, detail="Models not loaded")

        # Get fraud detector metrics
        fraud_detector = model_manager.get_fraud_detector()
        metrics_data = fraud_detector.metrics

        rf_metrics = None
        xgb_metrics = None
        ensemble_accuracy = None

        if metrics_data:
            # Random Forest metrics
            rf_metrics = ModelMetrics(
                model_name="Random Forest",
                version=settings.model_version,
                accuracy=metrics_data.get('rf_accuracy', 0),
                precision=metrics_data.get('rf_precision', 0),
                recall=metrics_data.get('rf_recall', 0),
                f1_score=metrics_data.get('rf_f1', 0),
                auc_roc=metrics_data.get('rf_auc_roc', 0),
                training_samples=metrics_data.get('training_samples', 0),
                last_trained=fraud_detector.training_date or datetime.now(),
                feature_count=metrics_data.get('feature_count', 0)
            )

            # XGBoost metrics
            xgb_metrics = ModelMetrics(
                model_name="XGBoost",
                version=settings.model_version,
                accuracy=metrics_data.get('xgb_accuracy', 0),
                precision=metrics_data.get('xgb_precision', 0),
                recall=metrics_data.get('xgb_recall', 0),
                f1_score=metrics_data.get('xgb_f1', 0),
                auc_roc=metrics_data.get('xgb_auc_roc', 0),
                training_samples=metrics_data.get('training_samples', 0),
                last_trained=fraud_detector.training_date or datetime.now(),
                feature_count=metrics_data.get('feature_count', 0)
            )

            ensemble_accuracy = metrics_data.get('ensemble_accuracy', 0)

        # TODO: Get isolation forest metrics
        # TODO: Get prediction/feedback counts from database

        return MetricsResponse(
            random_forest=rf_metrics,
            xgboost=xgb_metrics,
            isolation_forest=None,  # TODO
            ensemble_accuracy=ensemble_accuracy,
            total_predictions=0,  # TODO: Track this
            total_feedback=0,  # TODO: Track this
            timestamp=datetime.now()
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Metrics error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check(http_request: Request):
    """
    Detailed health check with model status.

    Returns:
        Health status with model info
    """
    try:
        model_manager = http_request.app.state.model_manager
        status = model_manager.get_status()

        return {
            **status,
            "service": "ml-service",
            "version": settings.model_version,
            "env": settings.env
        }

    except Exception as e:
        logger.error(f"Health check error: {e}", exc_info=True)
        return {
            "status": "error",
            "message": str(e),
            "models_loaded": False
        }
