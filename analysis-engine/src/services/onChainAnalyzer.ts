import axios from 'axios';
import type { BasescanResponse, WalletData, BasescanTransaction } from '../types';

const ETHERSCAN_BASE_URL = 'https://api.etherscan.io/v2/api';
const BASE_CHAIN_ID = 8453; // Base mainnet chain ID

// Get API key lazily to ensure .env is loaded first
function getApiKey(): string {
  return process.env.ETHERSCAN_API_KEY || '';
}

/**
 * Fetch wallet transaction data from Basescan
 * @param address - Wallet address to analyze
 * @returns Wallet data including transactions
 */
export async function getWalletDataFromBasescan(address: string): Promise<WalletData> {
  try {
    const apiKey = getApiKey();
    console.log(`📡 Fetching on-chain data for ${address}`);
    console.log(`🔑 Using API Key: ${apiKey?.substring(0, 10)}...`);
    console.log(`🌐 Base URL: ${ETHERSCAN_BASE_URL}`);
    console.log(`⛓️  Chain ID: ${BASE_CHAIN_ID}`);

    // Fetch first transaction (for wallet age)
    const firstTxResponse = await axios.get<BasescanResponse>(ETHERSCAN_BASE_URL, {
      params: {
        chainid: BASE_CHAIN_ID,
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: 1, // Get only first transaction
        sort: 'asc', // Ascending = oldest first
        apikey: getApiKey()
      },
      timeout: 10000
    });

    // Fetch recent transactions (for analysis)
    const txListResponse = await axios.get<BasescanResponse>(ETHERSCAN_BASE_URL, {
      params: {
        chainid: BASE_CHAIN_ID,
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: 100, // Get last 100 transactions
        sort: 'desc', // Descending = newest first
        apikey: apiKey
      },
      timeout: 10000
    });

    // Fetch account balance
    const balanceResponse = await axios.get<BasescanResponse>(ETHERSCAN_BASE_URL, {
      params: {
        chainid: BASE_CHAIN_ID,
        module: 'account',
        action: 'balance',
        address: address,
        tag: 'latest',
        apikey: apiKey
      },
      timeout: 10000
    });

    // Debug: Log API response
    console.log('API Response Status:', txListResponse.data.status);
    console.log('API Response Message:', txListResponse.data.message);
    console.log('API Response Result Type:', typeof txListResponse.data.result);
    if (!Array.isArray(txListResponse.data.result)) {
      console.log('API Response Result:', txListResponse.data.result);
    }

    // Parse transactions
    const transactions: BasescanTransaction[] = Array.isArray(txListResponse.data.result)
      ? txListResponse.data.result
      : [];

    // Parse first transaction
    const firstTx: BasescanTransaction | undefined = Array.isArray(firstTxResponse.data.result) && firstTxResponse.data.result.length > 0
      ? firstTxResponse.data.result[0]
      : undefined;

    const balance = typeof balanceResponse.data.result === 'string'
      ? balanceResponse.data.result
      : '0';

    // Sort transactions by timestamp (oldest first)
    const sortedTransactions = [...transactions].sort((a, b) =>
      parseInt(a.timeStamp) - parseInt(b.timeStamp)
    );

    const walletData: WalletData = {
      address,
      transactions: sortedTransactions,
      transactionCount: sortedTransactions.length,
      balance,
      firstTransaction: firstTx || sortedTransactions[0] || undefined, // Use actual first tx
      lastTransaction: sortedTransactions[sortedTransactions.length - 1] || undefined
    };

    console.log(`✅ Fetched ${walletData.transactionCount} transactions for ${address}`);

    return walletData;
  } catch (error: any) {
    console.error('Basescan API error:', error.message);

    // Return empty wallet data on error
    return {
      address,
      transactions: [],
      transactionCount: 0,
      balance: '0'
    };
  }
}

/**
 * Calculate wallet age in days
 * @param walletData - Wallet data from Basescan
 * @returns Age in days, or 0 if no transactions
 */
export function calculateWalletAge(walletData: WalletData): number {
  if (!walletData.firstTransaction) {
    return 0;
  }

  const firstTxTimestamp = parseInt(walletData.firstTransaction.timeStamp) * 1000;
  const now = Date.now();
  const ageInMs = now - firstTxTimestamp;
  const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));

  return ageInDays;
}

/**
 * Calculate average transaction value in ETH
 * @param walletData - Wallet data from Basescan
 * @returns Average transaction value
 */
export function calculateAverageTransactionValue(walletData: WalletData): number {
  if (walletData.transactionCount === 0) {
    return 0;
  }

  const totalValue = walletData.transactions.reduce((sum, tx) => {
    const value = parseFloat(tx.value) / 1e18; // Convert Wei to ETH
    return sum + value;
  }, 0);

  return totalValue / walletData.transactionCount;
}

/**
 * Check if address is a smart contract
 * @param address - Wallet address to check
 * @returns true if contract, false otherwise
 */
export async function isSmartContract(address: string): Promise<boolean> {
  try {
    const response = await axios.get<BasescanResponse>(ETHERSCAN_BASE_URL, {
      params: {
        chainid: BASE_CHAIN_ID,
        module: 'contract',
        action: 'getabi',
        address: address,
        apikey: getApiKey()
      },
      timeout: 5000
    });

    // If ABI exists, it's a contract
    return response.data.status === '1';
  } catch (error) {
    console.error('Contract check error:', error);
    return false;
  }
}

/**
 * Detect unusual transaction patterns
 * @param walletData - Wallet data from Basescan
 * @returns Object with pattern detection flags
 */
export function detectUnusualPatterns(walletData: WalletData): {
  rapidTransactions: boolean;
  suspiciousGasUsage: boolean;
  unusualAmounts: boolean;
} {
  if (walletData.transactionCount < 2) {
    return {
      rapidTransactions: false,
      suspiciousGasUsage: false,
      unusualAmounts: false
    };
  }

  // Check for rapid transactions (multiple txs within 10 seconds - likely bot activity)
  let rapidCount = 0;
  for (let i = 1; i < walletData.transactions.length; i++) {
    const timeDiff = parseInt(walletData.transactions[i].timeStamp) -
                     parseInt(walletData.transactions[i - 1].timeStamp);
    if (timeDiff < 10) {  // Changed from 60 to 10 seconds
      rapidCount++;
    }
  }
  const rapidTransactions = rapidCount > 10;  // Changed from 5 to 10

  // Check for suspicious gas usage (extremely high or low compared to typical patterns)
  const gasUsages = walletData.transactions.map(tx => parseInt(tx.gasUsed));
  const avgGas = gasUsages.reduce((a, b) => a + b, 0) / gasUsages.length;
  // More lenient threshold - only flag extreme outliers
  const suspiciousGasUsage = gasUsages.some(gas =>
    gas > avgGas * 10 || gas < avgGas * 0.1  // Changed from 3x/0.3x to 10x/0.1x
  );

  // Check for unusual amounts (many small test transactions)
  // Only flag if 90%+ are dust transactions (very small amounts)
  const smallTransactions = walletData.transactions.filter(tx => {
    const ethValue = parseFloat(tx.value) / 1e18;
    return ethValue < 0.0001;  // Changed from 0.001 to 0.0001 (dust)
  });
  const unusualAmounts = smallTransactions.length > walletData.transactionCount * 0.9;  // Changed from 70% to 90%

  return {
    rapidTransactions,
    suspiciousGasUsage,
    unusualAmounts
  };
}
