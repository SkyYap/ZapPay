import axios from "axios";
import type { AxiosInstance } from "axios";
import type { WalletClient } from "viem";
import { withPaymentInterceptor } from "x402-axios";
import { supabase } from "@/lib/supabase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// Base axios instance without payment interceptor
const baseApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Supabase auth interceptor
baseApiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// This will be dynamically set based on wallet connection
let apiClient: AxiosInstance = baseApiClient;

// Update the API client with a wallet
export function updateApiClient(walletClient: WalletClient | null) {
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
export const api = {
  // Free endpoints
  getHealth: async () => {
    const response = await apiClient.get("/api/health");
    return response.data;
  },

  getPaymentOptions: async () => {
    const response = await apiClient.get("/api/payment-options");
    return response.data;
  },

  validateSession: async (sessionId: string) => {
    const response = await apiClient.get(`/api/session/${sessionId}`);
    return response.data;
  },

  getActiveSessions: async () => {
    const response = await apiClient.get("/api/sessions");
    return response.data;
  },

  // Paid endpoints
  purchase24HourSession: async () => {
    console.log("🔐 Purchasing 24-hour session access...");
    const response = await apiClient.post("/api/pay/session");
    console.log("✅ 24-hour session created:", response.data);
    return response.data;
  },

  purchaseOneTimeAccess: async () => {
    console.log("⚡ Purchasing one-time access...");
    const response = await apiClient.post("/api/pay/onetime");
    console.log("✅ One-time access granted:", response.data);
    return response.data;
  },

  // Product management
  createProduct: async (productData: { name: string; pricing: number }) => {
    console.log("📦 Creating new product...", productData);
    const response = await apiClient.post("/api/product", productData);
    console.log("✅ Product created:", response.data);
    return response.data;
  },

  getProducts: async () => {
    console.log("📦 Fetching products...");
    const response = await apiClient.get("/api/products");
    console.log("✅ Products fetched:", response.data);
    return response.data;
  },

  // Payment Links management
  getPaymentLinks: async () => {
    console.log("🔗 Fetching payment links...");
    const response = await apiClient.get("/api/payment-links");
    console.log("✅ Payment links fetched:", response.data);
    return response.data;
  },

  createPaymentLink: async (paymentLinkData: { link_name: string; product_name: string; expiry_date: string }) => {
    console.log("🔗 Creating payment link...", paymentLinkData);
    const response = await apiClient.post("/api/payment-link", paymentLinkData);
    console.log("✅ Payment link created:", response.data);
    return response.data;
  },

  // Transaction management
  getTransactions: async (params?: { status?: string; limit?: number; offset?: number }) => {
    console.log("💳 Fetching transactions...", params);
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await apiClient.get(`/api/transactions?${queryParams.toString()}`);
    console.log("✅ Transactions fetched:", response.data);
    return response.data;
  },

  getWalletRiskAnalysis: async (address: string) => {
    console.log("🔍 Fetching wallet risk analysis...", address);
    const response = await apiClient.get(`/api/risk/wallet/${address}`);
    console.log("✅ Risk analysis fetched:", response.data);
    return response.data;
  },
};

// Types for API responses
export interface PaymentOption {
  name: string;
  endpoint: string;
  price: string;
  description: string;
}

export interface Session {
  id: string;
  type: "24hour" | "onetime";
  createdAt: string;
  expiresAt: string;
  validFor?: string;
  remainingTime?: number;
}

export interface SessionValidation {
  valid: boolean;
  error?: string;
  session?: Session;
}

export interface Product {
  id: string;
  name: string;
  pricing: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductResponse {
  success: boolean;
  message?: string;
  product?: Product;
  error?: string;
}

export interface PaymentLink {
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

export interface CreatePaymentLinkResponse {
  success: boolean;
  message?: string;
  payment_link?: PaymentLink;
  error?: string;
}

export interface Transaction {
  id: string;
  owner_id: string;
  payment_link_id?: string;
  type: 'payment' | 'withdrawal' | 'deposit';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  crypto_amount?: number;
  crypto_currency?: string;
  customer_id?: string;
  tx_hash?: string;
  network_fee?: number;
  created_at: string;
  updated_at?: string;
}

export interface TransactionStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  cancelled: number;
  totalAmount: number;
}

export interface GetTransactionsResponse {
  success: boolean;
  transactions: Transaction[];
  count: number;
  stats: TransactionStats;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  error?: string;
} 