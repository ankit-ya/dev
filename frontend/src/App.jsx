import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./Home/components/Home";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import EmployerDashboard from "./EmoDashboard/EmployerDashboard";
import AuthComponent from "./components/AuthComponent";
import Onboarding from "./components/Onboarding/Onboarding";
import ForgotPassword from "./components/ForgotPassword";
import Team from "./EmoDashboard/Team";
import AcceptInvite from "./EmpPages/AcceptInvite";
import PrivacyPolicy from "./Home/PrivacyPolicy";
import ResetPassword from "./components/ResetPassword";
import LeaveHistory from "./components/Dashboard/LeaveHistory";
import RequestPage from "./EmoDashboard/RequestPage";
import ContactForm from "./Home/components/ContactForm";

const WrappedApp = () => {
  const [userType, setUserType] = useState(localStorage.getItem("userType") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");

  useEffect(() => {
    const storedUserType = localStorage.getItem("userType");
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    setUserType(storedUserType || "");
    setIsLoggedIn(storedIsLoggedIn);
  }, []);

  const handleLoginSuccess = (selectedUserType) => {
    console.log("Login successful in WrappedApp with userType:", selectedUserType);
    localStorage.setItem("userType", selectedUserType);
    localStorage.setItem("isLoggedIn", "true");

    const returnTo = localStorage.getItem("returnTo");

    if (returnTo) {
      localStorage.removeItem("returnTo");
      window.location.href = returnTo;
    } else if (selectedUserType === "employer") {
      window.location.href = "/employer-dashboard";
    } else {
      window.location.href = "/employee-dashboard";
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/auth" element={<AuthComponent />} />
        <Route path="/contact-form" element={<ContactForm />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Employee Dashboard */}
        <Route path="/employee-dashboard/*" element={<Dashboard />} />
        <Route path="/team/:deptIndex/:teamIndex" element={<Team />} />
        <Route path="/leave-history" element={<LeaveHistory />} />
        <Route path="/time-off/request" element={<RequestPage />} />

        {/* Employer Dashboard Full Section */}
        <Route path="/employer-dashboard/*" element={<EmployerDashboard />} />

        {/* If no match */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default WrappedApp;
