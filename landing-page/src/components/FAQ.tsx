import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const faqs: FAQItem[] = [
    {
      question: "How do I earn 4% interest on my stablecoins?",
      answer: "Simply hold USDC or USDT in your ZapPay wallet and earn up to 4% annual interest automatically. Interest is calculated daily and paid monthly. Your funds remain liquid and accessible at all times."
    },
    {
      question: "How secure are cryptocurrency payments?",
      answer: "Cryptocurrency payments use Scroll as our Layer 2 settlement layer and x402, an open source technology from Coinbase, to facilitate payments. Each transaction is cryptographically secured and recorded on an immutable ledger, making them more secure than traditional payment methods. Our platform adds additional security layers including multi-signature wallets and real-time fraud detection."
    },
    {
      question: "What cryptocurrencies do you support?",
      answer: "We currently support USDT and USDC stablecoins. Soon we will support more cryptocurrencies, and you can choose to convert payments to stablecoins or keep them in their original form. This gives you flexibility to manage volatility while accepting a wider range of crypto payments."
    },
    {
      question: "How quickly do I receive payments?",
      answer: "Unlike traditional processors that take 3-7 business days, crypto payments are settled instantly. Funds appear in your designated wallet within seconds to minutes, depending on the blockchain network confirmation times."
    },
    {
      question: "Do my customers need crypto wallets?",
      answer: "No! Our solution includes a seamless onboarding process. Customers can pay with crypto they already own or purchase crypto instantly using their credit card or bank account right at checkout."
    },
    {
      question: "What about price volatility?",
      answer: "We offer optional instant conversion to stablecoins (USDC, USDT) to eliminate volatility concerns. Plus, holding stablecoins in your ZapPay wallet earns you up to 4% annual interest while maintaining price stability."
    },
    {
      question: "Is there really no setup fee or monthly cost?",
      answer: "Absolutely none. No setup fees, no monthly subscriptions, no hidden costs. We are a team of experienced Web3 builders supported by Ethereum Foundation, Coinbase, Uniswap, Binance, etc. Our mission is to bring seamless payments to Web2 merchants, not to earn money from the platform."
    },
    {
      question: "How does integration work with my existing store?",
      answer: "Integration is incredibly simple. For WordPress/WooCommerce, install our plugin from the official repository. For Shopify, add our app from the App Store. The entire process takes less than 5 minutes with our guided setup wizard."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We provide 24/7 technical support via email. Our team includes blockchain experts who can help with technical questions, integration issues, and ongoing optimization of your payment flow."
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" ref={sectionRef} className="py-24 bg-gradient-to-br from-gray-50 to-[#FAFAF8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent"> Questions</span>
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about accepting crypto payments
          </p>
        </div>

        {/* FAQ items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-700 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-8">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-orange-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-orange-500" />
                  )}
                </div>
              </button>
              
              <div className={`transition-all duration-300 ease-in-out ${
                openIndex === index 
                  ? 'max-h-96 opacity-100' 
                  : 'max-h-0 opacity-0'
              }`}>
                <div className="px-8 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA section */}
        <div className={`mt-16 text-center transition-all duration-1000 delay-800 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-3xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-700 mb-6">
              Our crypto payment experts are here to help you get started
            </p>
            <button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 hover:shadow-xl transform hover:-translate-y-1 text-white px-8 py-4 rounded-2xl font-semibold transition-colors duration-300">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;