"""Anomaly detection using Isolation Forest."""
import logging
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Optional, Dict, Any, Tuple
from datetime import datetime

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)


class AnomalyDetector:
    """Anomaly detection for wallet behavior using Isolation Forest."""

    def __init__(
        self,
        model_dir: str = "data/trained_models",
        contamination: float = 0.1
    ):
        """
        Initialize anomaly detector.

        Args:
            model_dir: Directory to save/load models
            contamination: Expected proportion of outliers (0-0.5)
        """
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)

        self.contamination = contamination
        self.model: Optional[IsolationForest] = None
        self.scaler: Optional[StandardScaler] = None

        self.feature_names: list[str] = []
        self.training_date: Optional[datetime] = None
        self.threshold: float = 0.0

    def train(
        self,
        X_train: pd.DataFrame,
        **kwargs
    ) -> IsolationForest:
        """
        Train Isolation Forest model.

        Args:
            X_train: Training features (legitimate transactions only recommended)
            **kwargs: Additional parameters for IsolationForest

        Returns:
            Trained model
        """
        logger.info("Training Isolation Forest for anomaly detection...")

        self.feature_names = list(X_train.columns)
        self.training_date = datetime.now()

        # Fit scaler
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X_train)

        # Default parameters
        params = {
            'n_estimators': 100,
            'max_samples': 'auto',
            'contamination': self.contamination,
            'max_features': 1.0,
            'random_state': 42,
            'n_jobs': -1,
            'verbose': 1
        }
        params.update(kwargs)

        # Train model
        self.model = IsolationForest(**params)
        self.model.fit(X_scaled)

        # Calculate threshold
        scores = self.model.score_samples(X_scaled)
        self.threshold = np.percentile(scores, self.contamination * 100)

        logger.info(f"Isolation Forest training complete")
        logger.info(f"Anomaly threshold: {self.threshold:.4f}")

        return self.model

    def predict(
        self,
        X: pd.DataFrame
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Predict anomalies.

        Args:
            X: Features

        Returns:
            Tuple of (predictions, anomaly_scores)
            predictions: -1 for anomalies, 1 for normal
            anomaly_scores: Higher score = more anomalous
        """
        if self.model is None or self.scaler is None:
            raise ValueError("Model not trained. Call train() first.")

        # Ensure features match
        X = X[self.feature_names]

        # Scale features
        X_scaled = self.scaler.transform(X)

        # Predict
        predictions = self.model.predict(X_scaled)  # -1 or 1
        scores = self.model.score_samples(X_scaled)  # Anomaly scores

        # Convert scores: lower score = more anomalous
        # Invert so higher score = more anomalous
        anomaly_scores = -scores

        return predictions, anomaly_scores

    def is_anomaly(self, X: pd.DataFrame) -> np.ndarray:
        """
        Check if samples are anomalies.

        Args:
            X: Features

        Returns:
            Boolean array (True = anomaly)
        """
        predictions, _ = self.predict(X)
        return predictions == -1

    def get_anomaly_score(self, X: pd.DataFrame) -> np.ndarray:
        """
        Get anomaly scores.

        Args:
            X: Features

        Returns:
            Array of anomaly scores (higher = more anomalous)
        """
        _, scores = self.predict(X)
        return scores

    def explain_anomaly(
        self,
        X: pd.DataFrame,
        feature_threshold: float = 2.0
    ) -> list[Dict[str, Any]]:
        """
        Explain why samples are anomalous.

        Args:
            X: Features
            feature_threshold: Z-score threshold for unusual features

        Returns:
            List of anomaly explanations
        """
        if self.scaler is None:
            raise ValueError("Model not trained")

        # Calculate z-scores for each feature
        X_scaled = self.scaler.transform(X[self.feature_names])

        explanations = []
        for i in range(len(X)):
            unusual_features = []

            for j, feature_name in enumerate(self.feature_names):
                z_score = abs(X_scaled[i, j])

                if z_score > feature_threshold:
                    unusual_features.append({
                        'feature': feature_name,
                        'z_score': float(z_score),
                        'value': float(X.iloc[i][feature_name]),
                        'reason': f"{feature_name} is {z_score:.2f} standard deviations from normal"
                    })

            # Sort by z-score
            unusual_features.sort(key=lambda x: x['z_score'], reverse=True)

            explanations.append({
                'index': i,
                'unusual_features': unusual_features[:5],  # Top 5
                'anomaly_reasons': [f['reason'] for f in unusual_features[:3]]
            })

        return explanations

    def save(self, version: str = "1.0.0") -> None:
        """
        Save model to disk.

        Args:
            version: Model version string
        """
        logger.info(f"Saving Isolation Forest version {version}...")

        # Save model
        model_path = self.model_dir / f"isolation_forest_v{version}.joblib"
        joblib.dump(self.model, model_path)
        logger.info(f"Saved model to {model_path}")

        # Save scaler
        scaler_path = self.model_dir / f"anomaly_scaler_v{version}.joblib"
        joblib.dump(self.scaler, scaler_path)
        logger.info(f"Saved scaler to {scaler_path}")

        # Save metadata
        metadata = {
            'version': version,
            'feature_names': self.feature_names,
            'contamination': self.contamination,
            'threshold': self.threshold,
            'training_date': self.training_date.isoformat() if self.training_date else None
        }
        metadata_path = self.model_dir / f"anomaly_metadata_v{version}.joblib"
        joblib.dump(metadata, metadata_path)
        logger.info(f"Saved metadata to {metadata_path}")

    def load(self, version: str = "1.0.0") -> None:
        """
        Load model from disk.

        Args:
            version: Model version string
        """
        logger.info(f"Loading Isolation Forest version {version}...")

        # Load model
        model_path = self.model_dir / f"isolation_forest_v{version}.joblib"
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found: {model_path}")
        self.model = joblib.load(model_path)
        logger.info(f"Loaded model from {model_path}")

        # Load scaler
        scaler_path = self.model_dir / f"anomaly_scaler_v{version}.joblib"
        if not scaler_path.exists():
            raise FileNotFoundError(f"Scaler not found: {scaler_path}")
        self.scaler = joblib.load(scaler_path)
        logger.info(f"Loaded scaler from {scaler_path}")

        # Load metadata
        metadata_path = self.model_dir / f"anomaly_metadata_v{version}.joblib"
        if metadata_path.exists():
            metadata = joblib.load(metadata_path)
            self.feature_names = metadata.get('feature_names', [])
            self.contamination = metadata.get('contamination', 0.1)
            self.threshold = metadata.get('threshold', 0.0)
            training_date_str = metadata.get('training_date')
            self.training_date = datetime.fromisoformat(training_date_str) if training_date_str else None
            logger.info(f"Loaded metadata from {metadata_path}")

        logger.info("Isolation Forest loaded successfully")
