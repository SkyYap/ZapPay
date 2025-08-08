import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Play, Shield, Zap } from 'lucide-react';
import hosteduiImage from '/hostedui.png';

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#FAFAF8] to-[#F5F5DC] overflow-hidden pt-20"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F5F5DC] rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#E6E6C8] rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10">
        {/* Hero content with staggered animations */}
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-[#F5F5DC] rounded-full mb-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <Shield className="w-4 h-4 text-gray-700 mr-2" />
            <span className="text-sm font-medium text-gray-700">Earn up to 4% interest on stablecoins</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Accept Crypto at{" "}
            <span className="bg-gradient-to-r from-[#B8860B] to-[#DAA520] bg-clip-text text-transparent">
              0% Fees
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Start accepting crypto payments in 7 lines of code. Ready Shopify and WordPress plugins.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="group bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-800 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Start Free Integration
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            
            <button className="group flex items-center px-8 py-4 text-gray-700 font-semibold text-lg hover:text-gray-900 transition-colors duration-300">
              <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              Watch Demo
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-2 text-[#B8860B]" />
              <span>5-minute setup</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-[#B8860B]" />
              <span>Bank-grade security</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 mr-2 text-[#B8860B]">$</span>
              <span>0% transaction fees</span>
            </div>
          </div>
        </div>

        {/* Hero image/mockup */}
        <div className={`mt-16 transition-all duration-1200 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <img 
                src={hosteduiImage} 
                alt="Crypto payment dashboard mockup"
                className="w-full h-64 sm:h-full object-cover rounded-xl pb-10"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;