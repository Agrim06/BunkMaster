import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Check,
  X
} from "lucide-react";
import "../styles/home.css";

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      {/* Ambient Radial Lights */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Master Your Attendance, <br />
            <span className="gradient-text">Never Fall Below 75%.</span>
          </h1>

          <p className="hero-subtitle">
            Calculate exactly how many classes you can afford to miss, schedule your routine, and keep your eligibility rock-solid with real-time academic tracking.
          </p>

          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-hero-primary">
                <span>Go to Dashboard</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-hero-primary">
                  <span>Start Free Now</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-hero-secondary">
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>

          <div className="hero-trust-row">
            <div className="trust-item">
              <ShieldCheck size={16} className="trust-icon" />
              <span>Zero-Math Automated Tracking</span>
            </div>
            <div className="trust-item">
              <Zap size={16} className="trust-icon" />
              <span>One-Tap Attendance Logging</span>
            </div>
          </div>
        </div>

        {/* Floating Interactive-Style Preview Card */}
        <div className="hero-visual">
          <div className="preview-card-wrapper">
            <div className="preview-glow"></div>
            <div className="preview-attendance-card">
              <div className="preview-card-header">
                <div>
                  <span className="preview-subject-tag">Computer Networks</span>
                  <div className="preview-target-pill">Target: 75%</div>
                </div>
                <div className="preview-status-badge badge-safe">
                  <span className="status-dot"></span>
                  <span>SAFE</span>
                </div>
              </div>

              <div className="preview-progress-block">
                <div className="preview-percentage-row">
                  <div className="preview-percentage-value">85.7%</div>
                  <div className="preview-bunk-pill safe">
                    <CheckCircle2 size={14} />
                    <span>You can bunk <strong>2</strong> classes!</span>
                  </div>
                </div>
                <div className="preview-progress-bar-bg">
                  <div className="preview-progress-bar-fill" style={{ width: "85.7%" }}></div>
                  <div className="preview-target-marker" style={{ left: "75%" }} title="75% Target"></div>
                </div>
              </div>

              <div className="preview-stats-grid">
                <div className="preview-stat-cell">
                  <span className="stat-label">Attended</span>
                  <span className="stat-num text-success">12</span>
                </div>
                <div className="preview-stat-cell">
                  <span className="stat-label">Missed</span>
                  <span className="stat-num text-danger">2</span>
                </div>
                <div className="preview-stat-cell">
                  <span className="stat-label">Total Held</span>
                  <span className="stat-num">14</span>
                </div>
              </div>

              <div className="preview-class-alert">
                <Calendar size={14} />
                <span>Class scheduled today at 10:00 AM</span>
              </div>

              <div className="preview-actions">
                <div className="preview-btn-mock btn-present-mock">
                  <Check size={14} />
                  <span>Present</span>
                </div>
                <div className="preview-btn-mock btn-absent-mock">
                  <X size={14} />
                  <span>Absent</span>
                </div>
                <div className="preview-btn-mock btn-calendar-mock">
                  <Calendar size={14} />
                  <span>History</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2026 BunkMaster. Crafted with precision for college students.</p>
      </footer>
    </div>
  );
};

export default Home;
