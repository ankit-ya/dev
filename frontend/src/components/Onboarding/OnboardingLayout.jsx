import React from "react";
import { Sparkles } from "lucide-react";
import logo from "/logo.svg";
import SHRAMII from "/SHRAMII.png";

const OnboardingLayout = ({ title, quote, imageSrc, children }) => {
  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Section - Enhanced with Modern Design */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 bg-white rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white rounded-full blur-xl"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 text-white">
          {/* Animated Title */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold leading-tight">
              <div className="inline-block animate-fade-in-up">
                WELCOME
              </div>
              <br />
              <div className="inline-block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                TO
              </div>
              <br />
              <div className="inline-block animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                SHRAMII
              </div>
            </h1>
            <div className="flex items-center justify-center mt-3">
              <Sparkles className="w-5 h-5 text-yellow-300 mr-2 animate-pulse" />
              <span className="text-lg text-blue-100 font-medium">Your Workforce Companion</span>
              <Sparkles className="w-5 h-5 text-yellow-300 ml-2 animate-pulse" />
            </div>
          </div>

          {/* Logo with White Background for Better Visibility */}
          <div className="mb-6 transform hover:scale-110 transition-transform duration-300">
            <div className="bg-white rounded-full p-4 shadow-2xl">
              <img 
                src={logo} 
                alt="Shramii Logo" 
                className="w-24 h-24 object-contain animate-float"
              />
            </div>
          </div>

          {/* Quote or Description */}
          <div className="max-w-sm">
            <p className="text-base text-blue-100 leading-relaxed">
              {quote || "Streamline your workforce management with intelligent automation and real-time insights."}
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Content Area */}
      <div className="flex-1 lg:w-3/5 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-y-auto">
        {/* Feedback Button */}
        <button className="fixed top-1/2 right-0 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-6 rounded-l-xl shadow-lg hover:shadow-xl transition-all duration-300 z-50 group">
          <span className="writing-vertical text-xs font-semibold group-hover:scale-110 transition-transform">
            Feedback
          </span>
        </button>

        {/* Mobile Header for smaller screens */}
        <div className="lg:hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 text-center">
          <h1 className="text-xl font-bold">Welcome to Shramii</h1>
          <div className="bg-white rounded-full p-2 inline-block mt-2">
            <img src={logo} alt="Shramii Logo" className="w-12 h-12 object-contain" />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative min-h-full">
          {children}
        </div>

        {/* Background Decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-to-r from-indigo-200 to-pink-200 rounded-full blur-2xl opacity-20"></div>
        </div>
      </div>

      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .writing-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </div>
  );
};

export default OnboardingLayout;
