"""Feature engineering for wallet fraud detection.

This module extracts features from wallet data that match the Kaggle dataset schema.
Features include transaction counts, value statistics, time-based metrics, and more.
"""
import logging
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from datetime import datetime

logger = logging.getLogger(__name__)


class FeatureEngineer:
    """Feature engineering for wallet analysis."""

    # Feature names matching Kaggle dataset
    KAGGLE_FEATURES = [
        # Transaction counts
        'total_transactions',
        'total_ether_sent',
        'total_ether_received',
        'total_ether_sent_contracts',
        'total_ether_balance',
        'total_erc20_tnxs',

        # Value statistics
        'avg_val_received',
        'avg_val_sent',
        'avg_value_sent_to_contract',
        'max_value_received',
        'max_val_sent',
        'max_value_sent_to_contract',
        'min_value_received',
        'min_val_sent',
        'min_value_sent_to_contract',

        # Transaction timing
        'time_diff_between_first_and_last_mins',
        'avg_min_between_sent_tnx',
        'avg_min_between_received_tnx',

        # Unique addresses
        'sent_tnx',
        'received_tnx',
        'number_of_created_contracts',
        'unique_received_from_addresses',
        'unique_sent_to_addresses',

        # ERC20 metrics
        'erc20_total_ether_received',
        'erc20_total_ether_sent',
        'erc20_total_ether_sent_contract',
        'erc20_uniq_sent_addr',
        'erc20_uniq_rec_addr',
        'erc20_uniq_sent_addr_1',
        'erc20_uniq_rec_contract_addr',
        'erc20_avg_time_between_sent_tnx',
        'erc20_avg_time_between_rec_tnx',
        'erc20_avg_time_between_rec_2_tnx',
        'erc20_avg_time_between_contract_tnx',
        'erc20_min_val_rec',
        'erc20_max_val_rec',
        'erc20_avg_val_rec',
        'erc20_min_val_sent',
        'erc20_max_val_sent',
        'erc20_avg_val_sent',
        'erc20_uniq_sent_token_name',
        'erc20_uniq_rec_token_name',
        'erc20_most_sent_token_type',
        'erc20_most_rec_token_type',
    ]

    def __init__(self):
        """Initialize feature engineer."""
        self.feature_cache: Dict[str, Dict[str, Any]] = {}

    def extract_features(self, wallet_data: Dict[str, Any]) -> Dict[str, float]:
        """
        Extract features from wallet data.

        Args:
            wallet_data: Wallet data from blockchain API

        Returns:
            Dictionary of features matching Kaggle schema
        """
        try:
            transactions = wallet_data.get('transactions', [])
            address = wallet_data.get('address', '').lower()
            balance = float(wallet_data.get('balance', 0))

            # Convert transactions to DataFrame for easier processing
            if transactions:
                df = pd.DataFrame(transactions)
                df['value_eth'] = df['value'].apply(lambda x: float(x) / 1e18)
                df['timestamp'] = df['timeStamp'].apply(lambda x: int(x))
                df['from_lower'] = df['from'].str.lower()
                df['to_lower'] = df['to'].str.lower()
            else:
                df = pd.DataFrame()

            features = {}

            # Transaction counts
            features['total_transactions'] = len(transactions)
            features['sent_tnx'] = len(df[df['from_lower'] == address]) if not df.empty else 0
            features['received_tnx'] = len(df[df['to_lower'] == address]) if not df.empty else 0

            # Ether sent/received
            sent_df = df[df['from_lower'] == address] if not df.empty else pd.DataFrame()
            received_df = df[df['to_lower'] == address] if not df.empty else pd.DataFrame()

            features['total_ether_sent'] = sent_df['value_eth'].sum() if not sent_df.empty else 0
            features['total_ether_received'] = received_df['value_eth'].sum() if not received_df.empty else 0
            features['total_ether_balance'] = balance / 1e18 if balance else 0

            # Contract interactions
            # (Simplified: we'd need to check if 'to' addresses are contracts)
            features['total_ether_sent_contracts'] = 0  # Placeholder
            features['number_of_created_contracts'] = 0  # Placeholder

            # Value statistics - sent
            if not sent_df.empty:
                features['avg_val_sent'] = sent_df['value_eth'].mean()
                features['max_val_sent'] = sent_df['value_eth'].max()
                features['min_val_sent'] = sent_df['value_eth'].min()
            else:
                features['avg_val_sent'] = 0
                features['max_val_sent'] = 0
                features['min_val_sent'] = 0

            # Value statistics - received
            if not received_df.empty:
                features['avg_val_received'] = received_df['value_eth'].mean()
                features['max_value_received'] = received_df['value_eth'].max()
                features['min_value_received'] = received_df['value_eth'].min()
            else:
                features['avg_val_received'] = 0
                features['max_value_received'] = 0
                features['min_value_received'] = 0

            # Contract value statistics (placeholder)
            features['avg_value_sent_to_contract'] = 0
            features['max_value_sent_to_contract'] = 0
            features['min_value_sent_to_contract'] = 0

            # Time-based features
            if not df.empty and len(df) > 1:
                timestamps = sorted(df['timestamp'].tolist())
                time_diff_mins = (timestamps[-1] - timestamps[0]) / 60
                features['time_diff_between_first_and_last_mins'] = time_diff_mins
            else:
                features['time_diff_between_first_and_last_mins'] = 0

            # Average time between transactions
            if not sent_df.empty and len(sent_df) > 1:
                sent_times = sorted(sent_df['timestamp'].tolist())
                diffs = np.diff(sent_times) / 60  # minutes
                features['avg_min_between_sent_tnx'] = np.mean(diffs)
            else:
                features['avg_min_between_sent_tnx'] = 0

            if not received_df.empty and len(received_df) > 1:
                rec_times = sorted(received_df['timestamp'].tolist())
                diffs = np.diff(rec_times) / 60
                features['avg_min_between_received_tnx'] = np.mean(diffs)
            else:
                features['avg_min_between_received_tnx'] = 0

            # Unique addresses
            features['unique_sent_to_addresses'] = sent_df['to_lower'].nunique() if not sent_df.empty else 0
            features['unique_received_from_addresses'] = received_df['from_lower'].nunique() if not received_df.empty else 0

            # ERC20 features (placeholders - would need ERC20 transaction data)
            erc20_features = {
                'total_erc20_tnxs': 0,
                'erc20_total_ether_received': 0,
                'erc20_total_ether_sent': 0,
                'erc20_total_ether_sent_contract': 0,
                'erc20_uniq_sent_addr': 0,
                'erc20_uniq_rec_addr': 0,
                'erc20_uniq_sent_addr_1': 0,
                'erc20_uniq_rec_contract_addr': 0,
                'erc20_avg_time_between_sent_tnx': 0,
                'erc20_avg_time_between_rec_tnx': 0,
                'erc20_avg_time_between_rec_2_tnx': 0,
                'erc20_avg_time_between_contract_tnx': 0,
                'erc20_min_val_rec': 0,
                'erc20_max_val_rec': 0,
                'erc20_avg_val_rec': 0,
                'erc20_min_val_sent': 0,
                'erc20_max_val_sent': 0,
                'erc20_avg_val_sent': 0,
                'erc20_uniq_sent_token_name': 0,
                'erc20_uniq_rec_token_name': 0,
                'erc20_most_sent_token_type': 0,
                'erc20_most_rec_token_type': 0,
            }
            features.update(erc20_features)

            # Fill any missing features with 0
            for feature_name in self.KAGGLE_FEATURES:
                if feature_name not in features:
                    features[feature_name] = 0

            logger.info(f"Extracted {len(features)} features for {address}")
            return features

        except Exception as e:
            logger.error(f"Feature extraction failed: {e}", exc_info=True)
            # Return zero features on error
            return {feature: 0.0 for feature in self.KAGGLE_FEATURES}

    def normalize_features(self, features: Dict[str, float]) -> Dict[str, float]:
        """
        Normalize features for model input.

        Args:
            features: Raw features

        Returns:
            Normalized features
        """
        # TODO: Load normalization parameters from training
        # For now, return as-is
        return features

    def validate_features(self, features: Dict[str, float]) -> bool:
        """
        Validate that all required features are present.

        Args:
            features: Feature dictionary

        Returns:
            True if valid, False otherwise
        """
        required_features = set(self.KAGGLE_FEATURES)
        provided_features = set(features.keys())

        missing = required_features - provided_features
        if missing:
            logger.warning(f"Missing features: {missing}")
            return False

        return True

    def get_feature_names(self) -> List[str]:
        """Get list of all feature names."""
        return self.KAGGLE_FEATURES.copy()
