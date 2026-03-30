import React from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

const Home = () => {
    const isLoggedIn = !!localStorage.getItem("token");

    return (
        <div className="home-container">
            {/* Ambient Background Blobs */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Master Your <span className="gradient-text">Attendance</span> <br />
                        Like a Pro.
                    </h1>
                    <p className="hero-subtitle">
                        Automate your schedule, track your bunks, and never worry about 
                        falling below 75% again. The ultimate dashboard for students.
                    </p>
                    <div className="hero-actions">
                        {isLoggedIn ? (
                            <Link to="/dashboard" className="btn-primary">
                                Go to Dashboard
                                <span className="btn-icon">→</span>
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn-primary">
                                    Get Started!
                                    {/* <span className="btn-icon">→</span> */}
                                </Link>
                                <Link to="/login" className="btn-secondary">
                                    Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                
                {/* Floating Preview Card */}
                <div className="hero-visual">
                    <div className="attendance-card preview-floating">
                        <div className="card-header">
                            <div>
                                <h3 className="subject-name">Mathematics</h3>
                                <div className="percent-label" style={{ marginTop: "6px" }}>Target: 75%</div>
                            </div>
                            <div className="card-header-right">
                                <div className="status-badge status-safe">
                                     🟢 SAFE
                                </div>
                                <button className="card-reset-btn" title="Reset Attendance">
                                    ↺
                                </button>
                            </div>
                        </div>

                        <div className="percentage-display">
                            <div className="big-percent">82%</div>
                            <div className="attendance-bunk">
                                 <span style={{ color: "var(--success)" }}>You can bunk <strong>2</strong> classes!</span>
                            </div>
                        </div>

                        <div className="stats-row">
                            <div className="stat-item">
                                <span>Attended</span>
                                <span className="stat-value">12</span>
                            </div>
                            <div className="stat-item">
                                <span>Missed</span>
                                <span className="stat-value">2</span>
                            </div>
                            <div className="stat-item">
                                <span>Total</span>
                                <span className="stat-value">14</span>
                            </div>
                        </div>

                        <div className="action-buttons">
                            <button className="btn-attend">
                                ✅ Present
                            </button>
                            <button className="btn-miss">
                                ❌ Absent
                            </button>
                            <button className="btn-history">
                                View History
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="features-section">
                 <h2 className="section-title">Built for Performance</h2>
                 <div className="features-grid">
                     <div className="feature-card glass">
                         <div className="feature-icon">📊</div>
                         <h3>Live Dashboard</h3>
                         <p>Get a real-time overview of your attendance across all subjects in one place.</p>
                     </div>
                     <div className="feature-card glass">
                         <div className="feature-icon">📅</div>
                         <h3>Smart Calendar</h3>
                         <p>Log classes easily with our integrated calendar. Track history with precision.</p>
                     </div>
                     <div className="feature-card glass">
                         <div className="feature-icon">⚡</div>
                         <h3>Quick Actions</h3>
                         <p>Mark attended or missed in a single tap. Correct mistakes with the clear feature.</p>
                     </div>
                 </div>
            </section>


            <footer className="home-footer">
                <p>© 2026 BunkMaster. Made for students, by students.</p>
            </footer>
        </div>
    );
};

export default Home;
