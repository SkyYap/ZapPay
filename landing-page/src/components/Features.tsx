import React, { useEffect, useRef, useState } from 'react';
import { Zap, CreditCard, Globe, Users, TrendingUp, Code } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}

const Features: React.FC = () => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  const features: Feature[] = [
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Zero Transaction Fees",
      description: "Keep 100% of your revenue. No hidden costs, no monthly fees, no surprises.",
      highlight: true
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Settlements",
      description: "Receive payments instantly to your wallet within seconds, not days.",
      highlight: true
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Earn 4% Interest",
      description: "Hold USDT, USDC in your wallet and earn up to 4% annual interest on your crypto reserves.",
      highlight: true
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "No Complex Setup",
      description: "Integrate cryptocurrency payments with just seven lines of code."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Reach",
      description: "Accept payments from customers worldwide without geographical restrictions."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Easy Integration",
      description: "One-click installation for WordPress and Shopify with guided setup wizard."
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setVisibleItems(prev => [...prev, index]);
          }
        });
      },
      { threshold: 0.2 }
    );

    const featureElements = sectionRef.current?.querySelectorAll('[data-index]');
    featureElements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Why Choose Our
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent"> Solution</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built specifically for e-commerce merchants who want to embrace the future of payments without complexity.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              data-index={index}
              className={`relative group p-8 rounded-3xl transition-all duration-700 hover:scale-105 ${
                feature.highlight 
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg' 
                  : 'bg-gray-50 hover:bg-gray-100'
              } ${
                visibleItems.includes(index) 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {feature.highlight && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              <div className={`inline-flex p-3 rounded-2xl mb-6 ${
                feature.highlight 
                  ? 'bg-white text-amber-600' 
                  : 'bg-amber-50 text-gray-700'
              }`}>
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats section */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { number: '10,000+', label: 'Active Merchants' },
            { number: '$2.5M+', label: 'Processed Monthly' },
            { number: '99.9%', label: 'Uptime' },
            { number: '< 5 min', label: 'Setup Time' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-orange-400 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;