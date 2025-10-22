export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Transaction {
  id: string;
  type: 'payment' | 'withdrawal' | 'deposit';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  cryptoAmount: number;
  cryptoCurrency: string;
  customer: {
    name: string;
    email: string;
  };
  timestamp: string;
  txHash?: string;
  gasUsed?: string;
  networkFee?: number;
}

export interface Balance {
  currency: string;
  amount: number;
  usdValue: number;
  change24h: number;
  symbol: string;
  chain?: 'base' | 'baseSepolia' | 'sei' | 'scroll' | 'scrollTestnet' | string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  totalTransactions: number;
  lastSeen: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  image?: string;
}

export interface PaymentLink {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  url: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  totalPaid: number;
  clickCount: number;
}

export interface RadarAlert {
  id: string;
  type: 'fraud' | 'security' | 'compliance' | 'risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  isResolved: boolean;
  relatedTransaction?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalTransactions: number;
  activeCustomers: number;
  conversionRate: number;
  revenueChange: number;
  transactionChange: number;
  customerChange: number;
  conversionChange: number;
}

export interface ChartData {
  date: string;
  revenue: number;
  transactions: number;
  customers: number;
}

export interface Strategy {
  id: string;
  name: string;
  type: 'limit_order' | 'dca';
  status: 'active' | 'paused' | 'completed';
  token: string;
  conditions: StrategyCondition[];
  createdAt: string;
  totalInvested: number;
  totalTokens: number;
}

export interface StrategyCondition {
  id: string;
  type: 'percentage' | 'amount' | 'time';
  value: number;
  unit: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'between';
  maxValue?: number;
}

export type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  comingSoon?: boolean;
  demo?: boolean;
};