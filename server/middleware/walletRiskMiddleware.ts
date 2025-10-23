import type { Context, Next } from 'hono';
import { checkWalletRisk } from '../services/riskService';

/**
 * Helper function to extract wallet address from x-payment header
 */
function extractWalletFromPayment(xPayment: string): string | undefined {
  try {
    // Decode base64
    const decoded = Buffer.from(xPayment, 'base64').toString('utf-8');
    const paymentData = JSON.parse(decoded);

    // Extract wallet address from authorization.from field
    const walletAddress = paymentData?.payload?.authorization?.from;

    if (walletAddress) {
      console.log(`📦 Extracted wallet from x-payment: ${walletAddress}`);
      return walletAddress;
    }
  } catch (error) {
    console.error('❌ Failed to parse x-payment header:', error);
  }
  return undefined;
}

/**
 * Middleware to check wallet risk before allowing payment processing
 * Extracts wallet address from x402 headers and checks risk score
 * Blocks high-risk wallets (score >= 75 by default)
 */
export async function walletRiskMiddleware(c: Context, next: Next) {
  // Extract wallet address from x402 headers
  // The x402 protocol includes the wallet address in the payment headers
  let walletAddress =
    c.req.header('x-402-address') ||
    c.req.header('x-402-from') ||
    c.req.header('x-address');

  // If not found in standard headers, try to extract from x-payment header
  if (!walletAddress) {
    const xPayment = c.req.header('x-payment');
    if (xPayment) {
      walletAddress = extractWalletFromPayment(xPayment);
    }
  }

  // If no wallet address found, let the request through
  // (it will be handled by x402 middleware or return 402)
  if (!walletAddress) {
    console.log('⚠️ No wallet address in request headers - skipping risk check');
    return next();
  }

  console.log(`🔍 Risk check middleware triggered for wallet: ${walletAddress}`);

  try {
    // Check wallet risk
    const riskCheck = await checkWalletRisk(walletAddress);

    // If not allowed, block the request
    if (!riskCheck.allowed) {
      console.log(`🚫 Blocking wallet ${walletAddress}: ${riskCheck.blockReason}`);

      return c.json(
        {
          error: 'Payment Blocked',
          reason: 'High-risk wallet detected',
          details: riskCheck.blockReason,
          riskScore: riskCheck.riskAnalysis?.riskScore,
          riskLevel: riskCheck.riskAnalysis?.riskLevel,
          recommendations: riskCheck.riskAnalysis?.recommendations,
          message: 'This wallet has been flagged for high risk activity. Please contact support if you believe this is an error.',
        },
        403 // Forbidden
      );
    }

    // Wallet is allowed - log and continue
    if (riskCheck.riskAnalysis) {
      console.log(`✅ Wallet ${walletAddress} allowed: Risk Score ${riskCheck.riskAnalysis.riskScore}/100 (${riskCheck.riskAnalysis.riskLevel})`);

      // Attach risk analysis to context for logging/auditing
      c.set('riskAnalysis', riskCheck.riskAnalysis);
    } else if (riskCheck.error) {
      console.log(`⚠️ Risk check failed for ${walletAddress}, allowing by default: ${riskCheck.error}`);
    }

    return next();

  } catch (error: any) {
    // If risk check fails, log error but allow request (fail open)
    console.error(`❌ Risk middleware error for ${walletAddress}:`, error.message);
    console.log('⚠️ Allowing request due to risk check failure (fail open)');
    return next();
  }
}

/**
 * Enhanced version that also checks request body for wallet address
 * Useful for POST requests where wallet might be in body instead of headers
 */
export async function walletRiskMiddlewareEnhanced(c: Context, next: Next) {
  let walletAddress =
    c.req.header('x-402-address') ||
    c.req.header('x-402-from') ||
    c.req.header('x-address');

  // If not in standard headers, try to extract from x-payment header
  if (!walletAddress) {
    const xPayment = c.req.header('x-payment');
    if (xPayment) {
      walletAddress = extractWalletFromPayment(xPayment);
    }
  }

  // If still not found, try to get from request body
  if (!walletAddress) {
    try {
      const body = await c.req.json();
      walletAddress = body.walletAddress || body.address || body.from;

      // Important: Re-set the body for downstream handlers
      // Note: This is a workaround as Hono doesn't easily allow re-reading body
      if (walletAddress) {
        console.log(`📝 Found wallet address in request body: ${walletAddress}`);
      }
    } catch (e) {
      // Body is not JSON or already consumed
    }
  }

  if (!walletAddress) {
    console.log('⚠️ No wallet address found in headers or body - skipping risk check');
    return next();
  }

  console.log(`🔍 Enhanced risk check for wallet: ${walletAddress}`);

  try {
    const riskCheck = await checkWalletRisk(walletAddress);

    if (!riskCheck.allowed) {
      console.log(`🚫 Blocking high-risk wallet ${walletAddress}`);

      return c.json(
        {
          error: 'Payment Blocked',
          reason: 'High-risk wallet detected',
          details: riskCheck.blockReason,
          walletAddress,
          riskScore: riskCheck.riskAnalysis?.riskScore,
          riskLevel: riskCheck.riskAnalysis?.riskLevel,
          recommendations: riskCheck.riskAnalysis?.recommendations?.slice(0, 3), // First 3 recommendations
          support: 'Please contact support@zappay.com if you believe this is an error',
          timestamp: new Date().toISOString()
        },
        403
      );
    }

    if (riskCheck.riskAnalysis) {
      console.log(`✅ Wallet allowed: ${riskCheck.riskAnalysis.riskScore}/100 (${riskCheck.riskAnalysis.riskLevel})`);
      c.set('riskAnalysis', riskCheck.riskAnalysis);
      c.set('walletAddress', walletAddress);
    }

    return next();

  } catch (error: any) {
    console.error(`❌ Enhanced risk middleware error:`, error.message);
    return next();
  }
}

/**
 * Middleware factory that allows custom risk threshold
 * @param threshold - Custom risk threshold (0-100)
 * @returns Middleware function
 */
export function createWalletRiskMiddleware(threshold: number) {
  return async (c: Context, next: Next) => {
    let walletAddress =
      c.req.header('x-402-address') ||
      c.req.header('x-402-from') ||
      c.req.header('x-address');

    // If not in standard headers, try to extract from x-payment header
    if (!walletAddress) {
      const xPayment = c.req.header('x-payment');
      if (xPayment) {
        walletAddress = extractWalletFromPayment(xPayment);
      }
    }

    if (!walletAddress) {
      return next();
    }

    try {
      const riskCheck = await checkWalletRisk(walletAddress);

      // Use custom threshold
      if (riskCheck.riskAnalysis && riskCheck.riskAnalysis.riskScore >= threshold) {
        console.log(`🚫 Blocking wallet (custom threshold ${threshold}): ${walletAddress}`);

        return c.json(
          {
            error: 'Payment Blocked',
            reason: `Risk score ${riskCheck.riskAnalysis.riskScore} exceeds threshold ${threshold}`,
            details: riskCheck.blockReason,
            riskScore: riskCheck.riskAnalysis.riskScore,
            riskLevel: riskCheck.riskAnalysis.riskLevel
          },
          403
        );
      }

      if (riskCheck.riskAnalysis) {
        c.set('riskAnalysis', riskCheck.riskAnalysis);
      }

      return next();

    } catch (error: any) {
      console.error(`❌ Custom risk middleware error:`, error.message);
      return next();
    }
  };
}
