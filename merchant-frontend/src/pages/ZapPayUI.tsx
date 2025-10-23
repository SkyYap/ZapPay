import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wallet, 
  CreditCard, 
  Shield, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from "axios";
import type { AxiosInstance } from "axios";
import { withPaymentInterceptor } from "x402-axios";
import { useWallet } from '@/contexts/WalletContext';


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
function updateApiClient(walletClient: any) {
  if (walletClient && walletClient.account) {
    try {
      // Create axios instance with x402 payment interceptor
      apiClient = withPaymentInterceptor(baseApiClient, walletClient);
      console.log("💳 API client updated with wallet:", walletClient.account.address);
    } catch (error) {
      console.error("❌ Failed to create x402 payment interceptor:", error);
      // Fallback to base client if x402 interceptor fails
      apiClient = baseApiClient;
    }
  } else {
    // No wallet connected - reset to base client
    apiClient = baseApiClient;
    console.log("⚠️ API client reset - no wallet connected");
  }
}

// Payment link interface
interface PaymentLink {
  id: string;
  link_name: string;
  payment_link: string;
  product_id: string;
  product_name: string;
  pricing: number;
  expiry_date: string;
  created_at: string;
  updated_at: string;
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

  // Get payment link details
  getPaymentLink: async (paymentLink: string) => {
    const response = await apiClient.get(`/api/payment-link/${paymentLink}`);
    return response.data;
  },

  // Get wallet risk analysis
  getWalletRiskAnalysis: async (walletAddress: string) => {
    const response = await baseApiClient.get(`/api/risk/wallet/${walletAddress}`);
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

export function ZapPayUI() {
  const { paymentLink } = useParams<{ paymentLink: string }>();
  const navigate = useNavigate();
  
  // Use wallet context
  const { 
    isConnected: isWalletConnected, 
    address, 
    walletClient, 
    error: walletError, 
    isConnecting, 
    connectWallet, 
    disconnectWallet 
  } = useWallet();
  
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed'>('pending');
  const [paymentResult, setPaymentResult] = useState<any>(null);
  
  // Payment link data
  const [paymentLinkData, setPaymentLinkData] = useState<PaymentLink | null>(null);
  const [isLoadingPaymentLink, setIsLoadingPaymentLink] = useState(true);
  const [paymentLinkError, setPaymentLinkError] = useState<string | null>(null);

  // Fetch payment link data on component mount
  useEffect(() => {
    if (paymentLink) {
      fetchPaymentLinkData();
    }
  }, [paymentLink]);

  const fetchPaymentLinkData = async () => {
    if (!paymentLink) return;

    setIsLoadingPaymentLink(true);
    setPaymentLinkError(null);

    try {
      const response = await api.getPaymentLink(paymentLink);

      console.log("🔍 Payment Link Response:", response);
      console.log("🔍 Payment Link Data:", response.payment_link);

      if (response.success) {
        setPaymentLinkData(response.payment_link);
      } else {
        setPaymentLinkError(response.error || 'Failed to load payment link');
      }
    } catch (error: any) {
      setPaymentLinkError(error.message || 'Failed to load payment link');
    } finally {
      setIsLoadingPaymentLink(false);
    }
  };

  // Update API client when wallet changes
  useEffect(() => {
    updateApiClient(walletClient);
  }, [walletClient]);

  const handlePayWithCrypto = async () => {
    if (!isWalletConnected) {
      return;
    }

    setPaymentStatus('processing');
    
    try {
      console.log("🚀 Starting payment process...");
      console.log("💳 Wallet connected:", address);
      console.log("🔗 Chain:", walletClient?.chain?.name);
      console.log("🌐 Network ID:", walletClient?.chain?.id);
      
      // Purchase 24-hour session (equivalent to the $1.00 payment)
      const session = await api.purchase24HourSession();
      
      console.log("✅ Payment successful:", session);
      
      setPaymentResult({
        type: 'success',
        message: 'Payment successful!',
        session: session,
      });
      
      setPaymentStatus('completed');
    } catch (error: any) {
      console.error("❌ Payment failed:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });

      setPaymentStatus('pending');

      // If it's a 403 error, fetch wallet risk analysis
      if (error.response?.status === 403 && address) {
        try {
          console.log("🔍 Fetching risk analysis for blocked wallet...");
          const riskData = await api.getWalletRiskAnalysis(address);

          if (riskData.success && riskData.data) {
            const analysis = riskData.data;
            const riskScore = analysis.riskScore || 0;
            const riskLevel = analysis.riskLevel || 'unknown';
            const recommendations = analysis.recommendations || [];

            // Format the error message with risk details
            let errorMessage = `PAYMENT BLOCKED\n\nRisk Score: ${riskScore}/100 (${riskLevel})\n`;

            if (recommendations.length > 0) {
              errorMessage += `\nReasons:\n${recommendations.map((r: string) => `• ${r}`).join('\n')}`;
            }

            setPaymentResult({
              type: 'error',
              message: errorMessage,
              riskAnalysis: analysis,
            });
          } else {
            setPaymentResult({
              type: 'error',
              message: 'PAYMENT BLOCKED - Wallet exceeds risk threshold',
            });
          }
        } catch (riskError) {
          console.error("Failed to fetch risk analysis:", riskError);
          setPaymentResult({
            type: 'error',
            message: 'PAYMENT BLOCKED - High risk wallet detected',
          });
        }
      } else {
        setPaymentResult({
          type: 'error',
          message: error.message || 'Failed to process payment',
        });
      }
    }
  };


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
              <h1 className="text-xl font-bold text-gray-900">ZapPay</h1>
            </div>
            <div className="relative">
              {isWalletConnected && address ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">{formatAddress(address)}</span>
                  </div>
                  <Button
                    onClick={disconnectWallet}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              )}
              {walletError && (
                <div className="absolute top-full left-0 mt-2 px-3 py-2 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm z-10">
                  {walletError}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Loading State */}
        {isLoadingPaymentLink && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment details...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {paymentLinkError && !isLoadingPaymentLink && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Link Error</h3>
              <p className="text-gray-600 mb-4">{paymentLinkError}</p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Go Back
              </Button>
            </div>
          </div>
        )}

        {/* Payment UI */}
        {!isLoadingPaymentLink && !paymentLinkError && paymentLinkData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Terminal Preview */}
          <div className="space-y-6">
            <Card className="border-amber-100 bg-gradient-to-br from-white to-amber-50/30">
              <CardHeader>
                <CardTitle className="flex items-center text-amber-600">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Terminal
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
                        {paymentLinkData?.product_name || 'Loading...'}
                      </h3>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-gray-900">
                        ${paymentLinkData?.pricing?.toFixed(2) || '0.00'} USDC
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
                      <span>Secure crypto payment powered by ZapPay</span>
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
                    <div className="flex items-start space-x-2">
                      {paymentResult.type === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className={`font-medium whitespace-pre-line ${
                        paymentResult.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {paymentResult.message}
                      </div>
                    </div>
                    {paymentResult.session && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Session ID:</strong> {paymentResult.session.id}</p>
                        {/* <p><strong>Type:</strong> {paymentResult.session.type}</p>
                        <p><strong>Valid For:</strong> {paymentResult.session.validFor}</p> */}
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
                    <span className="font-medium">{paymentLinkData?.product_name || 'Loading...'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium">${paymentLinkData?.pricing?.toFixed(2) || '0.00'} USDC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-left">Network Fee</span>
                    <span className="font-medium text-right">Free! Subsidy by ZapPay</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-semibold">Total</span>
                      <span className="text-gray-900 font-semibold">${paymentLinkData?.pricing?.toFixed(2) || '0.00'} USDC</span>
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
        )}
      </div>
    </div>
  );
}
