"""Configuration management for ML service."""
from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    """Application settings."""

    # Server
    port: int = 3003
    host: str = "0.0.0.0"
    env: str = "development"

    # Model
    model_version: str = "1.0.0"
    model_path: str = "data/trained_models"
    retrain_interval_hours: int = 168

    # Feature Engineering
    basescan_api_key: str = ""
    enable_feature_caching: bool = True

    # Database
    database_url: str = "sqlite+aiosqlite:///data/training_data/ml_training.db"

    # Redis
    redis_url: str = "redis://localhost:6379"
    enable_redis: bool = False

    # External Services
    analysis_engine_url: str = "http://localhost:3002"

    # Logging
    log_level: str = "INFO"

    # CORS
    allowed_origins: str = "http://localhost:3001,http://localhost:5173,http://localhost:5174"

    # Model Performance
    min_accuracy: float = 0.90
    min_precision: float = 0.85
    min_recall: float = 0.80

    # Continuous Learning
    auto_retrain: bool = True
    min_training_samples: int = 1000

    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def allowed_origins_list(self) -> list[str]:
        """Parse allowed origins into a list."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    @property
    def model_dir(self) -> Path:
        """Get model directory as Path object."""
        return Path(self.model_path)


# Global settings instance
settings = Settings()
