import React, { useState, useEffect } from "react";
import { getMe } from "../api/auth.api";
import { getAttendanceSummary } from "../api/attendance.api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  User,
  Mail,
  Calendar,
  LogOut,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  BookOpen,
  Award
} from "lucide-react";
import "../styles/profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(authUser);
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
        setSummary(
          Array.isArray(attendanceData)
            ? attendanceData
            : attendanceData?.data || []
        );
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile details");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading-state">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-error-state">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const totalSubjects = summary.length;
  const totalAttended = summary.reduce(
    (acc, curr) => acc + (curr.attended_count || 0),
    0
  );
  const totalMissed = summary.reduce(
    (acc, curr) => acc + (curr.missed_count || 0),
    0
  );
  const totalClasses = totalAttended + totalMissed;
  const overallPercentage =
    totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

  const getInitials = (name) => {
    if (!name) return "ST";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusBadge = (status, pct, minTarget) => {
    const s = (status || "").toUpperCase().trim();
    if (s === "SAFE" || pct >= minTarget) {
      return {
        className: "badge-safe",
        label: "SAFE",
        icon: <CheckCircle2 size={12} />
      };
    }
    if (s === "BORDERLINE") {
      return {
        className: "badge-warning",
        label: "BORDERLINE",
        icon: <AlertTriangle size={12} />
      };
    }
    return {
      className: "badge-danger",
      label: "SHORTAGE",
      icon: <AlertOctagon size={12} />
    };
  };

  return (
    <div className="profile-container">
      <div className="profile-header-bar">
        <h1 className="profile-title">Account Profile</h1>
      </div>

      {/* Hero Profile Card */}
      <div className="profile-hero-card">
        <div className="profile-avatar-large">
          {getInitials(user?.name)}
        </div>

        <div className="profile-hero-info">
          <div className="profile-name-row">
            <h2 className="profile-user-name">{user?.name || "Student"}</h2>
            <span className="member-since-pill">
              <Calendar size={13} />
              <span>Joined {formatDate(user?.created_at)}</span>
            </span>
          </div>

          <div className="profile-email-row">
            <Mail size={15} />
            <span>{user?.email}</span>
          </div>
        </div>

        <button className="profile-logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Academic Summary KPI Row */}
      <div className="profile-stats-grid">
        <div className="profile-stat-box">
          <div className="stat-box-icon primary">
            <BookOpen size={18} />
          </div>
          <div className="stat-box-data">
            <span className="stat-box-label">Total Courses</span>
            <span className="stat-box-num">{totalSubjects}</span>
          </div>
        </div>

        <div className="profile-stat-box">
          <div className="stat-box-icon success">
            <CheckCircle2 size={18} />
          </div>
          <div className="stat-box-data">
            <span className="stat-box-label">Classes Attended</span>
            <span className="stat-box-num text-success">{totalAttended}</span>
          </div>
        </div>

        <div className="profile-stat-box">
          <div className="stat-box-icon danger">
            <AlertOctagon size={18} />
          </div>
          <div className="stat-box-data">
            <span className="stat-box-label">Classes Missed</span>
            <span className="stat-box-num text-danger">{totalMissed}</span>
          </div>
        </div>

        <div className="profile-stat-box">
          <div className="stat-box-icon cyan">
            <Award size={18} />
          </div>
          <div className="stat-box-data">
            <span className="stat-box-label">Overall Rate</span>
            <span className="stat-box-num">{overallPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Subject Breakdown Card */}
      <div className="profile-breakdown-card">
        <div className="breakdown-card-header">
          <h3>Subject Breakdown</h3>
          <span className="breakdown-count-tag">{summary.length} Subjects Tracked</span>
        </div>

        {summary.length === 0 ? (
          <div className="breakdown-empty">
            <p>No subject statistics available yet.</p>
          </div>
        ) : (
          <div className="breakdown-table-wrapper">
            <div className="breakdown-table-header">
              <span className="col-subject">Subject</span>
              <span className="col-stat">Attended</span>
              <span className="col-stat">Missed</span>
              <span className="col-stat">Target</span>
              <span className="col-stat">Current %</span>
              <span className="col-status">Status</span>
            </div>

            <div className="breakdown-table-body">
              {summary.map((s) => {
                const badge = getStatusBadge(
                  s.status,
                  s.attendance_percentage,
                  s.min_attendance || 75
                );

                return (
                  <div key={s.subject_id} className="breakdown-row">
                    <div className="col-subject">
                      <span className="subject-item-name">{s.subject_name}</span>
                      <span className="subject-item-sub">
                        {s.classes_per_week ? `${s.classes_per_week} classes/wk` : ""}
                      </span>
                    </div>

                    <div className="col-stat" data-label="Attended">
                      <span className="stat-val text-success">{s.attended_count || 0}</span>
                    </div>

                    <div className="col-stat" data-label="Missed">
                      <span className="stat-val text-danger">{s.missed_count || 0}</span>
                    </div>

                    <div className="col-stat" data-label="Target">
                      <span className="stat-val">{s.min_attendance || 75}%</span>
                    </div>

                    <div className="col-stat" data-label="Current">
                      <span className="stat-val font-bold">
                        {s.attendance_percentage}%
                      </span>
                    </div>

                    <div className="col-status" data-label="Status">
                      <span className={`status-pill ${badge.className}`}>
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
