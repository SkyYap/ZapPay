# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Server
- `npm run dev` - Start development server with hot reload (uses tsx watch)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled production server from dist/

## Architecture Overview

### Core Dependencies
- **Hono**: Lightweight web framework (similar to Express, but faster)
- **x402-hono**: Custom middleware from local monorepo (`file:../x402-packages/packages/x402-hono`)
- **Supabase**: Database and authentication
- **@hono/node-server**: Node.js adapter for Hono

### Main Entry Point
All server logic is in `index.ts` (single-file architecture). Key sections:
1. Environment configuration (lines 12-30)
2. CORS setup for frontend origins (lines 40-208)
3. x402 payment middleware configuration (lines 144-164)
4. API endpoints (lines 210+)

## x402 Protocol Integration

### Payment Middleware
The server uses `paymentMiddleware` from `x402-hono` to protect paid endpoints:
- Configured at lines 145-164 in index.ts
- Two pricing tiers defined:
  - `/api/pay/session` - $1.00 for 24-hour access
  - `/api/pay/onetime` - $0.10 for single use

### Payment Flow
1. Client makes request to paid endpoint with x402 payment headers
2. Middleware validates payment via facilitator
3. On success, endpoint generates session ID
4. Session stored in-memory (Map) with expiration

**Production Note**: Sessions use in-memory Map (line 108). For production, migrate to Redis or database.

## API Endpoints Structure

### Free Endpoints
- `GET /api/health` - Server status and configuration
- `GET /api/payment-options` - Available payment tiers
- `GET /api/session/:sessionId` - Validate session (also marks one-time as used)
- `GET /api/sessions` - List active sessions
- `GET /api/products` - Get user's products (requires JWT auth)
- `GET /api/payment-links` - Get user's payment links (requires JWT auth)
- `GET /api/payment-link/:paymentLink` - Get payment link by hash

### Paid Endpoints (x402 Protected)
- `POST /api/pay/session` - Purchase 24-hour access
- `POST /api/pay/onetime` - Purchase one-time access

### Authenticated Endpoints (JWT Required)
- `POST /api/product` - Create product
- `POST /api/payment-link` - Create payment link

## Authentication Pattern

JWT authentication helper at lines 79-97:
```typescript
getUserIdFromToken(c) // Returns user ID from Bearer token
```

Used in products and payment links endpoints. Validates token via Supabase auth.

## Database Schema (Supabase)

### Products Table
- `id` (UUID, auto-generated)
- `owner_id` (UUID, foreign key to auth.users)
- `name` (string)
- `pricing` (number)
- `created_at`, `updated_at` (timestamps)

### Payment Links Table
- `id` (UUID, auto-generated)
- `owner_id` (UUID, foreign key to auth.users)
- `link_name` (string)
- `payment_link` (string, MD5 hash with 'pay_' prefix)
- `product_id` (UUID, foreign key to products)
- `pricing` (number, denormalized from product)
- `expiry_date` (ISO timestamp)
- `created_at`, `updated_at` (timestamps)

**Payment Link Generation**: Two-step process (lines 596-646):
1. Insert with temporary hash
2. Update with final hash derived from product_id + link_id

## CORS Configuration

Critical for frontend integration. Allowed origins (lines 113-114):
- `http://localhost:5173` (landing page)
- `http://localhost:3000` (alternate)
- `http://localhost:5174` (merchant frontend)

x402 headers explicitly exposed (lines 44-63, 124, 140-141).

## Environment Variables

Required variables (see `.env.example`):
```
FACILITATOR_URL - x402 facilitator endpoint (default: https://x402.org/facilitator)
NETWORK - Blockchain network (e.g., base-sepolia, scroll)
ADDRESS - Merchant wallet address (0x...)
PORT - Server port (default: 3001)
SUPABASE_URL - Supabase project URL
SUPABASE_ANON_KEY - Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (for admin operations)
```

Server exits if ADDRESS or Supabase credentials missing (lines 23-35).

## Type Safety

TypeScript with strict mode enabled (tsconfig.json):
- Target: ES2022
- Module: ESNext with bundler resolution
- All strict checks enabled

Key interfaces defined in index.ts:
- `Session` (lines 100-106)
- `Product` (lines 363-370)
- `PaymentLink` (lines 477-490)

## Session Management

Session types (line 104):
- `"24hour"` - Valid for 24 hours, unlimited uses
- `"onetime"` - Valid for 5 minutes, single use (marked used on validation)

Expiration and usage checked in `/api/session/:sessionId` endpoint (lines 309-325).
