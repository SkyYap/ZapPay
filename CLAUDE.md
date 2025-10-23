# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Root Level Development
```bash
npm run dev              # Start all services (server + client) concurrently
npm run install:all      # Install dependencies for all packages
```

### Individual Service Commands

**Server** (`/server`):
```bash
npm run dev              # Start with tsx watch on port 3001
npm run build            # Compile TypeScript
npm start                # Run compiled build
```

**Client** (`/client`):
```bash
npm run dev              # Start Vite dev server
npm run build            # TypeScript compile + Vite build
npm run preview          # Preview production build
```

**Merchant Frontend** (`/merchant-frontend`):
```bash
npm run dev              # Start Vite dev server on http://localhost:5174
npm run build            # TypeScript compile + Vite build
npm run lint             # Run ESLint
npm run preview          # Preview production build
```

**Landing Page** (`/landing-page`):
```bash
npm run dev              # Start Vite dev server on http://localhost:5173
npm run build            # Vite build for production
npm run lint             # Run ESLint
npm run preview          # Preview production build
```

**Analysis Engine** (`/analysis-engine`):
```bash
npm run dev              # Start with nodemon + ts-node on port 3002
npm run build            # Compile TypeScript
npm start                # Run compiled build
npm run type-check       # TypeScript type checking without emit
```

**x402 Packages** (`/x402-packages`):
```bash
pnpm build               # Build all packages in monorepo with Turbo
pnpm lint                # Lint all packages
pnpm format              # Format all packages
pnpm lint:check          # Check lint without fixing
pnpm format:check        # Check formatting without fixing
pnpm test                # Run tests across all packages
```

### Environment Setup

Copy `env.example` to `.env` in root directory:
```env
ADDRESS=0x...                        # Your wallet address for receiving payments
NETWORK=base-sepolia                 # Network (base-sepolia, scroll, etc.)
FACILITATOR_URL=https://x402.org/facilitator
PORT=3001

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

For merchant-frontend, create `.env` in `/merchant-frontend/`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3001
```

## Architecture Overview

### Project Structure

ZapPay is a cryptocurrency payment gateway built on the x402 protocol, extended to create a Stripe-like experience for merchants accepting crypto payments with 0% transaction fees.

**Core Services:**
- **server/** - Hono-based backend API with x402 payment middleware
- **client/** - Browser wallet integration demo (original x402 example)
- **merchant-frontend/** - React merchant dashboard (shadcn/ui, Supabase auth)
- **landing-page/** - Marketing website
- **analysis-engine/** - Risk analysis and fraud detection service
- **x402-packages/** - Turbo monorepo with x402 protocol packages

### x402 Protocol Integration

The x402 protocol enables HTTP 402 payment-gated API endpoints. When a client requests a paid resource without a valid session:

1. **Server returns 402** with payment details in response headers:
   - `x-402-payment` - Payment challenge information
   - `x-402-facilitator` - Facilitator service URL
   - Amount, currency, network details

2. **Client intercepts 402** using x402-axios interceptor:
   - Prompts wallet signature via viem
   - Submits payment to facilitator
   - Retries request with session token

3. **Server validates** session via `paymentMiddleware` from x402-hono

**Local x402 Packages:**
- Located in `x402-packages/packages/`
- Managed with pnpm workspaces and Turbo
- Includes: `x402-axios`, `x402-hono`, `x402-express`, `x402-fetch`, `x402-next`, `coinbase-x402`, `x402` (core)
- Linked locally via `file:` protocol in package.json

### Server Architecture (`/server`)

**Stack:** Hono + TypeScript + Supabase + x402-hono

**Key Files:**
- `index.ts` - Main server with CORS, logging, route definitions

**Payment Middleware:**
Applied via `paymentMiddleware` from x402-hono to protect endpoints:
```typescript
app.use(
  "/api/protected/*",
  paymentMiddleware({
    facilitator: facilitatorUrl,
    payTo,
    network,
    amount: "100000000000000", // wei or smallest unit
  })
);
```

**Authentication:**
- JWT tokens from Supabase auth extracted via `Authorization: Bearer <token>` header
- `getUserIdFromToken()` helper validates tokens and returns user ID
- User ID used as `owner_id` for multi-tenant data isolation

**Session Management:**
- In-memory storage (replace with Redis/DB for production)
- Sessions track payment status and associate with user_id
- Session IDs returned to clients for checking payment status

**Database:**
Uses Supabase Postgres with schema defined in `server/supabase/supabase-migration.sql`:
- **profiles** - Merchant profiles, auto-generated API keys
- **products** - Product catalog
- **customers** - Customer records
- **payment_links** - Dynamic payment links tied to products
- **balances** - Multi-chain token balances per merchant
- **transactions** - Payment history

All tables use Row Level Security (RLS) policies scoped by `owner_id = auth.uid()`.

**Key Endpoints:**
- `GET /api/health` - Health check
- `GET /api/session/:sessionId` - Check payment session status
- `POST /api/products` - Create product (requires auth)
- `GET /api/products` - List products (requires auth)
- `POST /api/payment-links` - Create payment link (requires auth)
- `GET /api/payment-links` - List payment links (requires auth)
- Protected endpoints return HTTP 402 when no valid payment session exists

### Merchant Frontend Architecture (`/merchant-frontend`)

**Stack:** React 18 + TypeScript + Vite + shadcn/ui + React Router + Supabase + viem + x402-axios

Refer to `merchant-frontend/CLAUDE.md` for detailed architecture (already exists and is comprehensive).

**Key Points:**
- Uses `WalletContext` for Ethereum wallet connection (Base Sepolia, chain ID 84532)
- Uses `AuthContext` for Supabase authentication
- API client in `src/services/api.ts` with x402 payment interceptor
- When wallet connects, API client reconfigures with x402 interceptor
- Path alias `@/` points to `src/`

### Analysis Engine (`/analysis-engine`)

**Stack:** Express + TypeScript + CORS

**Purpose:** Risk analysis and wallet scoring for fraud detection

**Structure:**
- `src/index.ts` - Express app setup
- `src/routes/` - API route handlers
- `src/services/` - Risk analysis logic
- `src/middleware/` - Request validation, rate limiting
- `src/types/` - TypeScript interfaces

Runs on port 3002 by default, separate from main server.

### Important Implementation Notes

**Working with x402 Packages:**
- x402 packages are linked locally using `file:../x402-packages/packages/<package-name>`
- Use pnpm in `x402-packages/` directory for dependency management
- After modifying x402 packages, run `pnpm build` in `x402-packages/`
- Then reinstall in dependent projects (server, merchant-frontend)

**Adding Payment-Protected Endpoints:**
1. Add route in `server/index.ts`
2. Apply `paymentMiddleware` with appropriate amount
3. Endpoint automatically returns 402 when no session provided
4. Client with x402-axios integration handles payment flow automatically

**Database Changes:**
1. Modify `server/supabase/supabase-migration.sql`
2. Run SQL in Supabase SQL Editor
3. Update TypeScript interfaces in respective codebases
4. Ensure RLS policies are updated if adding tables

**Authentication Flow:**
- Users authenticate in merchant-frontend via Supabase
- JWT token stored by AuthContext
- Server validates token and extracts `user_id`
- All API operations scoped to `owner_id = user_id`

**Network Configuration:**
- Currently using **Base Sepolia** testnet (chain ID: 84532, hex: 0x14a34)
- Server configured via `NETWORK` env var
- Wallet connection in merchant-frontend hardcoded to Base Sepolia
- Change network in both `.env` (server) and `WalletContext.tsx` (frontend)

**Multi-Chain Support:**
- Balances table tracks `chain` field
- Transactions table tracks `crypto_currency` and `network`
- Payment middleware accepts `network` parameter

**Testing Payments:**
- Use testnet wallet with Base Sepolia ETH or test tokens
- Connect wallet in merchant-frontend
- Access payment-protected endpoint
- x402 interceptor triggers payment flow automatically
- Check session status via `GET /api/session/:sessionId`

## Tech Stack Summary

**Backend:**
- Hono (web framework)
- x402-hono (payment middleware)
- Supabase (auth + Postgres)
- TypeScript + tsx/ts-node

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui (merchant-frontend)
- React Router (merchant-frontend)
- viem (Ethereum interactions)
- x402-axios (payment protocol client)

**Blockchain:**
- viem for wallet interactions
- Base Sepolia testnet (default)
- x402 protocol for payment facilitation

**Monorepo:**
- Turbo + pnpm workspaces (x402-packages)
- npm workspaces (root)
