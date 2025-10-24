"""Pydantic schemas for API requests and responses."""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


# Request Models
class PredictRequest(BaseModel):
    """Request model for fraud prediction."""
    wallet_address: str = Field(..., description="Ethereum wallet address to analyze")
    chain_id: int = Field(default=84532, description="Blockchain chain ID")
    features: Optional[Dict[str, Any]] = Field(None, description="Pre-computed features (optional)")


class ExplainRequest(BaseModel):
    """Request for explainable prediction."""
    wallet_address: str
    chain_id: int = 84532


class AnomalyDetectionRequest(BaseModel):
    """Request for anomaly detection."""
    wallet_address: str
    chain_id: int = 84532
    features: Optional[Dict[str, Any]] = None


class TransactionPredictionRequest(BaseModel):
    """Request for transaction behavior prediction."""
    wallet_address: str
    chain_id: int = 84532
    prediction_window_days: int = Field(default=7, description="Days to predict ahead")


class FeedbackRequest(BaseModel):
    """Request to submit labeled feedback for continuous learning."""
    wallet_address: str
    actual_fraud: bool = Field(..., description="True if wallet was fraudulent")
    predicted_fraud: bool = Field(..., description="What model predicted")
    risk_score: float = Field(..., ge=0, le=100, description="Original risk score")
    notes: Optional[str] = Field(None, description="Additional notes")
    merchant_id: Optional[str] = Field(None, description="Merchant who provided feedback")


class RetrainRequest(BaseModel):
    """Request to trigger model retraining."""
    force: bool = Field(default=False, description="Force retrain even if conditions not met")
    model_type: str = Field(default="all", description="Which model to retrain: rf, xgb, isolation, all")


# Response Models
class FeatureImportance(BaseModel):
    """Feature importance for explainability."""
    feature_name: str
    importance: float
    shap_value: Optional[float] = None


class PredictionResponse(BaseModel):
    """Response model for fraud prediction."""
    wallet_address: str
    fraud_probability: float = Field(..., ge=0, le=1, description="Probability of fraud (0-1)")
    risk_score: int = Field(..., ge=0, le=100, description="Risk score (0-100)")
    is_fraud: bool = Field(..., description="Binary classification")
    confidence: float = Field(..., ge=0, le=1, description="Prediction confidence")
    model_version: str
    timestamp: datetime
    processing_time_ms: float


class ExplainResponse(BaseModel):
    """Response for explainable prediction."""
    wallet_address: str
    fraud_probability: float
    risk_score: int
    is_fraud: bool
    feature_contributions: List[FeatureImportance]
    top_risk_factors: List[str] = Field(..., description="Human-readable risk factors")
    model_version: str
    timestamp: datetime


class AnomalyDetectionResponse(BaseModel):
    """Response for anomaly detection."""
    wallet_address: str
    is_anomaly: bool
    anomaly_score: float = Field(..., description="Higher = more anomalous")
    anomaly_threshold: float
    anomaly_reasons: List[str] = Field(..., description="Why flagged as anomaly")
    timestamp: datetime


class TransactionPredictionResponse(BaseModel):
    """Response for transaction prediction."""
    wallet_address: str
    predicted_transaction_count: int
    predicted_risk_evolution: str = Field(..., description="increasing, decreasing, stable")
    risk_score_7d: float = Field(..., description="Predicted risk in 7 days")
    confidence: float
    timestamp: datetime


class FeedbackResponse(BaseModel):
    """Response for feedback submission."""
    success: bool
    message: str
    feedback_id: str
    will_retrain: bool = Field(..., description="Whether this triggers retraining")


class ModelMetrics(BaseModel):
    """Model performance metrics."""
    model_name: str
    version: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    auc_roc: float
    training_samples: int
    last_trained: datetime
    feature_count: int


class MetricsResponse(BaseModel):
    """Response with all model metrics."""
    random_forest: Optional[ModelMetrics] = None
    xgboost: Optional[ModelMetrics] = None
    isolation_forest: Optional[ModelMetrics] = None
    ensemble_accuracy: Optional[float] = None
    total_predictions: int
    total_feedback: int
    timestamp: datetime


class RetrainResponse(BaseModel):
    """Response for retrain request."""
    success: bool
    message: str
    models_retrained: List[str]
    new_metrics: Optional[ModelMetrics] = None
    training_duration_seconds: float
    timestamp: datetime


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    version: str
    env: str
    models_loaded: bool = True
    uptime_seconds: Optional[float] = None
