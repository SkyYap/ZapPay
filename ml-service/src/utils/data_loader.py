"""Data loader for Kaggle Ethereum fraud detection dataset."""
import logging
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Tuple, Optional
from sklearn.model_selection import train_test_split
from imblearn.over_sampling import SMOTE
from imblearn.under_sampling import RandomUnderSampler
from imblearn.pipeline import Pipeline as ImbPipeline

logger = logging.getLogger(__name__)


class KaggleDataLoader:
    """Load and preprocess Kaggle Ethereum fraud dataset."""

    def __init__(self, data_path: str = "data/kaggle"):
        """
        Initialize data loader.

        Args:
            data_path: Path to Kaggle dataset directory
        """
        self.data_path = Path(data_path)
        self.df: Optional[pd.DataFrame] = None
        self.feature_names: list[str] = []

    def load_dataset(self, filename: str = "transaction_dataset.csv") -> pd.DataFrame:
        """
        Load the Kaggle dataset from CSV.

        Args:
            filename: Name of the CSV file

        Returns:
            Loaded DataFrame

        Raises:
            FileNotFoundError: If dataset file not found
        """
        file_path = self.data_path / filename

        if not file_path.exists():
            logger.error(f"Dataset not found at {file_path}")
            logger.info("Please download the dataset from:")
            logger.info("https://www.kaggle.com/datasets/vagifa/ethereum-frauddetection-dataset")
            logger.info(f"And extract it to {self.data_path}")
            raise FileNotFoundError(f"Dataset not found: {file_path}")

        logger.info(f"Loading dataset from {file_path}")
        self.df = pd.read_csv(file_path)

        logger.info(f"Dataset loaded: {len(self.df)} rows, {len(self.df.columns)} columns")
        logger.info(f"Columns: {list(self.df.columns)}")

        # Check for target column
        if 'FLAG' in self.df.columns:
            fraud_count = self.df['FLAG'].sum()
            legitimate_count = len(self.df) - fraud_count
            logger.info(f"Fraud cases: {fraud_count} ({fraud_count/len(self.df)*100:.2f}%)")
            logger.info(f"Legitimate cases: {legitimate_count} ({legitimate_count/len(self.df)*100:.2f}%)")

        return self.df

    def preprocess_data(
        self,
        df: Optional[pd.DataFrame] = None,
        target_column: str = 'FLAG'
    ) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Preprocess the dataset.

        Args:
            df: DataFrame to preprocess (uses self.df if None)
            target_column: Name of the target column

        Returns:
            Tuple of (features DataFrame, target Series)
        """
        if df is None:
            df = self.df

        if df is None:
            raise ValueError("No dataset loaded. Call load_dataset() first.")

        logger.info("Preprocessing dataset...")

        # Separate features and target
        if target_column not in df.columns:
            raise ValueError(f"Target column '{target_column}' not found in dataset")

        X = df.drop(columns=[target_column])
        y = df[target_column]

        # Drop index/ID columns that cause data leakage
        index_columns = ['Unnamed: 0', 'Index', 'index', 'id', 'ID']
        columns_to_drop = [col for col in index_columns if col in X.columns]
        if columns_to_drop:
            logger.warning(f"⚠️  Dropping index columns (data leakage): {columns_to_drop}")
            X = X.drop(columns=columns_to_drop)

        # Drop non-numeric columns (like Address if present)
        numeric_cols = X.select_dtypes(include=[np.number]).columns
        non_numeric_cols = set(X.columns) - set(numeric_cols)

        if non_numeric_cols:
            logger.info(f"Dropping non-numeric columns: {non_numeric_cols}")
            X = X[numeric_cols]

        # Handle missing values
        if X.isnull().any().any():
            logger.warning("Missing values detected. Filling with median...")
            X = X.fillna(X.median())

        # Handle infinite values
        X = X.replace([np.inf, -np.inf], np.nan)
        X = X.fillna(X.median())

        # Store feature names
        self.feature_names = list(X.columns)
        logger.info(f"Final feature count: {len(self.feature_names)}")

        return X, y

    def prepare_train_test_split(
        self,
        X: pd.DataFrame,
        y: pd.Series,
        test_size: float = 0.2,
        random_state: int = 42,
        balance_data: bool = True
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
        """
        Prepare train/test split with optional balancing.

        Args:
            X: Features
            y: Target
            test_size: Proportion of test set
            random_state: Random seed
            balance_data: Whether to balance the dataset with SMOTE

        Returns:
            Tuple of (X_train, X_test, y_train, y_test)
        """
        logger.info("Splitting data into train/test sets...")

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=test_size,
            random_state=random_state,
            stratify=y  # Maintain class distribution
        )

        logger.info(f"Train set: {len(X_train)} samples")
        logger.info(f"Test set: {len(X_test)} samples")

        # Balance training data if requested
        if balance_data:
            logger.info("Balancing training data with SMOTE...")

            # Use SMOTE with random undersampling
            # This balances the dataset without creating too many synthetic samples
            over = SMOTE(sampling_strategy=0.5, random_state=random_state)
            under = RandomUnderSampler(sampling_strategy=0.8, random_state=random_state)

            pipeline = ImbPipeline([
                ('over', over),
                ('under', under)
            ])

            X_train_balanced, y_train_balanced = pipeline.fit_resample(X_train, y_train)

            logger.info(f"Balanced train set: {len(X_train_balanced)} samples")
            logger.info(f"Fraud: {y_train_balanced.sum()}, Legitimate: {len(y_train_balanced) - y_train_balanced.sum()}")

            return X_train_balanced, X_test, y_train_balanced, y_test

        return X_train, X_test, y_train, y_test

    def get_feature_statistics(self, X: pd.DataFrame) -> dict:
        """
        Get statistics about features for normalization.

        Args:
            X: Features DataFrame

        Returns:
            Dictionary with feature statistics
        """
        stats = {
            'mean': X.mean().to_dict(),
            'std': X.std().to_dict(),
            'min': X.min().to_dict(),
            'max': X.max().to_dict(),
            'median': X.median().to_dict()
        }
        return stats

    def load_and_prepare(
        self,
        filename: str = "transaction_dataset.csv",
        test_size: float = 0.2,
        balance_data: bool = True,
        random_state: int = 42
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, list]:
        """
        One-shot method to load and prepare the dataset.

        Args:
            filename: Dataset filename
            test_size: Test set proportion
            balance_data: Whether to balance data
            random_state: Random seed

        Returns:
            Tuple of (X_train, X_test, y_train, y_test, feature_names)
        """
        # Load
        self.load_dataset(filename)

        # Preprocess
        X, y = self.preprocess_data()

        # Split
        X_train, X_test, y_train, y_test = self.prepare_train_test_split(
            X, y, test_size, random_state, balance_data
        )

        return X_train, X_test, y_train, y_test, self.feature_names


# Standalone function for quick loading
def load_kaggle_data(
    data_path: str = "data/kaggle",
    filename: str = "transaction_dataset.csv",
    test_size: float = 0.2,
    balance: bool = True
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, list]:
    """
    Quick function to load and prepare Kaggle data.

    Args:
        data_path: Path to dataset directory
        filename: Dataset filename
        test_size: Test set proportion
        balance: Whether to balance data

    Returns:
        Tuple of (X_train, X_test, y_train, y_test, feature_names)
    """
    loader = KaggleDataLoader(data_path)
    return loader.load_and_prepare(filename, test_size, balance)
