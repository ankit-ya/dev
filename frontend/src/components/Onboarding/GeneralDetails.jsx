import React, { useState } from "react";
import OnboardingLayout from "./OnboardingLayout";
import { Building2, Users, ArrowRight, CheckCircle } from "lucide-react";

const industries = [
  "Human Resource",
  "Security",
  "Agriculture and Mining",
  "Business Services",
  "Computers and Electronics",
  "Construction",
  "Consumer Services",
  "Education",
  "Financial Services",
  "Government",
  "Healthcare, Pharmaceuticals, & Biotech",
  "Hospitality & Gastronomy",
  "Manufacturing",
  "Marketing & Advertising",
  "Media & Entertainment",
  "Non-Profit",
  "Real Estate",
  "Retail",
  "Software & Internet",
  "Telecommunications",
  "Transportation and Storage",
  "Travel, Recreation & Leisure",
  "Utilities",
  "Wholesale & Distributors",
  "Other",
];

const employeeSizes = [
  "1-9",
  "10-24",
  "25-49",
  "50-99",
  "100-149",
  "150-199",
  "200-249",
  "250-299",
  "300-399",
  "400-499",
  "500+",
];

const GeneralDetails = ({ onNext }) => {
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedEmployeeSize, setSelectedEmployeeSize] = useState("");

  const handleNext = () => {
    if (selectedIndustry && selectedEmployeeSize) {
      onNext({ industry: selectedIndustry, employeeSize: selectedEmployeeSize });
    } else {
      alert("Please select both industry and employee size.");
    }
  };

  const isFormComplete = selectedIndustry && selectedEmployeeSize;

  return (
    <OnboardingLayout title="Welcome to Shramii">
      <div className="flex items-center justify-center px-4 py-8 min-h-full">
        <div className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">1</span>
                </div>
                <span className="text-slate-700 font-medium text-sm">General Details</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200"></div>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-slate-400 font-bold text-xs">2</span>
                </div>
                <span className="text-slate-400 font-medium text-sm">Invitations</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">Step 1 of 2 (required)</p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 lg:p-8">
              {/* Header Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
                  Let's tailor your experience!
                </h2>
                <p className="text-base text-slate-600 leading-relaxed max-w-lg mx-auto">
                  Tell us a bit about your business so we can personalize our services to better meet your needs.
                </p>
              </div>

              {/* Form Section */}
              <div className="space-y-6">
                {/* Industry Selection */}
                <div className="group">
                  <label className="block text-base font-semibold text-slate-700 mb-3">
                    <Building2 className="inline w-4 h-4 mr-2 text-blue-600" />
                    What industry are you in?
                  </label>
                  <div className="relative">
                    <select
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                      className="w-full px-5 py-3 text-base border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 appearance-none bg-white cursor-pointer hover:border-slate-300"
                    >
                      <option value="" className="text-slate-400">Select your industry</option>
                      {industries.map((industry, index) => (
                        <option key={index} value={industry} className="text-slate-700">
                          {industry}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {selectedIndustry && (
                      <div className="absolute inset-y-0 right-12 flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center mt-2 text-slate-600 text-sm">
                    <span>We're a</span>
                    <span className="mx-2 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">
                      {selectedIndustry || "..."}
                    </span>
                    <span>company.</span>
                  </div>
                </div>

                {/* Company Size Selection */}
                <div className="group">
                  <label className="block text-base font-semibold text-slate-700 mb-3">
                    <Users className="inline w-4 h-4 mr-2 text-purple-600" />
                    How many employees do you have?
                  </label>
                  <div className="relative">
                    <select
                      value={selectedEmployeeSize}
                      onChange={(e) => setSelectedEmployeeSize(e.target.value)}
                      className="w-full px-5 py-3 text-base border-2 border-slate-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 appearance-none bg-white cursor-pointer hover:border-slate-300"
                    >
                      <option value="" className="text-slate-400">Select company size</option>
                      {employeeSizes.map((size, index) => (
                        <option key={index} value={size} className="text-slate-700">
                          {size} employees
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {selectedEmployeeSize && (
                      <div className="absolute inset-y-0 right-12 flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center mt-2 text-slate-600 text-sm">
                    <span>My company has</span>
                    <span className="mx-2 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg font-medium">
                      {selectedEmployeeSize || "..."}
                    </span>
                    <span>employees.</span>
                  </div>
                </div>

                {/* Next Button */}
                <div className="pt-4">
                  <button
                    onClick={handleNext}
                    disabled={!isFormComplete}
                    className={`w-full py-3 px-6 text-base font-semibold rounded-2xl transition-all duration-300 transform ${
                      isFormComplete
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>Continue to Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </button>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center space-x-2 pt-2">
                  <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isFormComplete ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                  <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                </div>
              </div>
            </div>

            {/* Bottom Gradient */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
          </div>

          {/* Help Text */}
          <div className="text-center mt-4">
            <p className="text-xs text-slate-500">
              Need help? Contact our support team at{" "}
              <a href="mailto:support@shramii.com" className="text-blue-600 hover:text-blue-700 font-medium">
                support@shramii.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default GeneralDetails;