import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Home } from '@/pages/Home';
import { Balance } from '@/pages/Balance';
import { Transactions } from '@/pages/Transactions';
import { Customers } from '@/pages/Customers';
import { Products } from '@/pages/Products';
import { Radar } from '@/pages/Radar';
import { PaymentLinks } from '@/pages/PaymentLinks';
import { Plugins } from '@/pages/Plugins';
import { Reporting } from '@/pages/Reporting';
import { Terminal } from '@/pages/Terminal';
import { Billing } from '@/pages/Billing';
import { ZapPayUI } from '@/pages/ZapPayUI';
import { Auth } from '@/pages/Auth';
import { RequireAuth } from '@/components/RequireAuth';
import { ApiKey } from '@/pages/ApiKey';
import { WalletProvider } from '@/contexts/WalletContext';
import './App.css';

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Home />} />
            <Route path="balance" element={<Balance />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="customers" element={<Customers />} />
            <Route path="products" element={<Products />} />
            <Route path="payment-links" element={<PaymentLinks />} />
            <Route path="plugins" element={<Plugins />} />
            <Route path="radar" element={<Radar />} />
            <Route path="reporting" element={<Reporting />} />
            <Route path="terminal" element={<Terminal />} />
            <Route path="billing" element={<Billing />} />
            </Route>
          </Route>
          <Route path="/auth" element={<Auth />} />
          <Route element={<RequireAuth />}>
            <Route path="/api-key" element={<ApiKey />} />
          </Route>
          <Route path="/payment/:paymentLink" element={<ZapPayUI />} />
        </Routes>
      </Router>
    </WalletProvider>
  );
}

export default App;