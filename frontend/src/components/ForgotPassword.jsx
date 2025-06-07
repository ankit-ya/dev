// src/components/ForgotPassword.jsx
import { useState } from "react";
import { requestPasswordReset } from "../API/apiService";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const isEmail = input.includes("@");
      const body = isEmail ? { email: input } : { mobile: input };

      const response = await requestPasswordReset(body);
      setMessage(response.data.message);
      setSuccess(true);
    } catch (err) {
      setMessage(
        err?.response?.data?.message || "Failed to send password reset link."
      );
      setSuccess(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
        <h2 className="text-xl font-semibold mb-4 text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter your email or mobile"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Send Reset Link
          </button>
        </form>
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
