"""Transaction behavior prediction model."""
import logging
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class TransactionPredictor:
    """Predict future wallet behavior and risk evolution."""

    def __init__(self):
        """Initialize transaction predictor."""
        self.prediction_window_days = 7

    def predict_transaction_count(
        self,
        historical_data: Dict[str, Any]
    ) -> int:
        """
        Predict future transaction count.

        Args:
            historical_data: Wallet historical data with transactions

        Returns:
            Predicted transaction count for next period
        """
        transactions = historical_data.get('transactions', [])

        if not transactions or len(transactions) < 2:
            return 0

        # Calculate average daily transaction rate
        df = pd.DataFrame(transactions)
        df['timestamp'] = pd.to_datetime(df['timeStamp'].astype(int), unit='s')

        # Get time range
        min_time = df['timestamp'].min()
        max_time = df['timestamp'].max()
        days_active = (max_time - min_time).days

        if days_active == 0:
            days_active = 1

        # Calculate rate
        tx_per_day = len(transactions) / days_active

        # Predict for window
        predicted_count = int(tx_per_day * self.prediction_window_days)

        return max(0, predicted_count)

    def predict_risk_evolution(
        self,
        current_risk_score: float,
        features: Dict[str, float]
    ) -> Tuple[float, str]:
        """
        Predict how risk will evolve.

        Args:
            current_risk_score: Current risk score (0-100)
            features: Current wallet features

        Returns:
            Tuple of (predicted_risk_7d, trend)
            trend: "increasing", "decreasing", "stable"
        """
        # Simple heuristic-based prediction
        # In production, this would use time-series ML

        # Risk factors that suggest increasing risk
        increasing_factors = 0
        decreasing_factors = 0

        # Check transaction velocity
        avg_time_sent = features.get('avg_min_between_sent_tnx', 0)
        if avg_time_sent < 60 and avg_time_sent > 0:  # < 1 hour between txs
            increasing_factors += 1

        # Check transaction count
        total_txs = features.get('total_transactions', 0)
        if total_txs < 10:  # Very new wallet
            increasing_factors += 1
        elif total_txs > 100:  # Established wallet
            decreasing_factors += 1

        # Check balance
        balance = features.get('total_ether_balance', 0)
        if balance < 0.01:  # Very low balance
            increasing_factors += 1

        # Check value patterns
        avg_sent = features.get('avg_val_sent', 0)
        max_sent = features.get('max_val_sent', 0)
        if max_sent > avg_sent * 10 and avg_sent > 0:  # Large unusual transaction
            increasing_factors += 1

        # Predict trend
        if increasing_factors > decreasing_factors:
            trend = "increasing"
            # Risk increases by 10-20%
            risk_change = np.random.uniform(1.1, 1.2)
        elif decreasing_factors > increasing_factors:
            trend = "decreasing"
            # Risk decreases by 10-20%
            risk_change = np.random.uniform(0.8, 0.9)
        else:
            trend = "stable"
            # Risk stays within +/- 5%
            risk_change = np.random.uniform(0.95, 1.05)

        predicted_risk = min(100, max(0, current_risk_score * risk_change))

        return predicted_risk, trend

    def predict(
        self,
        wallet_data: Dict[str, Any],
        current_risk_score: float,
        features: Dict[str, float],
        prediction_window_days: int = 7
    ) -> Dict[str, Any]:
        """
        Full prediction for wallet behavior.

        Args:
            wallet_data: Historical wallet data
            current_risk_score: Current risk score
            features: Current features
            prediction_window_days: Days to predict ahead

        Returns:
            Dictionary with predictions
        """
        self.prediction_window_days = prediction_window_days

        # Predict transaction count
        tx_count = self.predict_transaction_count(wallet_data)

        # Predict risk evolution
        future_risk, trend = self.predict_risk_evolution(current_risk_score, features)

        # Calculate confidence based on data availability
        transactions = wallet_data.get('transactions', [])
        if len(transactions) < 5:
            confidence = 0.3  # Low confidence for new wallets
        elif len(transactions) < 20:
            confidence = 0.6  # Medium confidence
        else:
            confidence = 0.85  # High confidence

        return {
            'predicted_transaction_count': tx_count,
            'predicted_risk_evolution': trend,
            'risk_score_7d': float(future_risk),
            'confidence': confidence,
            'prediction_window_days': prediction_window_days
        }


# Standalone prediction function
def predict_wallet_behavior(
    wallet_data: Dict[str, Any],
    current_risk_score: float,
    features: Dict[str, float],
    prediction_window_days: int = 7
) -> Dict[str, Any]:
    """
    Predict wallet behavior.

    Args:
        wallet_data: Historical wallet data
        current_risk_score: Current risk score
        features: Current features
        prediction_window_days: Days ahead

    Returns:
        Prediction dictionary
    """
    predictor = TransactionPredictor()
    return predictor.predict(wallet_data, current_risk_score, features, prediction_window_days)
