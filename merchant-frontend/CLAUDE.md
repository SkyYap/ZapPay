# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # Start development server on http://localhost:5173
npm run build        # Type check with tsc and build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build locally
```

### Environment Setup
Copy `.env.example` to `.env` and configure:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_API_BASE_URL` - Backend API URL (defaults to http://localhost:3001)

## Architecture Overview

### Tech Stack
- **React 18** with TypeScript and Vite
- **shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** for styling with custom design tokens
- **React Router** for client-side routing
- **Supabase** for authentication and database
- **viem** for Ethereum wallet interactions (Scroll network)
- **x402-axios** for HTTP 402 payment protocol integration

### Project Structure

**Core Application Files:**
- `src/App.tsx` - Main router configuration with authentication guards
- `src/main.tsx` - Application entry point

**Context Providers:**
- `src/contexts/WalletContext.tsx` - Manages Ethereum wallet connection using viem (Base Sepolia testnet chain ID: 0x14a34/84532). Handles account changes, network switching, and MetaMask integration
- `src/contexts/AuthContext.tsx` - Supabase authentication state with sign in/up/out methods and profile management

**API Layer:**
- `src/services/api.ts` - Centralized API client with x402 payment interceptor integration. The client dynamically updates when wallet connects. Includes Supabase auth token injection and API endpoint definitions for health checks, sessions, products, and payment links

**Layout Components:**
- `src/components/dashboard/DashboardLayout.tsx` - Main dashboard shell with responsive sidebar
- `src/components/dashboard/Sidebar.tsx` - Navigation sidebar
- `src/components/dashboard/Header.tsx` - Top header bar
- `src/components/RequireAuth.tsx` - Protected route wrapper

**UI Components:**
- `src/components/ui/` - shadcn/ui components (button, card, dialog, form, etc.)
- `src/components/common/` - Reusable custom components

**Pages:**
- `src/pages/Auth.tsx` - Login/signup page
- `src/pages/Home.tsx` - Dashboard overview with stats and charts
- `src/pages/Balance.tsx` - Crypto balance management
- `src/pages/Transactions.tsx` - Transaction history
- `src/pages/Customers.tsx` - Customer management
- `src/pages/Products.tsx` - Product catalog
- `src/pages/PaymentLinks.tsx` - Payment link creation and management
- `src/pages/Plugins.tsx` - Plugin marketplace
- `src/pages/ZapPayUI.tsx` - Public payment page with wallet connection and x402 payment flow
- Other pages: Radar, Reporting, Terminal, Billing

**Types & Data:**
- `src/types/index.ts` - TypeScript interfaces for domain models
- `src/data/mockData.ts` - Mock data for development

**Utilities:**
- `src/lib/utils.ts` - Utility functions including `cn()` for className merging
- `src/lib/supabase.ts` - Supabase client initialization

### Key Architectural Patterns

**Wallet Integration:**
The application uses viem to connect to Ethereum wallets (specifically targeting Base Sepolia testnet). When a wallet connects via `WalletContext`, the API client in `src/services/api.ts` is updated with the x402 payment interceptor, enabling automatic HTTP 402 payment handling for protected endpoints.

**Authentication Flow:**
1. Users authenticate via Supabase (password or magic link) in `src/pages/Auth.tsx`
2. `AuthContext` manages session state and automatically upserts user profiles
3. `RequireAuth` component protects routes requiring authentication
4. API requests automatically include Supabase auth tokens via axios interceptor

**Payment Protocol:**
The app integrates x402-axios (local package at `../x402-packages/packages/x402-axios`) which intercepts HTTP 402 responses from the backend and automatically handles crypto payments through the connected wallet. This enables seamless paid API access.

**State Management:**
- React Context for global state (auth, wallet)
- Local component state for UI interactions
- No external state management library

**Styling:**
- Tailwind utility classes with custom config in `tailwind.config.js`
- CSS variables for theming in `src/index.css`
- shadcn/ui components configured in `components.json` with `@` alias

### Path Aliases
The `@` alias points to `./src` directory (configured in `vite.config.ts` and `tsconfig.json`). Always use `@/` imports instead of relative paths.

### Important Implementation Notes

**When working with wallet functionality:**
- Always check `isConnected` status before wallet operations
- Network switching automatically prompts user to add/switch to Base Sepolia testnet
- Wallet client updates trigger API client reconfiguration with payment interceptor

**When adding new API endpoints:**
- Add method to `api` object in `src/services/api.ts`
- Define TypeScript interfaces for request/response types
- Endpoints requiring payment should return HTTP 402 when no valid session exists
- The x402 interceptor handles payment flow automatically

**When adding new shadcn/ui components:**
Use the shadcn CLI (components are already configured):
```bash
npx shadcn@latest add [component-name]
```

**When working with Supabase:**
- Auth state is managed centrally in `AuthContext`
- Profile table uses `user_id` as primary key linking to Supabase auth.users
- Session tokens are automatically injected into API requests
