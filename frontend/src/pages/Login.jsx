import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { loginUser } from "../api/auth.api";
import "../styles/auth.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log("Google Client ID in React:", GOOGLE_CLIENT_ID);
console.log("window.google exists:", !!window.google);

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state && location.state.from) || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isValidEmail = (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

    useEffect(() => {
        if (window.google && GOOGLE_CLIENT_ID) {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse,

                // ✅ IMPORTANT FIXES
                auto_select: false,        // disables One Tap
                cancel_on_tap_outside: true,
                ux_mode: "popup",          // forces popup, no iframe
            });

            window.google.accounts.id.renderButton(
                document.getElementById("googleSignInDiv"),
                {
                    theme: "outline",
                    size: "large",
                    width: 250,
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
                err?.response?.data?.message || "Google login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!isValidEmail(email)) {
            setError("Please enter a valid email address..");
            return;
        }

        if (!password || password.length < 6) {
            setError("Password must be at least 6 characters long..");
            return;
        }

        setLoading(true);

        try {

            const data = await loginUser({ email, password });
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));

            window.dispatchEvent(new Event("authUserChanged"))
            navigate(from, { replace: true });
        } catch (err) {
            console.error(err);
            setError(
                err?.response?.data?.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Log in to manage your attendance</p>

                <form className="auth-form" onSubmit={handleSubmit}>
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

                    {error && <p style={{ color: "var(--danger)", textAlign: "center", fontSize: "14px" }}>{error}</p>}

                    <button className="auth-button" type="submit">
                        Log In
                    </button>
                </form>

                <div style={{ margin: "16px 0", textAlign: "center", color: "#6c757d" }}>
                    <span>or</span>
                </div>

                {/* Google Sign In button */}
                <div id="googleSignInDiv" style={{ display: "flex", justifyContent: "center" }}></div>

                <div className="auth-link">
                    Don't have an account?
                    <Link to="/register">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;