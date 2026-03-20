import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { requestPasswordReset } from "../api/auth.api";
import "../styles/auth.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await requestPasswordReset(email);
            setMessage(response.message || "OTP sent successfully!");
            // After a short delay, navigate to reset password page
            setTimeout(() => {
                navigate("/reset-password", { state: { email } });
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to send OTP. Please try again.");
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
                <h2 className="auth-title">Forgot Password</h2>
                <p className="auth-subtitle">
                    Enter your email address and we'll send you an OTP to reset your password.
                </p>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        className="auth-input"
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    {error && <div className="auth-error">⚠️ {error}</div>}
                    {message && <div style={{ color: 'var(--success)', textAlign: 'center', marginTop: '8px' }}>✓ {message}</div>}
                    <button className="auth-button" type="submit" disabled={loading}>
                        {loading ? "Sending..." : "Send OTP"}
                    </button>
                    <div className="auth-link">
                        Remembered your password? <Link to="/login">Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
