import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth.api";
import "../styles/auth.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const data = await loginUser({ email, password });
            localStorage.setItem("token", data.access_token);
            navigate("/");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Invalid credentials, please try again!");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Log in to manage your attendance</p>

                <form className="auth-form" onSubmit={handleLogin}>
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

                <div className="auth-link">
                    Don't have an account?
                    <Link to="/register">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;