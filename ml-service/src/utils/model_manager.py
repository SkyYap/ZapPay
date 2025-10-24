"""Model manager for loading and managing ML models."""
import logging
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime

from src.models.fraud_detector import FraudDetector
from src.models.anomaly_detector import AnomalyDetector
from src.models.predictor import TransactionPredictor
from src.services.explainer import ModelExplainer
from src.config import settings

logger = logging.getLogger(__name__)


class ModelManager:
    """Manage all ML models for the service."""

    def __init__(self, model_version: str = "1.0.0"):
        """
        Initialize model manager.

        Args:
            model_version: Version of models to load
        """
        self.model_version = model_version or settings.model_version
        self.model_dir = settings.model_dir

        # Models
        self.fraud_detector: Optional[FraudDetector] = None
        self.anomaly_detector: Optional[AnomalyDetector] = None
        self.transaction_predictor: Optional[TransactionPredictor] = None
        self.explainer: Optional[ModelExplainer] = None

        # State
        self.models_loaded = False
        self.load_time: Optional[datetime] = None

    async def load_models(self) -> None:
        """Load all models from disk."""
        logger.info(f"Loading models version {self.model_version}...")

        try:
            # Load fraud detector
            self.fraud_detector = FraudDetector(model_dir=str(self.model_dir))
            self.fraud_detector.load(version=self.model_version)
            logger.info("✅ Fraud detector loaded")

            # Load anomaly detector
            self.anomaly_detector = AnomalyDetector(model_dir=str(self.model_dir))
            self.anomaly_detector.load(version=self.model_version)
            logger.info("✅ Anomaly detector loaded")

            # Initialize transaction predictor (no loading needed)
            self.transaction_predictor = TransactionPredictor()
            logger.info("✅ Transaction predictor initialized")

            # Initialize explainer with Random Forest
            if self.fraud_detector and self.fraud_detector.rf_model:
                self.explainer = ModelExplainer(
                    self.fraud_detector.rf_model,
                    self.fraud_detector.feature_names
                )
                # Initialize with dummy background (will use real data when available)
                logger.info("✅ Explainer initialized")

            self.models_loaded = True
            self.load_time = datetime.now()

            logger.info(f"🎉 All models loaded successfully at {self.load_time}")

        except FileNotFoundError as e:
            logger.warning(f"⚠️ Models not found: {e}")
            logger.info("Models will need to be trained before use")
            self.models_loaded = False

        except Exception as e:
            logger.error(f"❌ Error loading models: {e}", exc_info=True)
            self.models_loaded = False
            raise

    def is_ready(self) -> bool:
        """Check if models are loaded and ready."""
        return (
            self.models_loaded and
            self.fraud_detector is not None and
            self.anomaly_detector is not None
        )

    def get_status(self) -> Dict[str, Any]:
        """Get status of all models."""
        status = {
            'models_loaded': self.models_loaded,
            'model_version': self.model_version,
            'load_time': self.load_time.isoformat() if self.load_time else None,
            'models': {
                'fraud_detector': self.fraud_detector is not None,
                'anomaly_detector': self.anomaly_detector is not None,
                'transaction_predictor': self.transaction_predictor is not None,
                'explainer': self.explainer is not None
            }
        }

        # Add metrics if available
        if self.fraud_detector and self.fraud_detector.metrics:
            status['fraud_detector_metrics'] = self.fraud_detector.metrics

        return status

    def get_fraud_detector(self) -> FraudDetector:
        """Get fraud detector model."""
        if not self.fraud_detector:
            raise ValueError("Fraud detector not loaded")
        return self.fraud_detector

    def get_anomaly_detector(self) -> AnomalyDetector:
        """Get anomaly detector model."""
        if not self.anomaly_detector:
            raise ValueError("Anomaly detector not loaded")
        return self.anomaly_detector

    def get_transaction_predictor(self) -> TransactionPredictor:
        """Get transaction predictor."""
        if not self.transaction_predictor:
            raise ValueError("Transaction predictor not initialized")
        return self.transaction_predictor

    def get_explainer(self) -> ModelExplainer:
        """Get explainer."""
        if not self.explainer:
            raise ValueError("Explainer not initialized")
        return self.explainer


# Global model manager instance
model_manager: Optional[ModelManager] = None


def get_model_manager() -> ModelManager:
    """Get global model manager instance."""
    global model_manager
    if model_manager is None:
        model_manager = ModelManager()
    return model_manager
