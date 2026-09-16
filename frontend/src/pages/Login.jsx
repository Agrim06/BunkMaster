import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { loginUser } from "../api/auth.api";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
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
    let timer;

    const initializeGoogle = () => {
      if (window.google && GOOGLE_CLIENT_ID) {
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
            size: "large",
            width: 280,
            shape: "pill",
            text: "signin_with",
          });
        }
      } else {
        timer = setTimeout(initializeGoogle, 500);
      }
    };

    initializeGoogle();

    return () => {
      if (timer) clearTimeout(timer);
    };
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
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to track your attendance and calculate bunks</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <input
              className="auth-input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Mail size={18} className="auth-input-icon" />
          </div>

          <div className="auth-input-group">
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Lock size={18} className="auth-input-icon" />
          </div>

          <div className="auth-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button className="auth-button" type="submit" disabled={loading}>
            <LogIn size={16} />
            <span>{loading ? "Signing in..." : "Sign In"}</span>
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        {/* Google Sign In */}
        <div className="social-button-container">
          <div id="googleSignInDiv"></div>
        </div>

        <div className="auth-link">
          Don't have an account?
          <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;