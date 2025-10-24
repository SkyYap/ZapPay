"""Script to train ML models from Kaggle dataset."""
import logging
import sys
import argparse
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.utils.data_loader import KaggleDataLoader
from src.models.fraud_detector import FraudDetector
from src.models.anomaly_detector import AnomalyDetector
from src.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def train_fraud_detector(X_train, X_test, y_train, y_test, feature_names, version="1.0.0"):
    """Train fraud detection models."""
    logger.info("=" * 60)
    logger.info("Training Fraud Detection Models")
    logger.info("=" * 60)

    # Initialize detector
    detector = FraudDetector(model_dir=str(settings.model_dir))

    # Train models
    metrics = detector.train(
        X_train=X_train,
        y_train=y_train,
        X_test=X_test,
        y_test=y_test
    )

    # Print results
    logger.info("\n" + "=" * 60)
    logger.info("TRAINING RESULTS")
    logger.info("=" * 60)
    logger.info(f"\nRandom Forest:")
    logger.info(f"  Accuracy:  {metrics['rf_accuracy']:.4f}")
    logger.info(f"  Precision: {metrics['rf_precision']:.4f}")
    logger.info(f"  Recall:    {metrics['rf_recall']:.4f}")
    logger.info(f"  F1 Score:  {metrics['rf_f1']:.4f}")
    logger.info(f"  AUC-ROC:   {metrics['rf_auc_roc']:.4f}")

    logger.info(f"\nXGBoost:")
    logger.info(f"  Accuracy:  {metrics['xgb_accuracy']:.4f}")
    logger.info(f"  Precision: {metrics['xgb_precision']:.4f}")
    logger.info(f"  Recall:    {metrics['xgb_recall']:.4f}")
    logger.info(f"  F1 Score:  {metrics['xgb_f1']:.4f}")
    logger.info(f"  AUC-ROC:   {metrics['xgb_auc_roc']:.4f}")

    logger.info(f"\nEnsemble:")
    logger.info(f"  Accuracy:  {metrics['ensemble_accuracy']:.4f}")
    logger.info(f"  Precision: {metrics['ensemble_precision']:.4f}")
    logger.info(f"  Recall:    {metrics['ensemble_recall']:.4f}")
    logger.info(f"  F1 Score:  {metrics['ensemble_f1']:.4f}")
    logger.info(f"  AUC-ROC:   {metrics['ensemble_auc_roc']:.4f}")
    logger.info("=" * 60)

    # Show feature importance
    logger.info("\nTop 10 Most Important Features:")
    importance_df = detector.get_feature_importance(top_n=10)
    for idx, row in importance_df.iterrows():
        logger.info(f"  {row['feature']}: {row['importance']:.4f}")

    # Save models
    detector.save(version=version)
    logger.info(f"\n✅ Fraud detection models saved (version {version})")

    return detector, metrics


def train_anomaly_detector(X_train, y_train, feature_names, version="1.0.0"):
    """Train anomaly detection model."""
    logger.info("\n" + "=" * 60)
    logger.info("Training Anomaly Detection Model")
    logger.info("=" * 60)

    # Use only legitimate transactions for training
    X_legitimate = X_train[y_train == 0]
    logger.info(f"Training on {len(X_legitimate)} legitimate transactions")

    # Initialize detector
    detector = AnomalyDetector(
        model_dir=str(settings.model_dir),
        contamination=0.1
    )

    # Train
    detector.train(X_legitimate)

    # Save
    detector.save(version=version)
    logger.info(f"✅ Anomaly detection model saved (version {version})")

    return detector


def main():
    """Main training function."""
    parser = argparse.ArgumentParser(description="Train ML models for fraud detection")
    parser.add_argument(
        "--dataset",
        type=str,
        default="transaction_dataset.csv",
        help="Name of dataset CSV file"
    )
    parser.add_argument(
        "--data-path",
        type=str,
        default="data/kaggle",
        help="Path to dataset directory"
    )
    parser.add_argument(
        "--version",
        type=str,
        default="1.0.0",
        help="Model version to save"
    )
    parser.add_argument(
        "--no-balance",
        action="store_true",
        help="Don't balance the dataset"
    )
    parser.add_argument(
        "--test-size",
        type=float,
        default=0.2,
        help="Test set proportion"
    )

    args = parser.parse_args()

    try:
        logger.info("🚀 Starting ML model training pipeline...")
        logger.info(f"Dataset: {args.data_path}/{args.dataset}")
        logger.info(f"Model version: {args.version}")

        # Load and prepare data
        logger.info("\n📁 Loading Kaggle dataset...")
        data_loader = KaggleDataLoader(data_path=args.data_path)

        X_train, X_test, y_train, y_test, feature_names = data_loader.load_and_prepare(
            filename=args.dataset,
            test_size=args.test_size,
            balance_data=not args.no_balance
        )

        logger.info(f"\n✅ Data loaded successfully:")
        logger.info(f"  Training samples: {len(X_train)}")
        logger.info(f"  Test samples: {len(X_test)}")
        logger.info(f"  Features: {len(feature_names)}")
        logger.info(f"  Fraud in training: {y_train.sum()} ({y_train.sum()/len(y_train)*100:.2f}%)")
        logger.info(f"  Fraud in test: {y_test.sum()} ({y_test.sum()/len(y_test)*100:.2f}%)")

        # Train fraud detector
        fraud_detector, metrics = train_fraud_detector(
            X_train, X_test, y_train, y_test, feature_names, args.version
        )

        # Train anomaly detector
        anomaly_detector = train_anomaly_detector(
            X_train, y_train, feature_names, args.version
        )

        # Final summary
        logger.info("\n" + "=" * 60)
        logger.info("🎉 TRAINING COMPLETE!")
        logger.info("=" * 60)
        logger.info(f"\n✅ Ensemble Accuracy: {metrics['ensemble_accuracy']:.2%}")
        logger.info(f"✅ Ensemble Precision: {metrics['ensemble_precision']:.2%}")
        logger.info(f"✅ Ensemble Recall: {metrics['ensemble_recall']:.2%}")
        logger.info(f"✅ Ensemble F1: {metrics['ensemble_f1']:.2%}")
        logger.info(f"✅ Ensemble AUC-ROC: {metrics['ensemble_auc_roc']:.2%}")

        logger.info(f"\n📦 Models saved to: {settings.model_dir}")
        logger.info(f"📋 Model version: {args.version}")

        logger.info("\n🚀 Ready to start ML service!")
        logger.info("Run: python -m src.main")

    except FileNotFoundError as e:
        logger.error(f"\n❌ Dataset not found: {e}")
        logger.info("\n📥 Please download the Kaggle dataset:")
        logger.info("1. Go to: https://www.kaggle.com/datasets/vagifa/ethereum-frauddetection-dataset")
        logger.info("2. Download the dataset")
        logger.info(f"3. Extract to: {args.data_path}/")
        sys.exit(1)

    except Exception as e:
        logger.error(f"\n❌ Training failed: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
