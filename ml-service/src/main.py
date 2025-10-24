"""Main FastAPI application for ML fraud detection service."""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.config import settings
from src.routes import predict, train, metrics

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    logger.info("🤖 ML Service starting up...")
    logger.info(f"Environment: {settings.env}")
    logger.info(f"Model version: {settings.model_version}")

    # Load models on startup
    try:
        from src.utils.model_manager import ModelManager
        model_manager = ModelManager()
        await model_manager.load_models()
        app.state.model_manager = model_manager
        logger.info("✅ Models loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ Could not load models: {e}")
        logger.info("Service will use fallback until models are trained")

    yield

    # Shutdown
    logger.info("🛑 ML Service shutting down...")


# Create FastAPI app
app = FastAPI(
    title="ZapPay ML Fraud Detection Service",
    description="AI-powered fraud detection for cryptocurrency payments",
    version=settings.model_version,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    """Log all requests."""
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    return response


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "ml-service",
        "version": settings.model_version,
        "env": settings.env
    }


# Include routers
app.include_router(predict.router, prefix="/api/predict", tags=["Prediction"])
app.include_router(train.router, prefix="/api/train", tags=["Training"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])


# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc) if settings.env == "development" else "An error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "src.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.env == "development",
        log_level=settings.log_level.lower()
    )
