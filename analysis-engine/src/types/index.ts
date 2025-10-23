export interface RiskAnalysis {
  walletAddress: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactors;
  recommendations: string[];
  timestamp: string;
  cacheExpiry?: string;
}

export interface RiskFactors {
  walletAge: WalletAgeFactors;
  transactionHistory: TransactionFactors;
  addressReputation: ReputationFactors;
  behaviorPatterns: BehaviorFactors;
  amlCompliance?: AMLComplianceFactors;
}

export interface WalletAgeFactors {
  ageInDays: number;
  firstSeenDate: string | null;
  score: number;
  weight: number;
  description: string;
}

export interface TransactionFactors {
  totalTransactions: number;
  averageTransactionValue: number;
  lastTransactionDate: string | null;
  transactionFrequency: string;
  score: number;
  weight: number;
  description: string;
}

export interface ReputationFactors {
  isContract: boolean;
  hasBlacklistInteractions: boolean;
  knownMaliciousActivity: boolean;
  score: number;
  weight: number;
  description: string;
}

export interface BehaviorFactors {
  rapidTransactions: boolean;
  unusualPatterns: boolean;
  suspiciousGasUsage: boolean;
  score: number;
  weight: number;
  description: string;
}

export interface BasescanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  isError: string;
}

export interface BasescanResponse {
  status: string;
  message: string;
  result: BasescanTransaction[] | string;
}

export interface WalletData {
  address: string;
  transactions: BasescanTransaction[];
  transactionCount: number;
  balance: string;
  firstTransaction?: BasescanTransaction;
  lastTransaction?: BasescanTransaction;
}

// MetaSleuth AML API Types
export interface AMLComplianceFactors {
  metasleuthScore: number;
  riskIndicators: RiskIndicator[];
  score: number;
  weight: number;
  description: string;
  enabled: boolean;
}

export interface MetaSleuthRequest {
  chain_id: number;
  address: string;
  interaction_risk: boolean;
}

export interface MetaSleuthResponse {
  request_id: string;
  code: number;
  message: string;
  data: MetaSleuthData;
}

export interface MetaSleuthData {
  request_id: string;
  code: number;
  message: string;
  data: MetaSleuthRiskData;
}

export interface MetaSleuthRiskData {
  chain_id: number;
  address: string;
  risk_score: number;
  risk_indicators: RiskIndicator[];
}

export interface RiskIndicator {
  type: string;
  indicator: {
    name: string;
    code: number;
  };
  source: string;
  risk_interactions: RiskInteraction[];
}

export interface RiskInteraction {
  block_number: number;
  timestamp: string;
  tx_hash: string;
  from: string;
  to: string;
  token_contract?: string;
  token_symbol?: string;
  amount_usd?: string;
}
