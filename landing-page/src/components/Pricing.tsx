import React, { useEffect, useRef, useState } from 'react';
import { Check, X, Star } from 'lucide-react';

const Pricing: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  const plans = [
    {
      name: "Traditional Processors",
      price: "2.9% + $0.30",
      description: "per transaction",
      features: [
        { text: "High transaction fees", included: false },
        { text: "7-day settlement", included: false },
        { text: "Chargeback risks", included: false },
        { text: "Geographic restrictions", included: false },
        { text: "Complex compliance", included: false },
        { text: "No interest earnings", included: false }
      ],
      cta: "Current Solution",
      popular: false,
      disabled: true
    },
    {
      name: "ZapPay",
      price: "0%",
      description: "transaction fees",
      features: [
        { text: "Zero transaction fees", included: true },
        { text: "Earn up to 4% interest", included: true },
        { text: "Instant settlements", included: true },
        { text: "No chargebacks", included: true },
        { text: "Global payments", included: true },
        { text: "Simple integration", included: true },
        { text: "24/7 support", included: true },
        { text: "FDIC-insured storage", included: true }
      ],
      cta: "Start Free",
      popular: true,
      disabled: false
    }
  ];

  return (
    <section id="pricing" ref={sectionRef} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Stop Paying
            <span className="bg-gradient-to-r from-[#B8860B] to-[#DAA520] bg-clip-text text-transparent"> Unnecessary Fees</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compare traditional payment processors with our zero-fee crypto solution and see the difference.
          </p>
        </div>

        {/* Pricing comparison */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-3xl transition-all duration-700 hover:scale-105 ${
                plan.popular 
                  ? 'bg-gradient-to-br from-[#F5F5DC] to-[#E6E6C8] shadow-2xl border-2 border-[#B8860B]' 
                  : 'bg-gray-50 border border-gray-200'
              } ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              } ${
                plan.disabled ? 'opacity-75' : ''
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#B8860B] text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Recommended
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-5xl font-bold ${
                    plan.popular ? 'text-[#B8860B]' : 'text-gray-600'
                  }`}>
                    {plan.price}
                  </span>
                  <span className="text-lg text-gray-600 ml-2">
                    {plan.description}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-[#B8860B] mr-3 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                    )}
                    <span className={`${
                      feature.included ? 'text-gray-700' : 'text-gray-500 line-through'
                    }`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <button 
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                  plan.popular 
                    ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:-translate-y-1' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                } ${
                  plan.disabled ? 'cursor-not-allowed' : ''
                }`}
                disabled={plan.disabled}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Savings calculator */}
        <div className={`mt-20 bg-gradient-to-r from-[#F5F5DC] to-[#E6E6C8] p-8 rounded-3xl text-center transition-all duration-1000 delay-600 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Calculate Your Savings
          </h3>
          <p className="text-gray-700 mb-6">
            A merchant processing $10,000/month saves <strong>$320</strong> in fees PLUS earns <strong>$133</strong> monthly interest.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-[#B8860B]">$453</div>
              <div className="text-sm text-gray-600">Total Monthly Benefit</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#B8860B]">$5,436</div>
              <div className="text-sm text-gray-600">Annual Benefit</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#B8860B]">4%</div>
              <div className="text-sm text-gray-600">Interest Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;