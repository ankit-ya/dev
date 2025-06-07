import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../API/apiService";
import { Eye, EyeOff, Mail, Lock, Phone, ArrowRight, Shield, User, Users, Check } from "lucide-react";

import "react-phone-input-2/lib/style.css";
import logo from "/logo.svg";

export default function SignupCard({ onSignUpSuccess = () => {}, setIsLoginView }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [number, setNumber] = useState("");
  const [userType, setUserType] = useState("employee");
  const [message, setMessage] = useState("");
  const [warning, setWarning] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!userType) {
      setWarning("Please select a user type.");
      setIsLoading(false);
      return;
    }

    if (!number || !password || !confirmPassword) {
      setWarning("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    if (number.length !== 10) {
      setWarning("Mobile number must be exactly 10 digits.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      setIsLoading(false);
      return;
    } else {
      setPasswordError("");
    }

    setWarning("");

    try {
      const response = await registerUser(email, password, userType, number);

      setMessage(response.message || "Registration successful!");
      setShowMessage(true);
      const { token, userType: type, username } = response.res;

      localStorage.setItem("token", token);
      localStorage.setItem("userType", type);
      localStorage.setItem("userId", username);

      onSignUpSuccess(userType);

      if (userType === "employer") {
        navigate("/onboarding");
      } else {
        navigate("/employee-dashboard");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setMessage(error.message || "An error occurred. Please try again.");
      setShowMessage(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <div 
          className="w-full h-full opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>
      
      <div className="relative w-full max-w-lg">
        {/* Main SignUp Card */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full -translate-y-16 translate-x-16"></div>
          
          {/* Header Section */}
          <div className="text-center mb-6 relative z-10">
            <div className="mb-4">
              <img src={logo} alt="Logo" className="mx-auto w-16 h-16" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-slate-600 text-sm">
              Join Shramik to manage your workforce efficiently
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User Type Selection - Prominent Section */}
            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Choose Your Role *</label>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className={`relative p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    userType === "employee" 
                      ? "border-blue-500 bg-blue-50 shadow-md" 
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                  onClick={() => {
                    setUserType("employee");
                    setWarning("");
                  }}
                >
                  <input
                    type="radio"
                    id="employee"
                    name="userType"
                    value="employee"
                    checked={userType === "employee"}
                    onChange={() => {}}
                    className="absolute top-3 right-3"
                  />
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`p-2 rounded-lg ${userType === "employee" ? "bg-blue-100" : "bg-slate-100"}`}>
                      <User className={`w-5 h-5 ${userType === "employee" ? "text-blue-600" : "text-slate-500"}`} />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm ${userType === "employee" ? "text-blue-900" : "text-slate-700"}`}>
                        Employee
                      </h4>
                      <p className={`text-xs ${userType === "employee" ? "text-blue-600" : "text-slate-500"}`}>
                        Join workforce
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`relative p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    userType === "employer" 
                      ? "border-purple-500 bg-purple-50 shadow-md" 
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                  onClick={() => {
                    setUserType("employer");
                    setWarning("");
                  }}
                >
                  <input
                    type="radio"
                    id="employer"
                    name="userType"
                    value="employer"
                    checked={userType === "employer"}
                    onChange={() => {}}
                    className="absolute top-3 right-3"
                  />
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`p-2 rounded-lg ${userType === "employer" ? "bg-purple-100" : "bg-slate-100"}`}>
                      <Users className={`w-5 h-5 ${userType === "employer" ? "text-purple-600" : "text-slate-500"}`} />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm ${userType === "employer" ? "text-purple-900" : "text-slate-700"}`}>
                        Employer
                      </h4>
                      <p className={`text-xs ${userType === "employer" ? "text-purple-600" : "text-slate-500"}`}>
                        Manage teams
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">Contact Information</h3>
              
              {/* Mobile Number Field - Most Important */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter 10-digit mobile number"
                    value={number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        setNumber(value);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 bg-slate-50/50 text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium"
                    maxLength="10"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Work Email <span className="text-slate-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="your@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 bg-slate-50/50 text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">Security</h3>
              
              {/* Password Fields in Grid */}
              <div className="grid grid-cols-1 gap-4">
                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border-2 border-slate-200 bg-slate-50/50 text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border-2 border-slate-200 bg-slate-50/50 text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Messages */}
            {(warning || passwordError) && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center space-x-2">
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span>{warning || passwordError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>CREATE ACCOUNT</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </button>

            {/* Success Message */}
            {showMessage && message && !warning && !passwordError && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium flex items-center space-x-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500 font-medium">or</span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-slate-600 font-medium">
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/login");
                  }}
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-slate-500">
            <Shield className="w-4 h-4" />
            <span className="font-medium">Your data is protected with enterprise security</span>
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/80 text-sm font-medium">Join thousands of satisfied users</span>
          </div>
        </div>
      </div>
    </div>
  );
}
