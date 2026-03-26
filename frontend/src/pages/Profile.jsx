import React, { useState, useEffect } from "react";
import { getMe } from "../api/auth.api";
import { getAttendanceSummary } from "../api/attendance.api";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userData, attendanceData] = await Promise.all([
                    getMe(),
                    getAttendanceSummary()
                ]);
                setUser(userData);
                setSummary(Array.isArray(attendanceData) ? attendanceData : (attendanceData?.data || []));
                setLoading(false);
            } catch (err) {
                console.error("Error fetching profile data:", err);
                setError("Failed to load profile details");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    if (loading) return <div className="profile-container"><p style={{ textAlign: "center", marginTop: "40px" }}>Loading Profile...</p></div>;
    if (error) return <div className="profile-container"><p style={{ color: "var(--danger)", textAlign: "center", marginTop: "40px" }}>{error}</p></div>;

    const totalSubjects = summary.length;
    const totalAttended = summary.reduce((acc, curr) => acc + (curr.attended_count || 0), 0);
    const totalMissed = summary.reduce((acc, curr) => acc + (curr.missed_count || 0), 0);
    const totalClasses = totalAttended + totalMissed;
    const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

    const getInitials = (name) => {
        if (!name) return "??";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusClass = (status) => {
        const s = (status || "").toUpperCase().trim();
        switch (s) {
            case "SAFE": return "pct-safe";
            case "BORDERLINE": return "pct-warning";
            case "SHORTAGE": return "pct-danger";
            default: return "pct-safe";
        }
    };

    return (
        <div className="profile-container">
            <h1 className="profile-title">My Profile</h1>

            <div className="profile-hero">
                <div className="profile-avatar-large">
                    {getInitials(user?.name)}
                </div>
                <div className="profile-info">
                    <h2 className="profile-name">{user?.name}</h2>
                    <p className="profile-email">{user?.email}</p>
                    <span className="profile-since">Member since {formatDate(user?.created_at)}</span>
                </div>
                <button className="profile-logout-btn" onClick={handleLogout}>
                    Log out
                </button>
            </div>

            <div className="profile-subjects-card">
                <div className="profile-subjects-header">Subject Breakdown</div>
                <div className="profile-subject-row header-row">
                    <span>Subject</span>
                    <span className="profile-subject-stat">Attended</span>
                    <span className="profile-subject-stat">Missed</span>
                    <span className="profile-subject-stat">Goal</span>
                    <span className="profile-subject-stat" style={{ textAlign: "right" }}>Status</span>
                </div>
                {summary.map((s) => {
                    // Fallback status calculation if backend fails/filters it
                    const status = s.status || (s.attendance_percentage < s.min_attendance ? "SHORTAGE" : (s.safe_bunk === 0 ? "BORDERLINE" : "SAFE"));
                    
                    return (
                        <div key={s.subject_id} className="profile-subject-row">
                            <span className="profile-subject-name">{s.subject_name}</span>
                            <span className="profile-subject-stat" data-label="attended">{s.attended_count}</span>
                            <span className="profile-subject-stat" data-label="missed">{s.missed_count}</span>
                            <span className="profile-subject-stat" data-label="goal">{s.min_attendance}%</span>
                            <span className="profile-subject-stat" style={{ textAlign: "right" }}>
                                <span className={`profile-pct-badge ${getStatusClass(status)}`}>
                                    {s.attendance_percentage}%
                                </span>
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Profile;
