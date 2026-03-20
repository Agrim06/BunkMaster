import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { registerUser } from "../api/auth.api";
import "../styles/auth.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;


const Register = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state && location.state.from) || "/";

    useEffect(() => {
        if (window.google && GOOGLE_CLIENT_ID) {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse,
                auto_select: false,
                cancel_on_tap_outside: true,
                ux_mode: "popup",
            });

            window.google.accounts.id.renderButton(
                document.getElementById("googleSignUpDiv"),
                {
                    theme: "outline",
                    size: "medium",
                    width: 200,
                    shape: "rectangular",
                    text: "signup_with",
                }
            );
        }
    }, []);

    async function handleGoogleResponse(response) {
        try {
            setError("");
            setLoading(true);

            const { data } = await api.post("/google-login", {
                idToken: response.credential,
            });

            localStorage.setItem("token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.dispatchEvent(new Event("authUserChanged"));
            navigate(from, { replace: true });
        } catch (err) {
            console.log(err);
            setError(
                err?.response?.data?.message || "Google signup failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await registerUser({ name, email, password });
            navigate("/verify-email", { state: { email } });
        } catch (error) {
            setError("Registration failed");
        }
    };

    return (
        <div className="auth-container">
            <div className="bg-blob"></div>
            <div className="bg-blob bg-blob-2"></div>
            <div className="bg-blob bg-blob-3"></div>
            <div className="auth-card">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Start tracking your attendance today</p>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        className="auth-input"
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        className="auth-input"
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <div className="auth-error">⚠️ {error}</div>}
                    <button className="auth-button" type="submit" disabled={loading}>
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>or</span>
                </div>

                <div className="social-button-container">
                    <div id="googleSignUpDiv"></div>
                </div>

                <div className="auth-link">
                    Already have an account?
                    <Link to="/login">Log In</Link>
                </div>
            </div>
        </div>
    );
};
export default Register;