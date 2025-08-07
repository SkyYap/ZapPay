import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  CreditCard, 
  Shield, 
  CheckCircle,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { createWalletClient, custom, type WalletClient } from 'viem';
import { baseSepolia } from 'viem/chains';
import type { Hex } from 'viem';
import axios from "axios";
import type { AxiosInstance } from "axios";
import { withPaymentInterceptor } from "x402-axios";

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// Base axios instance without payment interceptor
const baseApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// This will be dynamically set based on wallet connection
let apiClient: AxiosInstance = baseApiClient;

// Update the API client with a wallet
function updateApiClient(walletClient: WalletClient | null) {
  if (walletClient && walletClient.account) {
    // Create axios instance with x402 payment interceptor
    apiClient = withPaymentInterceptor(baseApiClient, walletClient as any);
    console.log("💳 API client updated with wallet:", walletClient.account.address);
  } else {
    // No wallet connected - reset to base client
    apiClient = baseApiClient;
    console.log("⚠️ API client reset - no wallet connected");
  }
}

// API endpoints
const api = {
  // Free endpoints
  getHealth: async () => {
    const response = await apiClient.get("/api/health");
    return response.data;
  },

  getPaymentOptions: async () => {
    const response = await apiClient.get("/api/payment-options");
    return response.data;
  },

  // Paid endpoints
  purchase24HourSession: async () => {
    console.log("🔐 Premium Membership purchasing ...");
    const response = await apiClient.post("/api/pay/session");
    console.log("✅ Premium Membership purchased:", response.data);
    return response.data.session;
  },

  purchaseOneTimeAccess: async () => {
    console.log("⚡ Purchasing one-time access...");
    const response = await apiClient.post("/api/pay/onetime");
    console.log("✅ One-time access granted:", response.data);
    return response.data;
  },
};

export function CryptoPayUI() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [address, setAddress] = useState<Hex | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed'>('pending');
  const [selectedCrypto, setSelectedCrypto] = useState('USDC');
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const paymentData = {
    name: 'Premium Membership',
    description: 'Access to premium features and exclusive content',
    amount: '1.00',
    currency: 'USD'
  };

  const cryptoOptions = ['ETH', 'BTC', 'USDT', 'USDC'];
  
  const getCryptoAmount = (cryptoType: string) => {
    // Approximate rates for $1.00 USD (as of current market)
    const rates = {
      'ETH': '0.0004', // ~$1.00 worth of ETH
      'BTC': '0.000015', // ~$1.00 worth of BTC
      'USDT': '1.00', // 1:1 with USD
      'USDC': '1.00' // 1:1 with USD
    };
    return rates[cryptoType as keyof typeof rates] || '0.0004';
  };

  // Update API client when wallet changes
  useEffect(() => {
    updateApiClient(walletClient);
  }, [walletClient]);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        }) as string[];
        
        if (accounts.length > 0) {
          const client = createWalletClient({
            account: accounts[0] as Hex,
            chain: baseSepolia,
            transport: custom(window.ethereum)
          });
          
          setWalletClient(client);
          setAddress(accounts[0] as Hex);
          setIsWalletConnected(true);
        }
      } catch (err) {
        console.error('Failed to check wallet connection:', err);
      }
    }
  };

  const handleConnectWallet = useCallback(async () => {
    setError(null);
    setIsConnecting(true);

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask or another Ethereum wallet');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Check if on correct network (Base Sepolia)
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      }) as string;
      
      const baseSepoliaChainIdHex = '0x14a34'; // 84532 in hex
      
      if (chainId !== baseSepoliaChainIdHex) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: baseSepoliaChainIdHex }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to browser wallet
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: baseSepoliaChainIdHex,
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org'],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      // Create viem wallet client
      const client = createWalletClient({
        account: accounts[0] as Hex,
        chain: baseSepolia,
        transport: custom(window.ethereum)
      });

      setWalletClient(client);
      setAddress(accounts[0] as Hex);
      setIsWalletConnected(true);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const handleDisconnectWallet = useCallback(() => {
    setWalletClient(null);
    setAddress(null);
    setIsWalletConnected(false);
    setError(null);
  }, []);

  const handlePayWithCrypto = async () => {
    if (!isWalletConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setPaymentStatus('processing');
    setError(null);
    
    try {
      // Purchase 24-hour session (equivalent to the $1.00 payment)
      const result = await api.purchase24HourSession();
      
      setPaymentResult({
        type: 'success',
        message: result.message,
        session: result.session,
      });
      
      setPaymentStatus('completed');
    } catch (error: any) {
      setPaymentStatus('pending');
      setError(error.message || 'Failed to process payment');
      setPaymentResult({
        type: 'error',
        message: error.message || 'Failed to process payment',
      });
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          handleDisconnectWallet();
        } else if (accounts[0] !== address) {
          // Re-connect with new account
          const client = createWalletClient({
            account: accounts[0] as Hex,
            chain: baseSepolia,
            transport: custom(window.ethereum)
          });
          
          setWalletClient(client);
          setAddress(accounts[0] as Hex);
          setIsWalletConnected(true);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [address, handleDisconnectWallet]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">CryptoPay</h1>
            </div>
            <div className="relative">
              {isWalletConnected && address ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">{formatAddress(address)}</span>
                  </div>
                  <Button
                    onClick={handleDisconnectWallet}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              )}
              {error && (
                <div className="absolute top-full left-0 mt-2 px-3 py-2 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm z-10">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Terminal Preview */}
          <div className="space-y-6">
            <Card className="border-amber-100 bg-gradient-to-br from-white to-amber-50/30">
              <CardHeader>
                <CardTitle className="flex items-center text-amber-600">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Terminal Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-dashed border-amber-200">
                  <div className="text-center space-y-6">
                    {/* Payment Status */}
                    <div className="flex items-center justify-center">
                      {paymentStatus === 'pending' && (
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      {paymentStatus === 'processing' && (
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center animate-pulse">
                          <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      {paymentStatus === 'completed' && (
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-orange-600" />
                        </div>
                      )}
                    </div>

                    {/* Payment Details */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {paymentData.name}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {paymentData.description}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-gray-900">
                        ${paymentData.amount}
                      </div>
                      <div className="text-sm text-gray-500">
                        ≈ {getCryptoAmount(selectedCrypto)} {selectedCrypto}
                      </div>
                    </div>

                    {/* Payment Button */}
                    <Button
                      onClick={handlePayWithCrypto}
                      disabled={!isWalletConnected || paymentStatus !== 'pending'}
                      className={`w-full ${
                        paymentStatus === 'completed'
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white' 
                          : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white'
                      }`}
                    >
                      {paymentStatus === 'pending' && (
                        <>
                          <Wallet className="h-4 w-4 mr-2" />
                          Pay with Crypto
                        </>
                      )}
                      {paymentStatus === 'processing' && (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing Payment...
                        </>
                      )}
                      {paymentStatus === 'completed' && (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Payment Complete
                        </>
                      )}
                    </Button>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                      <Shield className="h-3 w-3" />
                      <span>Secure crypto payment powered by x402</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Result */}
            {paymentResult && (
              <Card className="border-amber-100 bg-gradient-to-br from-white to-amber-50/30">
                <CardHeader>
                  <CardTitle className="text-amber-600">Payment Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`p-4 rounded-lg ${
                    paymentResult.type === 'success' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {paymentResult.type === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <div className="h-5 w-5 bg-red-600 rounded-full"></div>
                      )}
                      <span className={`font-medium ${
                        paymentResult.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {paymentResult.message}
                      </span>
                    </div>
                    {paymentResult.session && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Session ID:</strong> {paymentResult.session.id}</p>
                        <p><strong>Type:</strong> {paymentResult.session.type}</p>
                        <p><strong>Valid For:</strong> {paymentResult.session.validFor}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Details */}
          <div className="space-y-6">
            <Card className="border-amber-100 bg-gradient-to-br from-white to-amber-50/30">
              <CardHeader>
                <CardTitle className="text-amber-600">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Product</span>
                    <span className="font-medium">{paymentData.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium">${paymentData.amount} </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Crypto Type</span>
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white border border-gray-200 hover:bg-gray-50 min-w-[100px]"
                        onClick={() => setShowCryptoDropdown(!showCryptoDropdown)}
                      >
                        {selectedCrypto}
                        <ChevronDown className="h-3 w-3 ml-2" />
                      </Button>
                      {showCryptoDropdown && (
                        <div className="absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
                          {cryptoOptions.map((crypto) => (
                            <button
                              key={crypto}
                              className="w-full px-3 py-2 text-left text-sm bg-white hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
                              onClick={() => {
                                setSelectedCrypto(crypto);
                                setShowCryptoDropdown(false);
                              }}
                            >
                              {crypto}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Crypto Amount</span>
                    <span className="font-medium">{getCryptoAmount(selectedCrypto)} {selectedCrypto}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-left">Network Fee (Scroll)</span>
                    <span className="font-medium text-right">Free! Subsidy by CryptoPay</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-semibold">Total</span>
                      <span className="text-gray-900 font-semibold">${paymentData.amount} USD</span>
                    </div>
                  </div>
                </div>


              </CardContent>
            </Card>

            {/* Status */}
            <Card className="border-amber-100 bg-gradient-to-br from-white to-amber-50/30">
              <CardHeader>
                <CardTitle className="text-amber-600">Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      isWalletConnected ? 'bg-orange-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm">Wallet Connection</span>
                    {isWalletConnected && <CheckCircle className="h-4 w-4 text-orange-600" />}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      paymentStatus === 'processing' || paymentStatus === 'completed' ? 'bg-orange-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm">Payment Processing</span>
                    {(paymentStatus === 'processing' || paymentStatus === 'completed') && <CheckCircle className="h-4 w-4 text-orange-600" />}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      paymentStatus === 'completed' ? 'bg-orange-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm">Transaction Complete</span>
                    {paymentStatus === 'completed' && <CheckCircle className="h-4 w-4 text-orange-600" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
