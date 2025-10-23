import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const ANALYSIS_ENGINE_URL = process.env.ANALYSIS_ENGINE_URL || 'http://localhost:3002';
const RISK_THRESHOLD = parseInt(process.env.RISK_THRESHOLD || '75');

export interface RiskAnalysis {
  walletAddress: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: any;
  recommendations: string[];
  timestamp: string;
  cacheExpiry: string;
}

export interface RiskCheckResult {
  allowed: boolean;
  riskAnalysis: RiskAnalysis | null;
  error?: string;
  blockReason?: string;
}

/**
 * Check wallet risk score from analysis engine
 * @param walletAddress - Ethereum wallet address to check
 * @returns Risk check result with allow/block decision
 */
export async function checkWalletRisk(walletAddress: string): Promise<RiskCheckResult> {
  try {
    console.log(`🔍 Checking wallet risk for ${walletAddress}`);

    const response = await axios.get(
      `${ANALYSIS_ENGINE_URL}/api/risk/wallet/${walletAddress}`,
      { timeout: 10000 } // 10 second timeout
    );

    if (!response.data.success) {
      console.error('❌ Risk analysis failed:', response.data);
      // Fail open - allow transaction if analysis fails
      return {
        allowed: true,
        riskAnalysis: null,
        error: 'Risk analysis service error'
      };
    }

    const riskAnalysis: RiskAnalysis = response.data.data;
    const riskScore = riskAnalysis.riskScore;

    console.log(`📊 Risk Score: ${riskScore}/100 (${riskAnalysis.riskLevel})`);

    // Check if wallet should be blocked
    if (riskScore >= RISK_THRESHOLD) {
      console.log(`🚫 BLOCKED: Wallet exceeds risk threshold (${riskScore} >= ${RISK_THRESHOLD})`);

      // Extract block reason from recommendations
      const criticalRecommendations = riskAnalysis.recommendations
        .filter(r => r.includes('BLOCK') || r.includes('CRITICAL'))
        .join(' | ');

      return {
        allowed: false,
        riskAnalysis,
        blockReason: criticalRecommendations || `High risk score: ${riskScore}/100`
      };
    }

    // Check for AML auto-block indicators
    if (riskAnalysis.factors.amlCompliance?.enabled) {
      const hasAutoBlock = riskAnalysis.recommendations.some(
        r => r.includes('BLOCK IMMEDIATELY') || r.includes('CRITICAL AML RISK')
      );

      if (hasAutoBlock) {
        console.log('🚫 BLOCKED: Critical AML indicators detected');
        return {
          allowed: false,
          riskAnalysis,
          blockReason: 'Critical AML compliance violation detected'
        };
      }
    }

    console.log(`✅ ALLOWED: Wallet passed risk check (${riskScore}/100)`);
    return {
      allowed: true,
      riskAnalysis
    };

  } catch (error: any) {
    console.error('❌ Error checking wallet risk:', error.message);

    // Check if analysis engine is down
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.warn('⚠️ Analysis engine unavailable - failing open (allowing transaction)');
    }

    // Fail open - allow transaction if service is unavailable
    // In production, you might want to fail closed (block) instead
    return {
      allowed: true,
      riskAnalysis: null,
      error: `Risk check unavailable: ${error.message}`
    };
  }
}

/**
 * Batch check multiple wallet addresses
 * @param walletAddresses - Array of wallet addresses
 * @returns Array of risk check results
 */
export async function batchCheckWalletRisk(
  walletAddresses: string[]
): Promise<RiskCheckResult[]> {
  try {
    console.log(`🔍 Batch checking ${walletAddresses.length} wallets`);

    // Call individual endpoint for each wallet in parallel
    const promises = walletAddresses.map(address => checkWalletRisk(address));
    const results = await Promise.all(promises);

    console.log(`📊 Batch results: ${results.filter(r => r.allowed).length}/${results.length} allowed`);
    return results;

  } catch (error: any) {
    console.error('❌ Error in batch risk check:', error.message);
    // Fail open
    return walletAddresses.map(() => ({
      allowed: true,
      riskAnalysis: null,
      error: 'Batch check unavailable'
    }));
  }
}

/**
 * Get current risk threshold from environment
 * @returns Current risk threshold (0-100)
 */
export function getRiskThreshold(): number {
  return RISK_THRESHOLD;
}

/**
 * Check if analysis engine is healthy
 * @returns true if service is available
 */
export async function isAnalysisEngineHealthy(): Promise<boolean> {
  try {
    const response = await axios.get(`${ANALYSIS_ENGINE_URL}/health`, {
      timeout: 5000
    });
    return response.data.status === 'ok';
  } catch (error) {
    return false;
  }
}
