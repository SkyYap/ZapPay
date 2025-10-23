import type { RiskAnalysis, RiskFactors } from '../types';
import {
  getWalletDataFromBasescan,
  calculateWalletAge,
  calculateAverageTransactionValue,
  isSmartContract,
  detectUnusualPatterns
} from './onChainAnalyzer';
import {
  getMetaSleuthRisk,
  generateAMLDescription,
  shouldAutoBlock
} from './metasleuthProvider';

// Risk scoring weights (adjusted for AML integration)
const WEIGHTS = {
  WALLET_AGE: 0.20,           // Reduced from 0.25
  TRANSACTION_HISTORY: 0.25,  // Reduced from 0.30
  ADDRESS_REPUTATION: 0.15,   // Reduced from 0.25
  BEHAVIOR_PATTERNS: 0.10,    // Reduced from 0.20
  AML_COMPLIANCE: 0.30        // New factor
};

// In-memory cache for risk scores (24 hour TTL)
const riskCache = new Map<string, { analysis: RiskAnalysis; expiry: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Main function to analyze a wallet and return risk score
 * @param walletAddress - The wallet address to analyze
 * @returns Complete risk analysis
 */
export async function analyzeWallet(walletAddress: string): Promise<RiskAnalysis> {
  const normalizedAddress = walletAddress.toLowerCase();

  // Check cache first
  const cached = riskCache.get(normalizedAddress);
  if (cached && cached.expiry > Date.now()) {
    console.log(`✅ Returning cached analysis for ${normalizedAddress}`);
    return cached.analysis;
  }

  console.log(`🔍 Analyzing wallet: ${normalizedAddress}`);

  try {
    // Fetch on-chain data and AML data in parallel
    const [walletData, amlData] = await Promise.all([
      getWalletDataFromBasescan(normalizedAddress),
      getMetaSleuthRisk(normalizedAddress, 84532) // Base Sepolia
    ]);

    const isContract = await isSmartContract(normalizedAddress);
    const patterns = detectUnusualPatterns(walletData);

    // Calculate risk factors (including AML)
    const factors = calculateRiskFactors(walletData, isContract, patterns, amlData);

    // Calculate overall risk score (0-100)
    const riskScore = calculateOverallScore(factors);

    // Determine risk level
    const riskLevel = getRiskLevel(riskScore);

    // Generate recommendations
    const recommendations = generateRecommendations(riskScore, factors);

    const analysis: RiskAnalysis = {
      walletAddress: normalizedAddress,
      riskScore,
      riskLevel,
      factors,
      recommendations,
      timestamp: new Date().toISOString(),
      cacheExpiry: new Date(Date.now() + CACHE_TTL).toISOString()
    };

    // Cache the result
    riskCache.set(normalizedAddress, {
      analysis,
      expiry: Date.now() + CACHE_TTL
    });

    console.log(`✅ Analysis complete for ${normalizedAddress}: Risk Score = ${riskScore} (${riskLevel})`);

    return analysis;
  } catch (error: any) {
    console.error(`❌ Error analyzing wallet ${normalizedAddress}:`, error.message);
    throw new Error(`Failed to analyze wallet: ${error.message}`);
  }
}

/**
 * Calculate risk factors for a wallet
 */
function calculateRiskFactors(
  walletData: any,
  isContract: boolean,
  patterns: any,
  amlData: any
): RiskFactors {
  // 1. Wallet Age Factor
  const ageInDays = calculateWalletAge(walletData);
  const walletAgeScore = calculateWalletAgeScore(ageInDays);

  // 2. Transaction History Factor
  const avgTxValue = calculateAverageTransactionValue(walletData);
  const transactionScore = calculateTransactionScore(
    walletData.transactionCount,
    avgTxValue
  );

  // 3. Address Reputation Factor
  const reputationScore = calculateReputationScore(isContract, walletData);

  // 4. Behavior Patterns Factor
  const behaviorScore = calculateBehaviorScore(patterns);

  // 5. AML Compliance Factor (MetaSleuth)
  const amlScore = amlData ? calculateAMLScore(amlData.risk_score) : 0;

  const riskFactors: RiskFactors = {
    walletAge: {
      ageInDays,
      firstSeenDate: walletData.firstTransaction
        ? new Date(parseInt(walletData.firstTransaction.timeStamp) * 1000).toISOString()
        : null,
      score: walletAgeScore,
      weight: WEIGHTS.WALLET_AGE,
      description: getWalletAgeDescription(ageInDays)
    },
    transactionHistory: {
      totalTransactions: walletData.transactionCount,
      averageTransactionValue: avgTxValue,
      lastTransactionDate: walletData.lastTransaction
        ? new Date(parseInt(walletData.lastTransaction.timeStamp) * 1000).toISOString()
        : null,
      transactionFrequency: getTransactionFrequency(walletData),
      score: transactionScore,
      weight: WEIGHTS.TRANSACTION_HISTORY,
      description: getTransactionDescription(walletData.transactionCount)
    },
    addressReputation: {
      isContract,
      hasBlacklistInteractions: false, // TODO: Implement blacklist checking
      knownMaliciousActivity: false,
      score: reputationScore,
      weight: WEIGHTS.ADDRESS_REPUTATION,
      description: getReputationDescription(isContract)
    },
    behaviorPatterns: {
      rapidTransactions: patterns.rapidTransactions,
      unusualPatterns: patterns.unusualAmounts,
      suspiciousGasUsage: patterns.suspiciousGasUsage,
      score: behaviorScore,
      weight: WEIGHTS.BEHAVIOR_PATTERNS,
      description: getBehaviorDescription(patterns)
    }
  };

  // Add AML compliance factor if data is available
  if (amlData) {
    riskFactors.amlCompliance = {
      metasleuthScore: amlData.risk_score,
      riskIndicators: amlData.risk_indicators || [],
      score: amlScore,
      weight: WEIGHTS.AML_COMPLIANCE,
      description: generateAMLDescription(amlData.risk_score, amlData.risk_indicators || []),
      enabled: true
    };
  }

  return riskFactors;
}

/**
 * Calculate wallet age risk score (0-100, higher = more risky)
 */
function calculateWalletAgeScore(ageInDays: number): number {
  if (ageInDays === 0) return 100; // No transactions = highest risk
  if (ageInDays < 7) return 80;    // Less than a week = very risky
  if (ageInDays < 30) return 60;   // Less than a month = risky
  if (ageInDays < 90) return 40;   // Less than 3 months = moderate
  if (ageInDays < 180) return 20;  // Less than 6 months = low risk
  return 10;                        // Older = very low risk
}

/**
 * Calculate transaction history risk score
 */
function calculateTransactionScore(txCount: number, avgValue: number): number {
  if (txCount === 0) return 100;   // No transactions = highest risk
  if (txCount < 5) return 70;      // Very few transactions = high risk
  if (txCount < 20) return 50;     // Few transactions = moderate risk
  if (txCount < 50) return 30;     // Decent history = low risk
  return 15;                        // Strong history = very low risk
}

/**
 * Calculate address reputation score
 */
function calculateReputationScore(isContract: boolean, walletData: any): number {
  let score = 0;

  // Contracts can be higher risk depending on type
  if (isContract) {
    score += 30;
  }

  // Check for zero balance (potential throwaway wallet)
  if (parseFloat(walletData.balance) === 0 && walletData.transactionCount > 0) {
    score += 20;
  }

  // TODO: Add blacklist checking
  // if (hasBlacklistInteractions) score += 50;
  // if (knownMaliciousActivity) score = 100;

  return Math.min(score, 100);
}

/**
 * Calculate behavior pattern score
 */
function calculateBehaviorScore(patterns: any): number {
  let score = 0;

  if (patterns.rapidTransactions) score += 40;
  if (patterns.suspiciousGasUsage) score += 30;
  if (patterns.unusualAmounts) score += 30;

  return Math.min(score, 100);
}

/**
 * Calculate AML risk score from MetaSleuth score
 * MetaSleuth scores are typically 0-10, we convert to 0-100
 */
function calculateAMLScore(metasleuthScore: number): number {
  // MetaSleuth scores: 0-10 scale
  // Convert to 0-100 scale with higher weight for high scores
  if (metasleuthScore >= 8) return 100;  // Critical AML risk
  if (metasleuthScore >= 6) return 85;   // High AML risk
  if (metasleuthScore >= 4) return 60;   // Medium AML risk
  if (metasleuthScore >= 2) return 35;   // Low AML risk
  return 10;                              // Minimal AML risk
}

/**
 * Calculate overall weighted risk score
 */
function calculateOverallScore(factors: RiskFactors): number {
  let weightedScore =
    factors.walletAge.score * factors.walletAge.weight +
    factors.transactionHistory.score * factors.transactionHistory.weight +
    factors.addressReputation.score * factors.addressReputation.weight +
    factors.behaviorPatterns.score * factors.behaviorPatterns.weight;

  // Add AML compliance score if available
  if (factors.amlCompliance && factors.amlCompliance.enabled) {
    weightedScore += factors.amlCompliance.score * factors.amlCompliance.weight;
  }

  return Math.round(weightedScore);
}

/**
 * Determine risk level based on score
 */
function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

/**
 * Generate actionable recommendations based on risk analysis
 */
function generateRecommendations(score: number, factors: RiskFactors): string[] {
  const recommendations: string[] = [];

  // Check for critical AML indicators first
  if (factors.amlCompliance && factors.amlCompliance.enabled) {
    const hasAutoBlock = shouldAutoBlock(factors.amlCompliance.riskIndicators);
    if (hasAutoBlock) {
      recommendations.push('🚫 CRITICAL AML RISK - BLOCK IMMEDIATELY');
      recommendations.push('Wallet has interactions with sanctioned or high-risk entities.');
      recommendations.push('Compliance review required before any transaction.');

      // List specific critical indicators
      factors.amlCompliance.riskIndicators.forEach(indicator => {
        if (indicator.indicator.code <= 5004) { // Critical codes
          recommendations.push(`⚠️ ${indicator.indicator.name} detected (Source: ${indicator.source.substring(0, 10)}...)`);
        }
      });

      return recommendations; // Return early for auto-block cases
    }
  }

  // Standard risk-based recommendations
  if (score >= 80) {
    recommendations.push('🚫 BLOCK - Risk score is critical. Do not process payment.');
  } else if (score >= 60) {
    recommendations.push('⚠️ REVIEW REQUIRED - High risk detected. Manual review recommended.');
    recommendations.push('Consider limiting transaction amount or requiring additional verification.');
  } else if (score >= 30) {
    recommendations.push('⚡ MONITOR - Medium risk. Allow transaction but monitor closely.');
  } else {
    recommendations.push('✅ ALLOW - Low risk. Safe to proceed with transaction.');
  }

  // AML-specific recommendations
  if (factors.amlCompliance && factors.amlCompliance.enabled) {
    if (factors.amlCompliance.metasleuthScore >= 6) {
      recommendations.push('High AML risk detected. Enhanced due diligence recommended.');
    } else if (factors.amlCompliance.metasleuthScore >= 4) {
      recommendations.push('Moderate AML risk. Standard due diligence required.');
    }

    // List non-critical indicators
    const nonCriticalIndicators = factors.amlCompliance.riskIndicators.filter(
      i => i.indicator.code > 5004
    );
    if (nonCriticalIndicators.length > 0) {
      const types = nonCriticalIndicators.map(i => i.indicator.name).join(', ');
      recommendations.push(`AML indicators: ${types}`);
    }
  }

  // Specific factor recommendations
  if (factors.walletAge.ageInDays < 7) {
    recommendations.push('New wallet detected. Consider requiring additional verification.');
  }

  if (factors.transactionHistory.totalTransactions < 5) {
    recommendations.push('Limited transaction history. Monitor for unusual behavior.');
  }

  if (factors.addressReputation.isContract) {
    recommendations.push('Smart contract address. Verify contract legitimacy.');
  }

  if (factors.behaviorPatterns.rapidTransactions) {
    recommendations.push('Rapid transaction pattern detected. Possible bot activity.');
  }

  return recommendations;
}

/**
 * Helper functions for descriptions
 */
function getWalletAgeDescription(ageInDays: number): string {
  if (ageInDays === 0) return 'No transaction history';
  if (ageInDays < 7) return 'Very new wallet (< 1 week)';
  if (ageInDays < 30) return 'New wallet (< 1 month)';
  if (ageInDays < 90) return 'Relatively new (< 3 months)';
  if (ageInDays < 180) return 'Established wallet (< 6 months)';
  return 'Mature wallet (> 6 months)';
}

function getTransactionDescription(txCount: number): string {
  if (txCount === 0) return 'No transactions';
  if (txCount < 5) return 'Very limited activity';
  if (txCount < 20) return 'Limited activity';
  if (txCount < 50) return 'Moderate activity';
  return 'Active wallet';
}

function getReputationDescription(isContract: boolean): string {
  if (isContract) return 'Smart contract address';
  return 'Standard EOA (Externally Owned Account)';
}

function getBehaviorDescription(patterns: any): string {
  const issues = [];
  if (patterns.rapidTransactions) issues.push('rapid transactions');
  if (patterns.suspiciousGasUsage) issues.push('unusual gas usage');
  if (patterns.unusualAmounts) issues.push('suspicious amounts');

  if (issues.length === 0) return 'Normal behavior patterns';
  return `Suspicious patterns: ${issues.join(', ')}`;
}

function getTransactionFrequency(walletData: any): string {
  if (walletData.transactionCount === 0) return 'None';

  const ageInDays = calculateWalletAge(walletData);
  if (ageInDays === 0) return 'N/A';

  const txPerDay = walletData.transactionCount / ageInDays;
  if (txPerDay > 10) return 'Very High';
  if (txPerDay > 5) return 'High';
  if (txPerDay > 1) return 'Moderate';
  return 'Low';
}

/**
 * Clear expired entries from cache (can be called periodically)
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  for (const [address, cached] of riskCache.entries()) {
    if (cached.expiry <= now) {
      riskCache.delete(address);
    }
  }
  console.log(`🧹 Cache cleanup: ${riskCache.size} entries remaining`);
}

// Run cache cleanup every hour
setInterval(clearExpiredCache, 60 * 60 * 1000);
