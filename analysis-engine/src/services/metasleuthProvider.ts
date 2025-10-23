import axios from 'axios';
import type { MetaSleuthResponse, MetaSleuthRiskData, RiskIndicator } from '../types';

const METASLEUTH_API_URL = 'https://aml.blocksec.com/address-compliance/api/v3/risk-score';
const METASLEUTH_API_KEY = process.env.METASLEUTH_API_KEY || '';
const ENABLE_METASLEUTH = process.env.ENABLE_METASLEUTH === 'true';

// Chain ID mapping for MetaSleuth
const CHAIN_ID_MAP: Record<number, number> = {
  // Base Sepolia
  84532: 84532,
  // Base Mainnet
  8453: 8453,
  // Ethereum Mainnet
  1: 1,
  // Add more chains as needed
};

/**
 * Get AML risk score from MetaSleuth for a wallet address
 * @param address - Wallet address to check
 * @param chainId - Blockchain chain ID (default: Base Sepolia)
 * @returns MetaSleuth risk data or null if unavailable
 */
export async function getMetaSleuthRisk(
  address: string,
  chainId: number = 84532
): Promise<MetaSleuthRiskData | null> {
  // Check if MetaSleuth is enabled
  if (!ENABLE_METASLEUTH) {
    console.log('⚠️ MetaSleuth AML screening is disabled');
    return null;
  }

  // Check if API key is configured
  if (!METASLEUTH_API_KEY) {
    console.warn('⚠️ MetaSleuth API key not configured. Skipping AML check.');
    return null;
  }

  // Get MetaSleuth chain ID
  const metasleuthChainId = CHAIN_ID_MAP[chainId];
  if (!metasleuthChainId) {
    console.warn(`⚠️ Chain ID ${chainId} not supported by MetaSleuth. Skipping AML check.`);
    return null;
  }

  try {
    console.log(`🔍 Checking AML risk via MetaSleuth for ${address} on chain ${metasleuthChainId}`);

    const response = await axios.post<MetaSleuthResponse>(
      METASLEUTH_API_URL,
      {
        chain_id: metasleuthChainId,
        address: address,
        interaction_risk: true
      },
      {
        headers: {
          'API-KEY': METASLEUTH_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 second timeout
      }
    );

    // Check for successful response
    if (response.data.code !== 200000) {
      console.error(`❌ MetaSleuth API error: ${response.data.message}`);
      return null;
    }

    // Extract nested data
    const riskData = response.data.data?.data;
    if (!riskData) {
      console.error('❌ Invalid MetaSleuth response structure');
      return null;
    }

    console.log(`✅ MetaSleuth AML check complete: Risk Score = ${riskData.risk_score}`);

    if (riskData.risk_indicators && riskData.risk_indicators.length > 0) {
      console.log(`⚠️ Found ${riskData.risk_indicators.length} risk indicators:`);
      riskData.risk_indicators.forEach(indicator => {
        console.log(`  - ${indicator.type}: ${indicator.indicator.name} (code: ${indicator.indicator.code})`);
      });
    }

    return riskData;
  } catch (error: any) {
    // Graceful degradation - log error but don't fail the entire analysis
    if (error.response) {
      console.error(`❌ MetaSleuth API error (${error.response.status}):`, error.response.data);
    } else if (error.request) {
      console.error('❌ MetaSleuth API timeout or network error');
    } else {
      console.error('❌ MetaSleuth error:', error.message);
    }
    return null;
  }
}

/**
 * Categorize risk indicators by severity
 * @param indicators - Array of risk indicators from MetaSleuth
 * @returns Categorized indicators
 */
export function categorizeRiskIndicators(indicators: RiskIndicator[]): {
  critical: RiskIndicator[];
  high: RiskIndicator[];
  medium: RiskIndicator[];
  low: RiskIndicator[];
} {
  const critical: RiskIndicator[] = [];
  const high: RiskIndicator[] = [];
  const medium: RiskIndicator[] = [];
  const low: RiskIndicator[] = [];

  // Critical risk indicator codes (these should auto-block)
  const criticalCodes = [
    5001, // Terrorism Financing
    5002, // Child Abuse Material
    5003, // Sanctions
    5004, // Stolen Funds
  ];

  // High risk indicator codes
  const highCodes = [
    5005, // Mixer/Tumbler
    5006, // Ransomware
    5007, // Scam
    5008, // Phishing
    5009, // Hack/Exploit
  ];

  // Medium risk indicator codes
  const mediumCodes = [
    5010, // Gambling
    5011, // Darknet Market
    5012, // High Risk Exchange
  ];

  indicators.forEach(indicator => {
    const code = indicator.indicator.code;

    if (criticalCodes.includes(code)) {
      critical.push(indicator);
    } else if (highCodes.includes(code)) {
      high.push(indicator);
    } else if (mediumCodes.includes(code)) {
      medium.push(indicator);
    } else {
      low.push(indicator);
    }
  });

  return { critical, high, medium, low };
}

/**
 * Generate human-readable description of AML risk
 * @param riskScore - MetaSleuth risk score
 * @param indicators - Risk indicators
 * @returns Description string
 */
export function generateAMLDescription(
  riskScore: number,
  indicators: RiskIndicator[]
): string {
  if (indicators.length === 0) {
    return 'No AML risk detected - Clean wallet history';
  }

  const categorized = categorizeRiskIndicators(indicators);
  const parts: string[] = [];

  if (categorized.critical.length > 0) {
    const names = categorized.critical.map(i => i.indicator.name).join(', ');
    parts.push(`CRITICAL: ${names}`);
  }

  if (categorized.high.length > 0) {
    const names = categorized.high.map(i => i.indicator.name).join(', ');
    parts.push(`High Risk: ${names}`);
  }

  if (categorized.medium.length > 0) {
    const names = categorized.medium.map(i => i.indicator.name).join(', ');
    parts.push(`Medium Risk: ${names}`);
  }

  return parts.length > 0
    ? parts.join(' | ')
    : `${indicators.length} risk indicator(s) detected`;
}

/**
 * Check if wallet should be auto-blocked based on AML indicators
 * @param indicators - Risk indicators from MetaSleuth
 * @returns true if should block, false otherwise
 */
export function shouldAutoBlock(indicators: RiskIndicator[]): boolean {
  if (indicators.length === 0) return false;

  const categorized = categorizeRiskIndicators(indicators);

  // Auto-block if any critical indicators
  if (categorized.critical.length > 0) {
    return true;
  }

  // Auto-block if multiple high-risk indicators
  if (categorized.high.length >= 2) {
    return true;
  }

  return false;
}
