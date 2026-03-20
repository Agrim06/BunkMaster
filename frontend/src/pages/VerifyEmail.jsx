import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp } from "../api/auth.api";
import "../styles/auth.css";

const VerifyEmail = () => {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    // Get the email that was passed from the Register page
    const email = location.state?.email;

    // If there's no email in the state, redirect back to register
    if (!email) {
        navigate("/register");
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await verifyOtp({ email, otp });
            // Navigate to login after successful verification
            navigate("/login");
        } catch (error) {
            setError(error.response?.data?.detail || "Verification failed. Invalid or expired OTP.");
        }
    };

    return (
        <div className="auth-container">
            <div className="bg-blob"></div>
            <div className="bg-blob bg-blob-2"></div>
            <div className="bg-blob bg-blob-3"></div>
            <div className="auth-card">
                <h2 className="auth-title">Verify Email</h2>
                <p className="auth-subtitle">
                    We've sent a one-time password to <strong>{email}</strong>
                </p>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        className="auth-input"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        required
                    />
                    {error && <div className="auth-error">⚠️ {error}</div>}
                    <button className="auth-button" type="submit">
                        Verify Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyEmail;
