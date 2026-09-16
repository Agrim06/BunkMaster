import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { verifyOtp } from "../api/auth.api";
import { KeyRound, ShieldCheck, AlertCircle } from "lucide-react";
import "../styles/auth.css";

const VerifyEmail = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  if (!email) {
    navigate("/register");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp({ email, otp });
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.detail || "Verification failed. Invalid or expired OTP.");
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
          <h2 className="auth-title">Verify Email</h2>
          <p className="auth-subtitle">
            We sent a verification code to <strong style={{ color: "var(--primary-text)" }}>{email}</strong>
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <input
              className="auth-input"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
            <KeyRound size={18} className="auth-input-icon" />
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button className="auth-button" type="submit" disabled={loading}>
            <ShieldCheck size={16} />
            <span>{loading ? "Verifying..." : "Verify Account"}</span>
          </button>

          <div className="auth-link">
            Didn't receive a code? <Link to="/register">Try registering again</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
