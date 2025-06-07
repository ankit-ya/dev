// src/components/ResetPassword.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword, validateResetToken } from "../API/apiService";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = searchParams.get("token");

  useEffect(() => {
    const validate = async () => {
      try {
        await validateResetToken(token);
        setTokenValid(true);
      } catch (err) {
        setMessage("Invalid or expired token.");
      } finally {
        setLoading(false);
      }
    };

    if (token) validate();
    else {
      setMessage("Missing token.");
      setLoading(false);
    }
  }, [token]);

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const response = await resetPassword(token, newPassword);
      setMessage(response.data.message);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage(
        err?.response?.data?.message || "Failed to reset password. Try again."
      );
    }
  };

  if (loading) return <div className="text-center p-8">Validating token...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">Reset Password</h2>
        {tokenValid ? (
          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reset Password
            </button>
          </form>
        ) : (
          <p className="text-red-600 text-center">{message}</p>
        )}
        {message && tokenValid && (
          <div className="mt-4 text-green-700 text-sm text-center">{message}</div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
