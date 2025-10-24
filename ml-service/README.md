# ML Service - AI-Powered Fraud Detection

Advanced machine learning service for cryptocurrency wallet fraud detection, powered by Random Forest, XGBoost, and Isolation Forest models.

## Features

- **Fraud Detection**: Ensemble ML models (Random Forest + XGBoost) for high-accuracy fraud prediction
- **Anomaly Detection**: Isolation Forest for detecting unusual wallet behavior
- **Explainable AI**: SHAP values for model interpretability and transparency
- **Transaction Prediction**: Predict future wallet behavior and risk evolution
- **Continuous Learning**: Feedback loop for model improvement over time
- **RESTful API**: FastAPI-based service for easy integration

## Quick Start

### 1. Install Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Download Kaggle Dataset

1. Visit [Kaggle Ethereum Fraud Detection Dataset](https://www.kaggle.com/datasets/vagifa/ethereum-frauddetection-dataset)
2. Download the dataset (requires Kaggle account)
3. Extract to `data/kaggle/transaction_dataset.csv`

### 3. Train Models

```bash
python train_models.py --version 1.0.0
```

This will:
- Load and preprocess the Kaggle dataset
- Handle class imbalance with SMOTE
- Train Random Forest and XGBoost classifiers
- Train Isolation Forest for anomaly detection
- Save models to `data/trained_models/`

Expected performance:
- **Accuracy**: >95%
- **Precision**: >90%
- **Recall**: >85%
- **AUC-ROC**: >0.95

### 4. Start Service

```bash
# Development mode
python -m src.main

# Or with uvicorn directly
uvicorn src.main:app --host 0.0.0.0 --port 3003 --reload
```

Service runs on `http://localhost:3003`

## API Endpoints

### Prediction

#### POST /api/predict
Predict fraud probability for a wallet.

**Request:**
```json
{
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
  "chain_id": 84532,
  "features": {
    "total_transactions": 42,
    "total_ether_sent": 1.5,
    "total_ether_received": 2.3,
    ...
  }
}
```

**Response:**
```json
{
  "wallet_address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb0",
  "fraud_probability": 0.23,
  "risk_score": 23,
  "is_fraud": false,
  "confidence": 0.85,
  "model_version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "processing_time_ms": 45.2
}
```

#### POST /api/predict/explain
Get explainable prediction with SHAP values.

**Response includes:**
- Feature contributions (SHAP values)
- Top risk factors in human-readable format
- Feature importance breakdown

#### POST /api/predict/anomaly
Detect anomalous wallet behavior.

**Response:**
```json
{
  "wallet_address": "0x...",
  "is_anomaly": true,
  "anomaly_score": 0.87,
  "anomaly_threshold": 0.5,
  "anomaly_reasons": [
    "total_transactions is 4.2 standard deviations from normal",
    "avg_val_sent is 3.1 standard deviations from normal"
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### POST /api/predict/behavior
Predict future wallet behavior.

**Response:**
```json
{
  "wallet_address": "0x...",
  "predicted_transaction_count": 15,
  "predicted_risk_evolution": "increasing",
  "risk_score_7d": 45.2,
  "confidence": 0.75,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Training & Feedback

#### POST /api/train/feedback
Submit feedback for continuous learning.

**Request:**
```json
{
  "wallet_address": "0x...",
  "actual_fraud": true,
  "predicted_fraud": false,
  "risk_score": 35.5,
  "notes": "Confirmed fraud by merchant investigation",
  "merchant_id": "merchant_123"
}
```

#### POST /api/train/retrain
Trigger model retraining.

**Request:**
```json
{
  "force": false,
  "model_type": "all"
}
```

### Metrics

#### GET /api/metrics
Get model performance metrics.

**Response:**
```json
{
  "random_forest": {
    "accuracy": 0.96,
    "precision": 0.92,
    "recall": 0.89,
    "f1_score": 0.90,
    "auc_roc": 0.97
  },
  "xgboost": { ... },
  "ensemble_accuracy": 0.97,
  "total_predictions": 1523,
  "total_feedback": 42
}
```

#### GET /health
Health check with model status.

## Architecture

```
ml-service/
├── src/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration
│   ├── schemas.py           # Pydantic models
│   ├── models/
│   │   ├── fraud_detector.py    # RF + XGBoost ensemble
│   │   ├── anomaly_detector.py  # Isolation Forest
│   │   └── predictor.py         # Transaction prediction
│   ├── services/
│   │   ├── feature_engineering.py  # Feature extraction
│   │   ├── explainer.py           # SHAP explanations
│   │   └── trainer.py             # Continuous learning
│   ├── routes/
│   │   ├── predict.py    # Prediction endpoints
│   │   ├── train.py      # Training endpoints
│   │   └── metrics.py    # Metrics endpoints
│   └── utils/
│       ├── data_loader.py    # Kaggle data loading
│       └── model_manager.py  # Model lifecycle
├── data/
│   ├── kaggle/           # Kaggle dataset
│   ├── trained_models/   # Saved models
│   └── training_data/    # Feedback data
├── notebooks/            # Jupyter experiments
├── train_models.py       # Training script
└── requirements.txt
```

## Feature Engineering

The service extracts 45+ features matching the Kaggle dataset:

**Transaction Metrics:**
- Total transactions (sent/received)
- Transaction frequency
- Time between transactions

**Value Statistics:**
- Min/max/avg Ether sent/received
- Total balance
- Contract interaction values

**Behavioral:**
- Unique addresses interacted with
- Transaction patterns
- Gas usage patterns

**ERC20 Tokens:**
- Token transfer counts
- Token types
- Token value statistics

## Model Details

### Random Forest
- **Estimators**: 200 trees
- **Max Depth**: 20
- **Class Weight**: Balanced
- **Features**: sqrt selection
- **Performance**: ~96% accuracy

### XGBoost
- **Estimators**: 200
- **Max Depth**: 10
- **Learning Rate**: 0.1
- **Scale Pos Weight**: Auto-balanced
- **Performance**: ~95% accuracy

### Ensemble
- **Weighting**: 60% RF + 40% XGBoost
- **Performance**: ~97% accuracy

### Isolation Forest
- **Estimators**: 100
- **Contamination**: 10%
- **Use Case**: Detect novel fraud patterns

## Continuous Learning

1. **Feedback Collection**: Merchants submit actual fraud labels
2. **Data Storage**: Feedback stored in `data/training_data/feedback.jsonl`
3. **Retraining**: Automatic retraining when threshold reached (default: 1000 samples)
4. **A/B Testing**: New models validated before deployment
5. **Versioning**: Models tracked with version numbers

## Environment Variables

Create `.env` file:

```env
PORT=3003
ENV=development
MODEL_VERSION=1.0.0
MODEL_PATH=data/trained_models

# Continuous Learning
AUTO_RETRAIN=true
MIN_TRAINING_SAMPLES=1000

# Performance Thresholds
MIN_ACCURACY=0.90
MIN_PRECISION=0.85
MIN_RECALL=0.80

# CORS
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5173
```

## Integration with Analysis Engine

The analysis-engine integrates ML predictions:

```typescript
// analysis-engine/src/services/mlProvider.ts
import axios from 'axios';

const ML_SERVICE_URL = 'http://localhost:3003';

async function getMlPrediction(features: any) {
  const response = await axios.post(`${ML_SERVICE_URL}/api/predict`, {
    wallet_address: address,
    features: features
  });
  return response.data;
}

// Hybrid scoring: 60% ML + 20% Rules + 20% AML
const finalRiskScore =
  mlPrediction.risk_score * 0.6 +
  ruleBasedScore * 0.2 +
  amlScore * 0.2;
```

## Monitoring

Track these metrics:
- **Model Performance**: Accuracy, precision, recall, F1
- **Prediction Latency**: Target <500ms
- **Feedback Rate**: % of predictions with feedback
- **False Positive Rate**: Minimize merchant friction
- **Model Drift**: Monitor performance degradation

## Development

### Running Tests
```bash
pytest tests/
```

### Jupyter Notebooks
```bash
jupyter notebook notebooks/
```

### Retraining Models
```bash
python train_models.py --version 1.1.0 --test-size 0.3
```

## Troubleshooting

**Models not loading:**
- Ensure you've run `train_models.py` first
- Check `data/trained_models/` directory exists
- Verify model version matches config

**Low accuracy:**
- Download full Kaggle dataset (not sample)
- Ensure dataset is balanced with SMOTE
- Check feature engineering matches training

**High latency:**
- Enable model caching
- Use ensemble=False for faster predictions
- Consider model quantization

## Roadmap

- [ ] PostgreSQL for feedback storage
- [ ] Redis for prediction caching
- [ ] MLflow for experiment tracking
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] Real-time feature extraction from blockchain
- [ ] Graph neural networks for transaction graphs
- [ ] Multi-chain support

## License

ISC
