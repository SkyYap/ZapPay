import { config } from "dotenv";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { paymentMiddleware, Network, Resource } from "x402-hono";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

config();

// Configuration from environment variables
const facilitatorUrl = process.env.FACILITATOR_URL as Resource || "https://x402.org/facilitator";
const payTo = process.env.ADDRESS as `0x${string}`;
const network = (process.env.NETWORK as Network) || "scroll";
const port = parseInt(process.env.PORT || "3001");

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error("❌ Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in the .env file");
  process.exit(1);
}

// Initialize Supabase clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

if (!payTo) {
  console.error("❌ Please set your wallet ADDRESS in the .env file");
  process.exit(1);
}

const app = new Hono();

// Enable CORS for frontend
app.use("/*", cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With", 
    "access-control-expose-headers", 
    "x-402-payment", 
    "x-402-session", 
    "x-payment",
    "x-402-token",
    "x-402-signature",
    "x-402-nonce",
    "x-402-timestamp",
    "x-402-address",
    "x-402-chain-id",
    "x-402-network",
    "x-402-amount",
    "x-402-currency",
    "x-402-facilitator",
    "x-402-version"
  ],
}));

// Basic logging middleware
app.use("*", async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  
  await next();
  
  const end = Date.now();
  const duration = end - start;
  console.log(`${method} ${url} - ${c.res.status} (${duration}ms)`);
});

// Helper function to get user ID from JWT token
async function getUserIdFromToken(c: any): Promise<string | null> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }
    return user.id;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Simple in-memory storage for sessions (use Redis/DB in production)
interface Session {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  type: "24hour" | "onetime";
  used?: boolean;
}

const sessions = new Map<string, Session>();

// Apply CORS to payment endpoints BEFORE x402 middleware
app.use("/api/pay/*", async (c, next) => {
  const origin = c.req.header('Origin');
  const allowedOrigins = ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"];
  
  // Debug: Log all request headers
  console.log('🔍 Payment endpoint request headers:', Object.fromEntries(c.req.raw.headers.entries()));
  
  // Set CORS headers
  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
  }
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, access-control-expose-headers, x-402-payment, x-402-session, x-payment, x-402-token, x-402-signature, x-402-nonce, x-402-timestamp, x-402-address, x-402-chain-id, x-402-network, x-402-amount, x-402-currency, x-402-facilitator, x-402-version');
  c.header('Access-Control-Expose-Headers', 'X-PAYMENT-RESPONSE');
  
  if (c.req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    return c.text('', 200);
  }
  
  await next();
  
  // Ensure CORS headers are preserved after x402 middleware
  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
  }
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, access-control-expose-headers, x-402-payment, x-402-session, x-payment, x-402-token, x-402-signature, x-402-nonce, x-402-timestamp, x-402-address, x-402-chain-id, x-402-network, x-402-amount, x-402-currency, x-402-facilitator, x-402-version');
  c.header('Access-Control-Expose-Headers', 'X-PAYMENT-RESPONSE');
});

// Configure x402 payment middleware with two payment options
app.use(
  paymentMiddleware(
    payTo,
    {
      // 24-hour session access
      "/api/pay/session": {
        price: "$1.00",
        network,
      },
      // One-time access/payment
      "/api/pay/onetime": {
        price: "$0.10",
        network,
      },
    },
    {
      url: facilitatorUrl,
    },
  ),
);

// Apply CORS to all other routes
app.use("/*", cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With", 
    "access-control-expose-headers", 
    "x-402-payment", 
    "x-402-session", 
    "x-payment",
    "x-402-token",
    "x-402-signature",
    "x-402-nonce",
    "x-402-timestamp",
    "x-402-address",
    "x-402-chain-id",
    "x-402-network",
    "x-402-amount",
    "x-402-currency",
    "x-402-facilitator",
    "x-402-version"
  ],
}));

// Add a global response interceptor to ensure CORS headers are always present
app.use("/*", async (c, next) => {
  await next();
  
  // Ensure CORS headers are present on all responses
  const origin = c.req.header('Origin');
  const allowedOrigins = ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"];
  
  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
  }
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, access-control-expose-headers, x-402-payment, x-402-session, x-payment, x-402-token, x-402-signature, x-402-nonce, x-402-timestamp, x-402-address, x-402-chain-id, x-402-network, x-402-amount, x-402-currency, x-402-facilitator, x-402-version');
  c.header('Access-Control-Expose-Headers', 'X-PAYMENT-RESPONSE');
});

// Free endpoint - health check
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    message: "Server is running",
    config: {
      network,
      payTo,
      facilitator: facilitatorUrl,
    },
  });
});

// Free endpoint - get payment options
app.get("/api/payment-options", (c) => {
  return c.json({
    options: [
      {
        name: "24-Hour Access",
        endpoint: "/api/pay/session",
        price: "$1.00",
        description: "Get a session ID for 24 hours of unlimited access",
      },
      {
        name: "One-Time Access",
        endpoint: "/api/pay/onetime",
        price: "$0.10",
        description: "Single use payment for immediate access",
      },
    ],
  });
});

// Paid endpoint - 24-hour session access ($1.00)
app.post("/api/pay/session", (c) => {
  const sessionId = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
  
  const session: Session = {
    id: sessionId,
    createdAt: now,
    expiresAt,
    type: "24hour",
  };

  sessions.set(sessionId, session);

  return c.json({
    success: true,
    sessionId,
    message: "24-hour access granted!",
    session: {
      id: sessionId,
      type: "24hour",
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      validFor: "24 hours",
    },
  });
});

// Paid endpoint - one-time access/payment ($0.10)
app.post("/api/pay/onetime", async (c) => {
  const sessionId = uuidv4();
  const now = new Date();
  
  const session: Session = {
    id: sessionId,
    createdAt: now,
    expiresAt: new Date(now.getTime() + 5 * 60 * 1000), // 5 minutes to use
    type: "onetime",
    used: false,
  };

  sessions.set(sessionId, session);

  return c.json({
    success: true,
    sessionId,
    message: "One-time access granted!",
    access: {
      id: sessionId,
      type: "onetime",
      createdAt: now.toISOString(),
      validFor: "5 minutes (single use)",
    },
  });
});

// Free endpoint - validate session
app.get("/api/session/:sessionId", (c) => {
  const sessionId = c.req.param("sessionId");
  const session = sessions.get(sessionId);

  if (!session) {
    return c.json({ valid: false, error: "Session not found" }, 404);
  }

  const now = new Date();
  const isExpired = now > session.expiresAt;
  const isUsed = session.type === "onetime" && session.used;

  if (isExpired || isUsed) {
    return c.json({ 
      valid: false, 
      error: isExpired ? "Session expired" : "One-time access already used",
      session: {
        id: session.id,
        type: session.type,
        createdAt: session.createdAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
        used: session.used,
      }
    });
  }

  // Mark one-time sessions as used
  if (session.type === "onetime") {
    session.used = true;
    sessions.set(sessionId, session);
  }

  return c.json({
    valid: true,
    session: {
      id: session.id,
      type: session.type,
      createdAt: session.createdAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      remainingTime: session.expiresAt.getTime() - now.getTime(),
    },
  });
});

// Free endpoint - list active sessions (for demo purposes)
app.get("/api/sessions", (c) => {
  const activeSessions = Array.from(sessions.values())
    .filter(session => {
      const isExpired = new Date() > session.expiresAt;
      const isUsed = session.type === "onetime" && session.used;
      return !isExpired && !isUsed;
    })
    .map(session => ({
      id: session.id,
      type: session.type,
      createdAt: session.createdAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
    }));

  return c.json({ sessions: activeSessions });
});

// Product interface
interface Product {
  id: string; // UUID generated by Supabase
  name: string;
  pricing: number;
  created_at: string;
  updated_at: string;
}

// GET all products
app.get("/api/products", async (c) => {
  try {
    // Get user ID from JWT token
    const userId = await getUserIdFromToken(c);
    if (!userId) {
      return c.json({ 
        success: false, 
        error: "Authentication required" 
      }, 401);
    }

    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return c.json({ 
        success: false, 
        error: "Failed to fetch products" 
      }, 500);
    }

    return c.json({ 
      success: true,
      products: products || [] 
    });
  } catch (error) {
    console.error('Server error:', error);
    return c.json({ 
      success: false, 
      error: "Internal server error" 
    }, 500);
  }
});

// POST to add a product
app.post("/api/product", async (c) => {
  try {
    // Get user ID from JWT token
    const userId = await getUserIdFromToken(c);
    if (!userId) {
      return c.json({
        success: false,
        error: "Authentication required"
      }, 401);
    }

    const body = await c.req.json();
    const { name, pricing } = body;

    if (!name || typeof pricing !== 'number') {
      return c.json({ 
        success: false, 
        error: "Missing required fields: name (string) and pricing (number)" 
      }, 400);
    }

    // Extra safety check before database insert
    if (!userId) {
      console.error('❌ CRITICAL: userId is null at insert time');
      return c.json({
        success: false,
        error: "Authentication required"
      }, 401);
    }

    const now = new Date().toISOString();
    const newProduct = {
      owner_id: userId,
      name,
      pricing,
      created_at: now,
      updated_at: now,
    };

    const { error } = await supabaseAdmin
      .from('products')
      .insert([newProduct]);

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === '23505') { // Unique constraint violation
        return c.json({
          success: false,
          error: "Product with this ID already exists"
        }, 409);
      }
      return c.json({
        success: false,
        error: "Failed to create product"
      }, 500);
    }

    // Product created successfully - return the data we sent
    // (ID is auto-generated by Supabase, but we don't need it in the response)
    return c.json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    }, 201);
  } catch (error) {
    console.error('Server error:', error);
    return c.json({ 
      success: false, 
      error: "Invalid JSON in request body" 
    }, 400);
  }
});

// Payment Link interface
interface PaymentLink {
  id: string; // UUID generated by Supabase
  link_name: string;
  payment_link: string; // Unique hash generated from product_id and id
  product_id: string;
  product_name: string; // Flattened from products.name
  pricing: number;
  expiry_date: string;
  created_at: string;
  updated_at: string;
  products: {
    name: string;
  };
}

// GET all payment links
app.get("/api/payment-links", async (c) => {
  try {
    // Get user ID from JWT token
    const userId = await getUserIdFromToken(c);
    if (!userId) {
      return c.json({ 
        success: false, 
        error: "Authentication required" 
      }, 401);
    }

    const { data: paymentLinks, error } = await supabaseAdmin
      .from('payment_links')
      .select(`
        *,
        products!inner(name)
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return c.json({ 
        success: false, 
        error: "Failed to fetch payment links" 
      }, 500);
    }

    // Transform the response to flatten product name
    const transformedPaymentLinks = (paymentLinks || []).map(link => ({
      ...link,
      product_name: link.products.name
    }));

    return c.json({ 
      success: true,
      payment_links: transformedPaymentLinks 
    });
  } catch (error) {
    console.error('Server error:', error);
    return c.json({ 
      success: false, 
      error: "Internal server error" 
    }, 500);
  }
});

// POST to add a payment link
app.post("/api/payment-link", async (c) => {
  try {
    // Get user ID from JWT token
    const userId = await getUserIdFromToken(c);
    if (!userId) {
      return c.json({ 
        success: false, 
        error: "Authentication required" 
      }, 401);
    }

    const body = await c.req.json();
    const { link_name, product_name, expiry_date } = body;

    if (!link_name || !product_name || !expiry_date) {
      return c.json({ 
        success: false, 
        error: "Missing required fields: link_name (string), product_name (string), and expiry_date (ISO string)" 
      }, 400);
    }

    // Validate expiry_date format
    const expiryDate = new Date(expiry_date);
    if (isNaN(expiryDate.getTime())) {
      return c.json({ 
        success: false, 
        error: "Invalid expiry_date format. Use ISO date string (e.g., '2024-12-31T23:59:59.000Z')" 
      }, 400);
    }

    // Check if expiry_date is in the future
    if (expiryDate <= new Date()) {
      return c.json({ 
        success: false, 
        error: "expiry_date must be in the future" 
      }, 400);
    }

    // First, get the product details by name and owner
    const { data: products, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, name, pricing')
      .eq('name', product_name)
      .eq('owner_id', userId)
      .limit(1);

    if (productError || !products || products.length === 0) {
      return c.json({
        success: false,
        error: `Product with name '${product_name}' not found`
      }, 404);
    }

    const product = products[0];

    const now = new Date().toISOString();

    // Generate a unique payment link hash using product_id, timestamp, and random value
    const hashInput = product.id + Date.now().toString() + Math.random().toString();
    const hash = createHash('md5').update(hashInput).digest('hex');
    const paymentLinkHash = 'pay_' + hash.substring(0, 16);

    // Insert the payment link with the final hash
    const paymentLink = {
      owner_id: userId,
      link_name,
      payment_link: paymentLinkHash,
      product_id: product.id,
      pricing: product.pricing,
      expiry_date: expiryDate.toISOString(),
      created_at: now,
      updated_at: now,
    };

    const { error: insertError } = await supabaseAdmin
      .from('payment_links')
      .insert([paymentLink]);

    if (insertError) {
      console.error('Supabase error:', insertError);
      return c.json({
        success: false,
        error: "Failed to create payment link"
      }, 500);
    }

    return c.json({
      success: true,
      message: "Payment link created successfully",
      payment_link: paymentLink,
    }, 201);
  } catch (error) {
    console.error('Server error:', error);
    return c.json({ 
      success: false, 
      error: "Invalid JSON in request body" 
    }, 400);
  }
});

// GET payment link details by payment_link hash
app.get("/api/payment-link/:paymentLink", async (c) => {
  try {
    const paymentLink = c.req.param("paymentLink");
    
    const { data: paymentLinkData, error } = await supabaseAdmin
      .from('payment_links')
      .select('*')
      .eq('payment_link', paymentLink)
      .single();

    if (error || !paymentLinkData) {
      return c.json({ 
        success: false, 
        error: "Payment link not found" 
      }, 404);
    }

    // Check if payment link has expired
    const now = new Date();
    const expiryDate = new Date(paymentLinkData.expiry_date);
    
    if (now > expiryDate) {
      return c.json({ 
        success: false, 
        error: "Payment link has expired" 
      }, 410);
    }

    return c.json({
      success: true,
      payment_link: paymentLinkData
    });
  } catch (error) {
    console.error('Server error:', error);
    return c.json({ 
      success: false, 
      error: "Internal server error" 
    }, 500);
  }
});

console.log(`
🚀 x402 Payment Template Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Accepting payments to: ${payTo}
🔗 Network: ${network}
🌐 Port: ${port}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Payment Options:
   - 24-Hour Session: $1.00
   - One-Time Access: $0.10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️  This is a template! Customize it for your app.
📚 Learn more: https://x402.org
💬 Get help: https://discord.gg/invite/cdp
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

serve({
  fetch: app.fetch,
  port,
}); 