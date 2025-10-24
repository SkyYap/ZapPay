/**
 * ML Service Provider - Integration with Python ML microservice
 */
import axios, { AxiosInstance } from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:3003';

interface MLPredictionRequest {
  wallet_address: string;
  chain_id?: number;
  features: Record<string, number>;
}

interface MLPredictionResponse {
  wallet_address: string;
  fraud_probability: number;
  risk_score: number;
  is_fraud: boolean;
  confidence: number;
  model_version: string;
  timestamp: string;
  processing_time_ms: number;
}

interface MLAnomalyRequest {
  wallet_address: string;
  chain_id?: number;
  features: Record<string, number>;
}

interface MLAnomalyResponse {
  wallet_address: string;
  is_anomaly: boolean;
  anomaly_score: number;
  anomaly_threshold: number;
  anomaly_reasons: string[];
  timestamp: string;
}

interface MLExplainRequest {
  wallet_address: string;
  chain_id?: number;
}

interface FeatureContribution {
  feature: string;
  shap_value: number;
  feature_value: number;
  abs_contribution: number;
}

interface MLExplainResponse {
  wallet_address: string;
  fraud_probability: number;
  risk_score: number;
  is_fraud: boolean;
  feature_contributions: FeatureContribution[];
  top_risk_factors: string[];
  model_version: string;
  timestamp: string;
}

interface MLFeedbackRequest {
  wallet_address: string;
  actual_fraud: boolean;
  predicted_fraud: boolean;
  risk_score: number;
  notes?: string;
  merchant_id?: string;
}

interface MLFeedbackResponse {
  success: boolean;
  message: string;
  feedback_id: string;
  will_retrain: boolean;
}

/**
 * Extract ML features from wallet data
 * These features match the Kaggle dataset schema
 */
export function extractMLFeatures(walletData: any): Record<string, number> {
  const address = walletData.address?.toLowerCase();
  const transactions = walletData.transactions || [];
  const balance = parseFloat(walletData.balance || '0');

  // Filter sent and received transactions
  const sentTxs = transactions.filter((tx: any) => tx.from?.toLowerCase() === address);
  const receivedTxs = transactions.filter((tx: any) => tx.to?.toLowerCase() === address);

  // Calculate Ether values
  const totalEtherSent = sentTxs.reduce((sum: number, tx: any) =>
    sum + (parseFloat(tx.value) / 1e18), 0
  );
  const totalEtherReceived = receivedTxs.reduce((sum: number, tx: any) =>
    sum + (parseFloat(tx.value) / 1e18), 0
  );

  // Calculate value statistics
  const sentValues = sentTxs.map((tx: any) => parseFloat(tx.value) / 1e18);
  const receivedValues = receivedTxs.map((tx: any) => parseFloat(tx.value) / 1e18);

  const avgValSent = sentValues.length > 0
    ? sentValues.reduce((a: number, b: number) => a + b, 0) / sentValues.length
    : 0;
  const avgValReceived = receivedValues.length > 0
    ? receivedValues.reduce((a: number, b: number) => a + b, 0) / receivedValues.length
    : 0;

  // Calculate time-based features
  let timeDiffMins = 0;
  let avgMinBetweenSent = 0;
  let avgMinBetweenReceived = 0;

  if (transactions.length > 1) {
    const timestamps = transactions.map((tx: any) => parseInt(tx.timeStamp)).sort();
    timeDiffMins = (timestamps[timestamps.length - 1] - timestamps[0]) / 60;
  }

  if (sentTxs.length > 1) {
    const sentTimes = sentTxs.map((tx: any) => parseInt(tx.timeStamp)).sort();
    const diffs = [];
    for (let i = 1; i < sentTimes.length; i++) {
      diffs.push((sentTimes[i] - sentTimes[i-1]) / 60);
    }
    avgMinBetweenSent = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  }

  if (receivedTxs.length > 1) {
    const recTimes = receivedTxs.map((tx: any) => parseInt(tx.timeStamp)).sort();
    const diffs = [];
    for (let i = 1; i < recTimes.length; i++) {
      diffs.push((recTimes[i] - recTimes[i-1]) / 60);
    }
    avgMinBetweenReceived = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  }

  // Unique addresses
  const uniqueSentTo = new Set(sentTxs.map((tx: any) => tx.to?.toLowerCase())).size;
  const uniqueReceivedFrom = new Set(receivedTxs.map((tx: any) => tx.from?.toLowerCase())).size;

  // Build feature dictionary matching EXACT Kaggle column names
  // IMPORTANT: Names must match exactly (including spaces, capitals, trailing spaces!)
  const features: Record<string, number> = {
    // Time-based features
    'Avg min between sent tnx': avgMinBetweenSent,
    'Avg min between received tnx': avgMinBetweenReceived,
    'Time Diff between first and last (Mins)': timeDiffMins,

    // Transaction counts
    'Sent tnx': sentTxs.length,
    'Received Tnx': receivedTxs.length,
    'Number of Created Contracts': 0, // Placeholder

    // Unique addresses
    'Unique Received From Addresses': uniqueReceivedFrom,
    'Unique Sent To Addresses': uniqueSentTo,

    // Value statistics - received (note: 'max value received ' has trailing space!)
    'min value received': receivedValues.length > 0 ? Math.min(...receivedValues) : 0,
    'max value received ': receivedValues.length > 0 ? Math.max(...receivedValues) : 0,
    'avg val received': avgValReceived,

    // Value statistics - sent
    'min val sent': sentValues.length > 0 ? Math.min(...sentValues) : 0,
    'max val sent': sentValues.length > 0 ? Math.max(...sentValues) : 0,
    'avg val sent': avgValSent,

    // Contract values (placeholders)
    'min value sent to contract': 0,
    'max val sent to contract': 0,
    'avg value sent to contract': 0,

    // Total transactions
    'total transactions (including tnx to create contract': transactions.length,

    // Ether totals
    'total Ether sent': totalEtherSent,
    'total ether received': totalEtherReceived,
    'total ether sent contracts': 0, // Placeholder
    'total ether balance': balance / 1e18,

    // ERC20 features (all placeholders - leading spaces are intentional!)
    ' Total ERC20 tnxs': 0,
    ' ERC20 total Ether received': 0,
    ' ERC20 total ether sent': 0,
    ' ERC20 total Ether sent contract': 0,
    ' ERC20 uniq sent addr': 0,
    ' ERC20 uniq rec addr': 0,
    ' ERC20 uniq sent addr.1': 0,
    ' ERC20 uniq rec contract addr': 0,
    ' ERC20 avg time between sent tnx': 0,
    ' ERC20 avg time between rec tnx': 0,
    ' ERC20 avg time between rec 2 tnx': 0,
    ' ERC20 avg time between contract tnx': 0,
    ' ERC20 min val rec': 0,
    ' ERC20 max val rec': 0,
    ' ERC20 avg val rec': 0,
    ' ERC20 min val sent': 0,
    ' ERC20 max val sent': 0,
    ' ERC20 avg val sent': 0,
    ' ERC20 min val sent contract': 0,
    ' ERC20 max val sent contract': 0,
    ' ERC20 avg val sent contract': 0,
    ' ERC20 uniq sent token name': 0,
    ' ERC20 uniq rec token name': 0,
  };

  return features;
}

/**
 * Get ML fraud prediction
 */
export async function getMlPrediction(
  walletAddress: string,
  walletData: any,
  chainId: number = 84532
): Promise<MLPredictionResponse | null> {
  try {
    // Extract features
    const features = extractMLFeatures(walletData);

    // Call ML service
    const response = await axios.post<MLPredictionResponse>(
      `${ML_SERVICE_URL}/api/predict`,
      {
        wallet_address: walletAddress,
        chain_id: chainId,
        features
      },
      { timeout: 5000 }
    );

    console.log(`✅ ML prediction for ${walletAddress}: ${response.data.risk_score}`);
    return response.data;

  } catch (error: any) {
    console.error('ML prediction error:', error.message);
    // Return null on error - graceful degradation
    return null;
  }
}

/**
 * Get anomaly detection
 */
export async function detectAnomaly(
  walletAddress: string,
  walletData: any,
  chainId: number = 84532
): Promise<MLAnomalyResponse | null> {
  try {
    const features = extractMLFeatures(walletData);

    const response = await axios.post<MLAnomalyResponse>(
      `${ML_SERVICE_URL}/api/predict/anomaly`,
      {
        wallet_address: walletAddress,
        chain_id: chainId,
        features
      },
      { timeout: 5000 }
    );

    return response.data;

  } catch (error: any) {
    console.error('Anomaly detection error:', error.message);
    return null;
  }
}

/**
 * Get explainable prediction
 */
export async function getExplainablePrediction(
  walletAddress: string,
  chainId: number = 84532
): Promise<MLExplainResponse | null> {
  try {
    const response = await axios.post<MLExplainResponse>(
      `${ML_SERVICE_URL}/api/predict/explain`,
      {
        wallet_address: walletAddress,
        chain_id: chainId
      },
      { timeout: 10000 }
    );

    return response.data;

  } catch (error: any) {
    console.error('Explainable prediction error:', error.message);
    return null;
  }
}

/**
 * Submit feedback for continuous learning
 */
export async function submitFeedback(
  walletAddress: string,
  actualFraud: boolean,
  predictedFraud: boolean,
  riskScore: number,
  notes?: string,
  merchantId?: string
): Promise<MLFeedbackResponse | null> {
  try {
    const response = await axios.post<MLFeedbackResponse>(
      `${ML_SERVICE_URL}/api/train/feedback`,
      {
        wallet_address: walletAddress,
        actual_fraud: actualFraud,
        predicted_fraud: predictedFraud,
        risk_score: riskScore,
        notes,
        merchant_id: merchantId
      },
      { timeout: 3000 }
    );

    return response.data;

  } catch (error: any) {
    console.error('Feedback submission error:', error.message);
    return null;
  }
}

/**
 * Check if ML service is available
 */
export async function isMlServiceAvailable(): Promise<boolean> {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 2000 });
    return response.data.status === 'ok';
  } catch {
    return false;
  }
}
