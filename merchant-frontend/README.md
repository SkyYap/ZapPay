# Merchant Frontend Dashboard

A modern crypto payment merchant dashboard built with React, TypeScript, and shadcn/ui.

## Features

- **Modern Dashboard Layout**: Clean, responsive design following shadcn/ui patterns
- **Real-time Analytics**: Revenue tracking, transaction monitoring, and customer insights
- **Payment Management**: Create payment links, view transactions, and manage products
- **Customer Management**: Track customer activity and engagement
- **Security Monitoring**: Radar alerts for fraud detection and security
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **shadcn/ui** for beautiful, accessible components
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **Lucide React** for icons

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components
│   ├── dashboard/       # Dashboard layout components
│   └── ui/             # shadcn/ui components
├── pages/              # Page components
├── data/               # Mock data and API services
├── types/              # TypeScript type definitions
└── lib/                # Utility functions
```

## Dashboard Sections

- **Overview**: Main dashboard with key metrics and charts
- **Balance**: Crypto balance management
- **Transactions**: Payment transaction history
- **Customers**: Customer management and analytics
- **Products**: Product catalog management
- **Radar**: Security and fraud monitoring
- **Payment Links**: Create and manage payment links
- **Analytics**: Detailed reporting and insights
- **Terminal**: Point-of-sale terminal (coming soon)
- **Billing**: Billing and subscription management (coming soon)

## Design System

This dashboard uses the shadcn/ui design system with:
- Consistent spacing and typography
- Accessible color schemes
- Responsive grid layouts
- Modern card-based UI components
- Clean navigation and sidebar

## Development

The project uses:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Vite** for fast development

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.
