import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Home } from '@/pages/Home';
import { Balance } from '@/pages/Balance';
import { Transactions } from '@/pages/Transactions';
import { Customers } from '@/pages/Customers';
import { Products } from '@/pages/Products';
import { Radar } from '@/pages/Radar';
import { PaymentLinks } from '@/pages/PaymentLinks';
import { Reporting } from '@/pages/Reporting';
import { Terminal } from '@/pages/Terminal';
import { Billing } from '@/pages/Billing';
import { ZapPayUI } from '@/pages/ZapPayUI';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="balance" element={<Balance />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="customers" element={<Customers />} />
          <Route path="products" element={<Products />} />
          <Route path="payment-links" element={<PaymentLinks />} />
          <Route path="radar" element={<Radar />} />
          <Route path="reporting" element={<Reporting />} />
          <Route path="terminal" element={<Terminal />} />
          <Route path="billing" element={<Billing />} />
        </Route>
        <Route path="/zapPayUI" element={<ZapPayUI />} />
        <Route path="*" element={<div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
            <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
            <a href="/" className="text-blue-600 hover:text-blue-800 underline">Go back to Dashboard</a>
          </div>
        </div>} />
      </Routes>
    </Router>
  );
}

export default App;