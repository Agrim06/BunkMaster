import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../api/auth.api";
import { KeyRound, Lock, CheckCircle2, AlertCircle, Check } from "lucide-react";
import "../styles/auth.css";

const ResetPassword = () => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  if (!email) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Invalid Request</h2>
            <p className="auth-subtitle">No email provided for password reset.</p>
          </div>
          <div className="auth-link">
            <Link to="/forgot-password">Request Reset Code</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await resetPassword({ email, otp, new_password: newPassword });
      setMessage(response.message || "Password reset successful!");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Reset failed. Please check your OTP and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="bg-blob"></div>
      <div className="bg-blob bg-blob-2"></div>
      <div className="bg-blob bg-blob-3"></div>

      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Set New Password</h2>
          <p className="auth-subtitle">
            Enter the 6-digit code sent to <strong style={{ color: "var(--primary-text)" }}>{email}</strong>
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <input
              className="auth-input"
              type="text"
              placeholder="6-digit verification code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
            <KeyRound size={18} className="auth-input-icon" />
          </div>

          <div className="auth-input-group">
            <input
              className="auth-input"
              type="password"
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
            <Lock size={18} className="auth-input-icon" />
          </div>

          <div className="auth-input-group">
            <input
              className="auth-input"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
            <Lock size={18} className="auth-input-icon" />
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="auth-success">
              <CheckCircle2 size={16} />
              <span>{message}</span>
            </div>
          )}

          <button className="auth-button" type="submit" disabled={loading}>
            <Check size={16} />
            <span>{loading ? "Updating..." : "Update Password"}</span>
          </button>

          <div className="auth-link">
            <Link to="/login">Back to Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
