import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { registerUser } from "../api/auth.api";
import { User, Mail, Lock, UserPlus, AlertCircle } from "lucide-react";
import "../styles/auth.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state && location.state.from) || "/";

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

        const container = document.getElementById("googleSignUpDiv");
        if (container) {
          container.innerHTML = "";
          window.google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            width: 280,
            shape: "pill",
            text: "signup_with",
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
        remember_me: true
      });

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("authUserChanged"));
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Google login error:", err);
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
    setLoading(true);
    try {
      await registerUser({ name, email, password });
      navigate("/verify-email", { state: { email } });
    } catch (error) {
      setError("Registration failed. Email may already be in use.");
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
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Start tracking your attendance and stay eligible</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <input
              className="auth-input"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <User size={18} className="auth-input-icon" />
          </div>

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
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <button className="auth-button" type="submit" disabled={loading}>
            <UserPlus size={16} />
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
          </button>
        </form>

        <div className="auth-divider">
          <span>or register with</span>
        </div>

        <div className="social-button-container">
          <div id="googleSignUpDiv"></div>
        </div>

        <div className="auth-link">
          Already have an account?
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;