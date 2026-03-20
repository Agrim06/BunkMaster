import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../api/auth.api";
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
                    <p className="auth-subtitle">Invalid access. Please start the process again.</p>
                    <Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Go Back</Link>
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
            }, 2000);
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
                <h2 className="auth-title">Reset Password</h2>
                <p className="auth-subtitle">
                    Enter the OTP sent to <strong>{email}</strong> and your new password.
                </p>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        className="auth-input"
                        type="text"
                        placeholder="6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        required
                    />
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    {error && <div className="auth-error">⚠️ {error}</div>}
                    {message && <div style={{ color: 'var(--success)', textAlign: 'center', marginTop: '8px' }}>✓ {message}</div>}
                    <button className="auth-button" type="submit" disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
