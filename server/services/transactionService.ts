import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Transaction recording service
 * Records all transactions (pending, completed, failed, cancelled) to the database
 */

interface TransactionData {
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
  wallet_address?: string;
  block_reason?: string;
  risk_score?: number;
  session_id?: string;
}

/**
 * Main function to record a transaction
 */
export async function recordTransaction(data: TransactionData): Promise<{ success: boolean; transaction_id?: string; error?: string }> {
  try {
    console.log(`📝 Recording transaction: ${data.type} - ${data.status} - ${data.amount} ${data.currency}`);
    console.log(`📝 Transaction data:`, JSON.stringify(data, null, 2));

    const transaction = {
      owner_id: data.owner_id,
      payment_link_id: data.payment_link_id || null,
      type: data.type,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      crypto_amount: data.crypto_amount || null,
      crypto_currency: data.crypto_currency || null,
      customer_id: data.customer_id || null,
      tx_hash: data.tx_hash || null,
      network_fee: data.network_fee || null,
    };

    console.log(`📝 Inserting transaction:`, JSON.stringify(transaction, null, 2));

    const { data: result, error } = await supabaseAdmin
      .from('transactions')
      .insert([transaction])
      .select('id')
      .single();

    if (error) {
      console.error('❌ Failed to record transaction:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error details:', error.details);
      console.error('❌ Error hint:', error.hint);
      return { success: false, error: error.message };
    }

    console.log(`✅ Transaction recorded: ${result.id}`);
    return { success: true, transaction_id: result.id };

  } catch (error: any) {
    console.error('❌ Transaction recording error:', error);
    console.error('❌ Error stack:', error.stack);
    return { success: false, error: error.message };
  }
}

/**
 * Record a successful payment transaction
 */
export async function recordSuccessfulPayment(params: {
  owner_id: string;
  payment_link_id?: string;
  amount: number;
  currency: string;
  crypto_amount?: number;
  crypto_currency?: string;
  tx_hash?: string;
  network_fee?: number;
  wallet_address?: string;
  session_id?: string;
}) {
  return recordTransaction({
    ...params,
    type: 'payment',
    status: 'completed',
  });
}

/**
 * Record a failed payment transaction
 */
export async function recordFailedPayment(params: {
  owner_id: string;
  payment_link_id?: string;
  amount: number;
  currency: string;
  crypto_amount?: number;
  crypto_currency?: string;
  wallet_address?: string;
  block_reason?: string;
  session_id?: string;
}) {
  return recordTransaction({
    ...params,
    type: 'payment',
    status: 'failed',
  });
}

/**
 * Record a blocked payment transaction (high-risk wallet)
 */
export async function recordBlockedPayment(params: {
  owner_id: string;
  payment_link_id?: string;
  amount: number;
  currency: string;
  crypto_amount?: number;
  crypto_currency?: string;
  wallet_address: string;
  block_reason: string;
  risk_score?: number;
}) {
  console.log(`🚫 Recording blocked payment: ${params.wallet_address} - ${params.block_reason}`);

  return recordTransaction({
    ...params,
    type: 'payment',
    status: 'failed', // Use 'failed' status for blocked transactions
  });
}

/**
 * Helper to extract payment amount from x-payment header
 */
export function extractPaymentAmount(xPayment: string): { amount?: number; currency?: string } {
  try {
    const decoded = Buffer.from(xPayment, 'base64').toString('utf-8');
    const paymentData = JSON.parse(decoded);

    // Extract amount from payment data
    const amount = paymentData?.payload?.amount || paymentData?.amount;
    const currency = paymentData?.payload?.currency || paymentData?.currency || 'USD';

    return { amount, currency };
  } catch (error) {
    console.error('❌ Failed to extract payment amount:', error);
    return {};
  }
}

/**
 * Extract payment_link hash from referrer or request URL
 */
export function extractPaymentLinkFromContext(c: any): string | null {
  try {
    console.log('🔍 Attempting to extract payment_link from context...');

    // First, try to get from custom header (most reliable)
    const paymentLinkHeader = c.req.header('x-payment-link') || c.req.header('X-Payment-Link');
    if (paymentLinkHeader) {
      console.log(`✅ Extracted payment_link from header: ${paymentLinkHeader}`);
      return paymentLinkHeader;
    }

    // Try to get from referrer header
    const referrer = c.req.header('referer') || c.req.header('referrer');
    console.log('🔍 Referrer:', referrer);

    if (referrer) {
      // Extract payment link from URL like: http://localhost:5174/pay/pay_32e8bbf161ee9e82
      const match = referrer.match(/\/pay\/([a-z0-9_]+)/i);
      console.log('🔍 Referrer match:', match);
      if (match && match[1]) {
        console.log(`✅ Extracted payment_link from referrer: ${match[1]}`);
        return match[1];
      }
    }

    // Try to get from request path
    const path = c.req.path;
    console.log('🔍 Request path:', path);
    const pathMatch = path.match(/\/pay\/([a-z0-9_]+)/i);
    console.log('🔍 Path match:', pathMatch);
    if (pathMatch && pathMatch[1]) {
      console.log(`✅ Extracted payment_link from path: ${pathMatch[1]}`);
      return pathMatch[1];
    }

    console.log('⚠️ No payment_link found in header, referrer, or path');
    return null;
  } catch (error) {
    console.error('❌ Failed to extract payment_link:', error);
    return null;
  }
}

/**
 * Get payment_link_id from payment_link hash
 * @param payment_link - The payment link hash (e.g., "pay_32e8bbf161ee9e82")
 * @returns The payment_link UUID from database
 */
export async function getPaymentLinkId(payment_link: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('payment_links')
      .select('id, owner_id')
      .eq('payment_link', payment_link)
      .single();

    if (error || !data) {
      console.error('❌ Failed to get payment_link_id:', error);
      return null;
    }

    console.log(`📝 Found payment_link_id: ${data.id} for hash: ${payment_link}`);
    return data.id;
  } catch (error) {
    console.error('❌ Error getting payment_link_id:', error);
    return null;
  }
}

/**
 * Get payment_link data (id and owner_id) from payment_link hash
 */
export async function getPaymentLinkData(payment_link: string): Promise<{ id: string; owner_id: string } | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('payment_links')
      .select('id, owner_id')
      .eq('payment_link', payment_link)
      .single();

    if (error || !data) {
      console.error('❌ Failed to get payment_link data:', error);
      return null;
    }

    console.log(`📝 Found payment_link - id: ${data.id}, owner_id: ${data.owner_id}`);
    return { id: data.id, owner_id: data.owner_id };
  } catch (error) {
    console.error('❌ Error getting payment_link data:', error);
    return null;
  }
}

/**
 * Helper to get owner_id from payment_link_id
 */
export async function getOwnerIdFromPaymentLink(payment_link_id: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('payment_links')
      .select('owner_id')
      .eq('id', payment_link_id)
      .single();

    if (error || !data) {
      console.error('❌ Failed to get owner_id from payment_link:', error);
      return null;
    }

    return data.owner_id;
  } catch (error) {
    console.error('❌ Error getting owner_id:', error);
    return null;
  }
}

/**
 * Get a valid system owner_id (first user in profiles table)
 * For transactions without a specific owner (like blocked payments)
 */
export async function getSystemOwnerId(): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .limit(1)
      .single();

    if (error || !data) {
      console.error('❌ No profiles found in database. Cannot record transaction without valid owner_id');
      return null;
    }

    console.log(`📝 Using system owner_id: ${data.user_id}`);
    return data.user_id;
  } catch (error) {
    console.error('❌ Error getting system owner_id:', error);
    return null;
  }
}
