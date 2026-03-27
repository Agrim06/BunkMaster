import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { loginUser } from "../api/auth.api";
import "../styles/auth.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state && location.state.from) || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  useEffect(() => {
    if (!window.google || !GOOGLE_CLIENT_ID) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
      ux_mode: "popup",
    });

    const container = document.getElementById("googleSignInDiv");

    if (container) {
      container.innerHTML = ""; // prevents duplicate button render

      window.google.accounts.id.renderButton(container, {
        theme: "outline",
        size: "medium",
        width: 200,
        shape: "rectangular",
        text: "signin_with",
      });
    }
  }, []);

  async function handleGoogleResponse(response) {
    try {
      setError("");
      setLoading(true);

      const { data } = await api.post("/google-login", {
        idToken: response.credential,
        remember_me: rememberMe,
      });

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", data.access_token);
      storage.setItem("user", JSON.stringify(data.user));

      window.dispatchEvent(new Event("authUserChanged"));

      navigate(from, { replace: true });
    } catch (err) {
      console.log(err);
      setError(
        err?.response?.data?.message ||
          "Google login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser({ email, password, remember_me: rememberMe });

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", data.access_token);
      storage.setItem("user", JSON.stringify(data.user));

      window.dispatchEvent(new Event("authUserChanged"));

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
      <div className="bg-blob"></div>
      <div className="bg-blob bg-blob-2"></div>
      <div className="bg-blob bg-blob-3"></div>
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back!</h2>
        <p className="auth-subtitle">Log in to your account</p>

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

          <div className="auth-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>
            <Link to="/forgot-password" style={{ color: 'var(--text-secondary)', fontSize: '13px', textDecoration: 'none', fontWeight: '500', opacity: 0.8 }}>
              Forgot Password?
            </Link>
          </div>

          {error && (
            <p
              style={{
                color: "var(--danger)",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              {error}
            </p>
          )}

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        {/* Google Sign In */}
        <div className="social-button-container">
          <div id="googleSignInDiv"></div>
        </div>

        <div className="auth-link">
          Don't have an account?
          <Link to="/register"> Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;