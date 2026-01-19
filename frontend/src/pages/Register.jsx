import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth.api";
import "../styles/auth.css";


const Register = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [minAttendance, setMinAttendance] = useState(75);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await registerUser({ name, email, password, min_attendance: parseInt(minAttendance) });
            console.log(response);
            navigate("/login");
        } catch (error) {
            console.log(error);
            setError("Registration failed");
        }
    };

    return (
        <div className="auth-container">
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
                    <div>
                        <label className="auth-label">
                            Minimum Attendance Goal: <strong style={{ color: "var(--primary)" }}>{minAttendance}%</strong>
                        </label>
                        <input
                            type="range"
                            min="50"
                            max="100"
                            step="5"
                            value={minAttendance}
                            onChange={(e) => setMinAttendance(e.target.value)}
                            className="auth-range"
                        />
                    </div>
                    {error && <div className="auth-error">⚠️ {error}</div>}
                    <button className="auth-button" type="submit">
                        Sign Up
                    </button>
                </form>
                <div className="auth-link">
                    Already have an account?
                    <Link to="/login">Log In</Link>
                </div>
            </div>
        </div>
    );
};
export default Register;