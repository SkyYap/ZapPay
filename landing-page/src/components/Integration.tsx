import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle, ArrowRight, Globe, ShoppingCart } from 'lucide-react';

const Integration: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const integrationSteps = [
    {
      step: 1,
      title: "Install Plugin",
      description: "Download and install our plugin from the official marketplace"
    },
    {
      step: 2,
      title: "Configure Settings",
      description: "Enter your wallet address and customize payment options"
    },
    {
      step: 3,
      title: "Start Accepting",
      description: "Begin receiving crypto payments immediately"
    }
  ];

  return (
    <section id="integration" ref={sectionRef} className="py-24 bg-gradient-to-br from-gray-50 to-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Seamless Integration with
            <span className="bg-gradient-to-r from-amber-500 to-orange-700 bg-clip-text text-transparent"> Shopify and WordPress</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get up and running in minutes with our one-click plugins for WordPress and Shopify.
          </p>
        </div>

        {/* Integration steps */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Steps */}
          <div className={`space-y-8 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Setup in 3 Simple Steps
            </h3>
            
            {integrationSteps.map((item, index) => (
              <div key={index} className="flex items-start space-x-4 group">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-amber-600 font-semibold group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-orange-500 group-hover:text-white transition-all duration-300">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}

            <div className="pt-6 flex gap-4">
              <button className="group bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center">
                <Globe className="mr-2 w-5 h-5" />
                WordPress Plugin
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              
              <button className="group bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center">
                <ShoppingCart className="mr-2 w-5 h-5" />
                Shopify Plugin
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* Features list */}
          <div className={`transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <div className="bg-white p-8 rounded-3xl shadow-xl">
              <h4 className="text-xl font-semibold text-gray-900 mb-6">
                What You Get
              </h4>
              
              <div className="space-y-4">
                {[
                  'Automatic currency conversion',
                  'Real-time payment notifications',
                  'Customizable checkout experience',
                  'Multi-currency support',
                  'Advanced fraud protection',
                  '24/7 technical support'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integration;