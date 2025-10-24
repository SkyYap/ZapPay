"""SHAP-based explainability for fraud detection models."""
import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
import shap

logger = logging.getLogger(__name__)


class ModelExplainer:
    """Explain model predictions using SHAP values."""

    def __init__(self, model, feature_names: List[str]):
        """
        Initialize explainer.

        Args:
            model: Trained model (sklearn or xgboost)
            feature_names: List of feature names
        """
        self.model = model
        self.feature_names = feature_names
        self.explainer: Optional[shap.Explainer] = None

    def initialize(self, X_background: Optional[pd.DataFrame] = None) -> None:
        """
        Initialize SHAP explainer.

        Args:
            X_background: Background dataset for SHAP (optional, uses sample if None)
        """
        logger.info("Initializing SHAP explainer...")

        try:
            # Try TreeExplainer for tree-based models (faster)
            self.explainer = shap.TreeExplainer(self.model)
            logger.info("Using TreeExplainer (tree-based model detected)")
        except Exception:
            # Fallback to KernelExplainer
            if X_background is None:
                raise ValueError("Background dataset required for KernelExplainer")

            # Sample background for faster computation
            background_sample = shap.sample(X_background, min(100, len(X_background)))

            def model_predict(X):
                return self.model.predict_proba(pd.DataFrame(X, columns=self.feature_names))[:, 1]

            self.explainer = shap.KernelExplainer(model_predict, background_sample)
            logger.info("Using KernelExplainer")

    def explain(
        self,
        X: pd.DataFrame,
        top_n: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Explain predictions using SHAP values.

        Args:
            X: Features to explain
            top_n: Number of top features to return

        Returns:
            List of explanations for each sample
        """
        if self.explainer is None:
            raise ValueError("Explainer not initialized. Call initialize() first.")

        # Ensure features match
        X = X[self.feature_names]

        # Calculate SHAP values
        logger.info(f"Calculating SHAP values for {len(X)} samples...")
        shap_values = self.explainer.shap_values(X)

        # If shap_values is a list (multi-class), take fraud class
        if isinstance(shap_values, list):
            shap_values = shap_values[1]  # Fraud class

        # Create explanations
        explanations = []
        for i in range(len(X)):
            # Get SHAP values for this sample
            sample_shap_values = shap_values[i] if len(shap_values.shape) == 2 else shap_values

            # Create feature importance list
            feature_contributions = []
            for j, feature_name in enumerate(self.feature_names):
                contribution = {
                    'feature': feature_name,
                    'shap_value': float(sample_shap_values[j]),
                    'feature_value': float(X.iloc[i][feature_name]),
                    'abs_contribution': abs(float(sample_shap_values[j]))
                }
                feature_contributions.append(contribution)

            # Sort by absolute contribution
            feature_contributions.sort(key=lambda x: x['abs_contribution'], reverse=True)

            # Get top contributors
            top_features = feature_contributions[:top_n]

            # Generate human-readable explanations
            reasons = []
            for feat in top_features[:5]:  # Top 5 for text reasons
                direction = "increases" if feat['shap_value'] > 0 else "decreases"
                reasons.append(
                    f"{feat['feature']} ({feat['feature_value']:.4f}) {direction} fraud risk "
                    f"by {abs(feat['shap_value']):.4f}"
                )

            explanations.append({
                'index': i,
                'top_features': top_features,
                'risk_factors': reasons,
                'base_value': float(self.explainer.expected_value) if hasattr(self.explainer, 'expected_value') else 0.5
            })

        return explanations

    def get_global_importance(self, X: pd.DataFrame) -> pd.DataFrame:
        """
        Get global feature importance across dataset.

        Args:
            X: Features

        Returns:
            DataFrame with global importance scores
        """
        if self.explainer is None:
            raise ValueError("Explainer not initialized")

        # Calculate SHAP values
        shap_values = self.explainer.shap_values(X[self.feature_names])

        if isinstance(shap_values, list):
            shap_values = shap_values[1]

        # Calculate mean absolute SHAP value for each feature
        mean_abs_shap = np.abs(shap_values).mean(axis=0)

        importance_df = pd.DataFrame({
            'feature': self.feature_names,
            'importance': mean_abs_shap
        }).sort_values('importance', ascending=False)

        return importance_df


def explain_prediction(
    model,
    X: pd.DataFrame,
    feature_names: List[str],
    X_background: Optional[pd.DataFrame] = None,
    top_n: int = 10
) -> List[Dict[str, Any]]:
    """
    Standalone function to explain predictions.

    Args:
        model: Trained model
        X: Features to explain
        feature_names: Feature names
        X_background: Background dataset for SHAP
        top_n: Number of top features

    Returns:
        List of explanations
    """
    explainer = ModelExplainer(model, feature_names)
    explainer.initialize(X_background)
    return explainer.explain(X, top_n)
