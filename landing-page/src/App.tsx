import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Integration from './components/Integration';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen">
      {/* SEO and meta tags */}
      <div className="hidden">
        <h1>CryptoPay - Zero Fee Crypto Payments + Earn 4% Interest on Stablecoins</h1>
        <meta name="description" content="Accept crypto payments with 0% fees AND earn up to 4% interest on stablecoins. WordPress and Shopify integration, instant settlements, FDIC-insured." />
        <meta name="keywords" content="crypto payments, cryptocurrency, wordpress payments, shopify payments, zero fees, earn interest, stablecoin interest, USDC, USDT" />
      </div>

      {/* Main content */}
      <Header />
      <Hero />
      <Features />
      <Integration />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}

export default App;