"""Fraud detection models using Random Forest and XGBoost."""
import logging
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Tuple, Optional, Any
from datetime import datetime

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix,
    classification_report
)
import xgboost as xgb

logger = logging.getLogger(__name__)


class FraudDetector:
    """Ensemble fraud detection model using Random Forest and XGBoost."""

    def __init__(
        self,
        model_dir: str = "data/trained_models",
        use_ensemble: bool = True
    ):
        """
        Initialize fraud detector.

        Args:
            model_dir: Directory to save/load models
            use_ensemble: Whether to use ensemble of RF + XGBoost
        """
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)

        self.use_ensemble = use_ensemble
        self.rf_model: Optional[RandomForestClassifier] = None
        self.xgb_model: Optional[xgb.XGBClassifier] = None

        self.feature_names: list[str] = []
        self.metrics: Dict[str, Any] = {}
        self.training_date: Optional[datetime] = None

    def train_random_forest(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        **kwargs
    ) -> RandomForestClassifier:
        """
        Train Random Forest classifier.

        Args:
            X_train: Training features
            y_train: Training labels
            **kwargs: Additional parameters for RandomForestClassifier

        Returns:
            Trained model
        """
        logger.info("Training Random Forest model...")

        # Default parameters optimized for fraud detection
        params = {
            'n_estimators': 200,
            'max_depth': 20,
            'min_samples_split': 10,
            'min_samples_leaf': 4,
            'max_features': 'sqrt',
            'class_weight': 'balanced',
            'random_state': 42,
            'n_jobs': -1,
            'verbose': 1
        }
        params.update(kwargs)

        self.rf_model = RandomForestClassifier(**params)
        self.rf_model.fit(X_train, y_train)

        logger.info("Random Forest training complete")
        return self.rf_model

    def train_xgboost(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        **kwargs
    ) -> xgb.XGBClassifier:
        """
        Train XGBoost classifier.

        Args:
            X_train: Training features
            y_train: Training labels
            **kwargs: Additional parameters for XGBClassifier

        Returns:
            Trained model
        """
        logger.info("Training XGBoost model...")

        # Calculate scale_pos_weight for imbalanced data
        neg_count = (y_train == 0).sum()
        pos_count = (y_train == 1).sum()
        scale_pos_weight = neg_count / pos_count if pos_count > 0 else 1

        # Default parameters
        params = {
            'n_estimators': 200,
            'max_depth': 10,
            'learning_rate': 0.1,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'scale_pos_weight': scale_pos_weight,
            'random_state': 42,
            'n_jobs': -1,
            'eval_metric': 'logloss'
        }
        params.update(kwargs)

        self.xgb_model = xgb.XGBClassifier(**params)
        self.xgb_model.fit(X_train, y_train)

        logger.info("XGBoost training complete")
        return self.xgb_model

    def train(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_test: pd.DataFrame,
        y_test: pd.Series,
        rf_params: Optional[Dict] = None,
        xgb_params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Train both models and evaluate.

        Args:
            X_train: Training features
            y_train: Training labels
            X_test: Test features
            y_test: Test labels
            rf_params: Random Forest parameters
            xgb_params: XGBoost parameters

        Returns:
            Dictionary with training metrics
        """
        self.feature_names = list(X_train.columns)
        self.training_date = datetime.now()

        # Train models
        self.train_random_forest(X_train, y_train, **(rf_params or {}))
        self.train_xgboost(X_train, y_train, **(xgb_params or {}))

        # Evaluate
        metrics = self.evaluate(X_test, y_test)
        self.metrics = metrics

        logger.info("\n=== Training Complete ===")
        logger.info(f"Ensemble Accuracy: {metrics['ensemble_accuracy']:.4f}")
        logger.info(f"Ensemble Precision: {metrics['ensemble_precision']:.4f}")
        logger.info(f"Ensemble Recall: {metrics['ensemble_recall']:.4f}")
        logger.info(f"Ensemble F1: {metrics['ensemble_f1']:.4f}")
        logger.info(f"Ensemble AUC-ROC: {metrics['ensemble_auc_roc']:.4f}")

        return metrics

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """
        Predict fraud probabilities.

        Args:
            X: Features

        Returns:
            Array of probabilities (0-1) for fraud class
        """
        if self.rf_model is None or self.xgb_model is None:
            raise ValueError("Models not trained. Call train() first.")

        # Ensure features match training
        X = X[self.feature_names]

        if self.use_ensemble:
            # Weighted ensemble: 60% RF, 40% XGBoost
            rf_proba = self.rf_model.predict_proba(X)[:, 1]
            xgb_proba = self.xgb_model.predict_proba(X)[:, 1]
            ensemble_proba = 0.6 * rf_proba + 0.4 * xgb_proba
            return ensemble_proba
        else:
            # Use Random Forest only
            return self.rf_model.predict_proba(X)[:, 1]

    def predict(self, X: pd.DataFrame, threshold: float = 0.5) -> np.ndarray:
        """
        Predict fraud labels.

        Args:
            X: Features
            threshold: Classification threshold

        Returns:
            Binary predictions (0 or 1)
        """
        proba = self.predict_proba(X)
        return (proba >= threshold).astype(int)

    def evaluate(
        self,
        X_test: pd.DataFrame,
        y_test: pd.Series
    ) -> Dict[str, float]:
        """
        Evaluate model performance.

        Args:
            X_test: Test features
            y_test: Test labels

        Returns:
            Dictionary with metrics
        """
        logger.info("Evaluating models...")

        # Predictions
        rf_pred = self.rf_model.predict(X_test)
        rf_proba = self.rf_model.predict_proba(X_test)[:, 1]

        xgb_pred = self.xgb_model.predict(X_test)
        xgb_proba = self.xgb_model.predict_proba(X_test)[:, 1]

        ensemble_proba = 0.6 * rf_proba + 0.4 * xgb_proba
        ensemble_pred = (ensemble_proba >= 0.5).astype(int)

        # Calculate metrics
        metrics = {
            # Random Forest
            'rf_accuracy': accuracy_score(y_test, rf_pred),
            'rf_precision': precision_score(y_test, rf_pred, zero_division=0),
            'rf_recall': recall_score(y_test, rf_pred, zero_division=0),
            'rf_f1': f1_score(y_test, rf_pred, zero_division=0),
            'rf_auc_roc': roc_auc_score(y_test, rf_proba),

            # XGBoost
            'xgb_accuracy': accuracy_score(y_test, xgb_pred),
            'xgb_precision': precision_score(y_test, xgb_pred, zero_division=0),
            'xgb_recall': recall_score(y_test, xgb_pred, zero_division=0),
            'xgb_f1': f1_score(y_test, xgb_pred, zero_division=0),
            'xgb_auc_roc': roc_auc_score(y_test, xgb_proba),

            # Ensemble
            'ensemble_accuracy': accuracy_score(y_test, ensemble_pred),
            'ensemble_precision': precision_score(y_test, ensemble_pred, zero_division=0),
            'ensemble_recall': recall_score(y_test, ensemble_pred, zero_division=0),
            'ensemble_f1': f1_score(y_test, ensemble_pred, zero_division=0),
            'ensemble_auc_roc': roc_auc_score(y_test, ensemble_proba),

            # Additional info
            'training_samples': len(X_test),
            'feature_count': len(self.feature_names)
        }

        return metrics

    def get_feature_importance(self, top_n: int = 20) -> pd.DataFrame:
        """
        Get feature importance from Random Forest.

        Args:
            top_n: Number of top features to return

        Returns:
            DataFrame with feature importances
        """
        if self.rf_model is None:
            raise ValueError("Model not trained")

        importances = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.rf_model.feature_importances_
        })

        return importances.sort_values('importance', ascending=False).head(top_n)

    def save(self, version: str = "1.0.0") -> None:
        """
        Save models to disk.

        Args:
            version: Model version string
        """
        logger.info(f"Saving models version {version}...")

        # Save Random Forest
        rf_path = self.model_dir / f"random_forest_v{version}.joblib"
        joblib.dump(self.rf_model, rf_path)
        logger.info(f"Saved Random Forest to {rf_path}")

        # Save XGBoost
        xgb_path = self.model_dir / f"xgboost_v{version}.joblib"
        joblib.dump(self.xgb_model, xgb_path)
        logger.info(f"Saved XGBoost to {xgb_path}")

        # Save metadata
        metadata = {
            'version': version,
            'feature_names': self.feature_names,
            'metrics': self.metrics,
            'training_date': self.training_date.isoformat() if self.training_date else None,
            'use_ensemble': self.use_ensemble
        }
        metadata_path = self.model_dir / f"metadata_v{version}.joblib"
        joblib.dump(metadata, metadata_path)
        logger.info(f"Saved metadata to {metadata_path}")

    def load(self, version: str = "1.0.0") -> None:
        """
        Load models from disk.

        Args:
            version: Model version string
        """
        logger.info(f"Loading models version {version}...")

        # Load Random Forest
        rf_path = self.model_dir / f"random_forest_v{version}.joblib"
        if not rf_path.exists():
            raise FileNotFoundError(f"Random Forest model not found: {rf_path}")
        self.rf_model = joblib.load(rf_path)
        logger.info(f"Loaded Random Forest from {rf_path}")

        # Load XGBoost
        xgb_path = self.model_dir / f"xgboost_v{version}.joblib"
        if not xgb_path.exists():
            raise FileNotFoundError(f"XGBoost model not found: {xgb_path}")
        self.xgb_model = joblib.load(xgb_path)
        logger.info(f"Loaded XGBoost from {xgb_path}")

        # Load metadata
        metadata_path = self.model_dir / f"metadata_v{version}.joblib"
        if metadata_path.exists():
            metadata = joblib.load(metadata_path)
            self.feature_names = metadata.get('feature_names', [])
            self.metrics = metadata.get('metrics', {})
            training_date_str = metadata.get('training_date')
            self.training_date = datetime.fromisoformat(training_date_str) if training_date_str else None
            self.use_ensemble = metadata.get('use_ensemble', True)
            logger.info(f"Loaded metadata from {metadata_path}")

        logger.info("Models loaded successfully")
