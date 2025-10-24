"""Training API routes."""
import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from datetime import datetime

from src.schemas import (
    FeedbackRequest, FeedbackResponse,
    RetrainRequest, RetrainResponse
)
from src.services.trainer import TrainingService
from src.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize training service
training_service = TrainingService()


@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(request: FeedbackRequest):
    """
    Submit feedback for continuous learning.

    Args:
        request: Feedback with actual fraud label

    Returns:
        Feedback confirmation
    """
    try:
        # Store feedback
        feedback_id = await training_service.store_feedback(
            wallet_address=request.wallet_address,
            actual_fraud=request.actual_fraud,
            predicted_fraud=request.predicted_fraud,
            risk_score=request.risk_score,
            notes=request.notes,
            merchant_id=request.merchant_id
        )

        # Check if we should retrain
        feedback_count = await training_service.get_feedback_count()
        will_retrain = (
            settings.auto_retrain and
            feedback_count >= settings.min_training_samples
        )

        return FeedbackResponse(
            success=True,
            message="Feedback recorded successfully",
            feedback_id=feedback_id,
            will_retrain=will_retrain
        )

    except Exception as e:
        logger.error(f"Feedback error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/retrain", response_model=RetrainResponse)
async def retrain_models(
    request: RetrainRequest,
    background_tasks: BackgroundTasks,
    http_request: Request
):
    """
    Trigger model retraining.

    Args:
        request: Retrain request
        background_tasks: FastAPI background tasks

    Returns:
        Retraining status
    """
    try:
        model_manager = http_request.app.state.model_manager

        # Check if retraining is needed
        if not request.force:
            feedback_count = await training_service.get_feedback_count()
            if feedback_count < settings.min_training_samples:
                return RetrainResponse(
                    success=False,
                    message=f"Not enough training samples. Need {settings.min_training_samples}, have {feedback_count}",
                    models_retrained=[],
                    new_metrics=None,
                    training_duration_seconds=0,
                    timestamp=datetime.now()
                )

        # Start training in background
        background_tasks.add_task(
            training_service.retrain_models,
            model_manager,
            request.model_type
        )

        return RetrainResponse(
            success=True,
            message="Retraining started in background",
            models_retrained=[request.model_type],
            new_metrics=None,
            training_duration_seconds=0,
            timestamp=datetime.now()
        )

    except Exception as e:
        logger.error(f"Retrain error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
