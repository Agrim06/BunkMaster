import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAttendanceSummary } from "../api/attendance.api";
import AttendanceCard from "../components/attendance/AttendanceCard";
import {
  LayoutDashboard,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  BookPlus,
  Calendar,
  Sparkles
} from "lucide-react";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAttendance = () => {
    getAttendanceSummary()
      .then((data) => {
        if (Array.isArray(data)) {
          setSummary(data);
        } else if (Array.isArray(data?.data)) {
          setSummary(data.data);
        } else {
          setSummary([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load attendance summary");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  // Compute high-level metrics
  const totalSubjects = summary.length;
  const totalAttended = summary.reduce((acc, curr) => acc + (curr.attended_count || 0), 0);
  const totalMissed = summary.reduce((acc, curr) => acc + (curr.missed_count || 0), 0);
  const totalClasses = totalAttended + totalMissed;
  const overallPercentage =
    totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

  const safeSubjectsCount = summary.filter(
    (s) => s.status === "SAFE" || (s.safe_bunk > 0)
  ).length;

  const warningSubjectsCount = summary.filter(
    (s) => s.status === "BORDERLINE" || s.status === "SHORTAGE"
  ).length;

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayName = daysOfWeek[new Date().getDay()].toLowerCase();

  const classesTodayCount = summary.filter((s) => {
    const validDays = Array.isArray(s.days)
      ? s.days.filter((d) => typeof d === "string" && d.trim() !== "")
      : [];
    return (
      validDays.length === 0 ||
      validDays.some((d) => {
        const dayStr = d.toLowerCase().trim();
        return dayStr.startsWith(todayName) || todayName.startsWith(dayStr);
      })
    );
  }).length;

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading-state">
          <div className="loading-spinner"></div>
          <p>Loading attendance overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error-state">
          <AlertTriangle size={32} />
          <p>{error}</p>
          <button onClick={loadAttendance} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header & KPI Metrics */}
      <div className="dashboard-header-block">
        <div className="dashboard-header-text">
          <h1 className="dashboard-title">Attendance Overview</h1>
          <p className="dashboard-subtitle">
            Live academic metrics, bunk predictions, and attendance logs
          </p>
        </div>

        <Link to="/subjects" className="btn-add-subject-top">
          <BookPlus size={16} />
          <span>Manage Subjects</span>
        </Link>
      </div>

      {totalSubjects > 0 && (
        <div className="kpi-metrics-grid">
          <div className="kpi-card">
            <div className="kpi-icon-wrapper primary">
              <TrendingUp size={20} />
            </div>
            <div className="kpi-details">
              <span className="kpi-label">Overall Average</span>
              <div className="kpi-value-row">
                <span className="kpi-number">{overallPercentage}%</span>
                <span
                  className={`kpi-badge ${
                    overallPercentage >= 75 ? "safe" : "danger"
                  }`}
                >
                  {overallPercentage >= 75 ? "Eligible" : "Shortage"}
                </span>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrapper success">
              <CheckCircle2 size={20} />
            </div>
            <div className="kpi-details">
              <span className="kpi-label">Safe Subjects</span>
              <div className="kpi-value-row">
                <span className="kpi-number">
                  {safeSubjectsCount}
                  <span className="kpi-total">/{totalSubjects}</span>
                </span>
                <span className="kpi-badge safe">Above Target</span>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrapper warning">
              <AlertTriangle size={20} />
            </div>
            <div className="kpi-details">
              <span className="kpi-label">Needs Attention</span>
              <div className="kpi-value-row">
                <span className="kpi-number text-warning">{warningSubjectsCount}</span>
                <span className="kpi-badge warning">
                  {warningSubjectsCount === 0 ? "All Clear" : "Watch Out"}
                </span>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrapper cyan">
              <Calendar size={20} />
            </div>
            <div className="kpi-details">
              <span className="kpi-label">Classes Scheduled Today</span>
              <div className="kpi-value-row">
                <span className="kpi-number">{classesTodayCount}</span>
                <span className="kpi-badge neutral">
                  {daysOfWeek[new Date().getDay()]}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid or Empty State */}
      {summary.length === 0 ? (
        <div className="dashboard-empty-state">
          <div className="empty-icon-wrapper">
            <BookPlus size={36} />
          </div>
          <h3>No subjects added yet</h3>
          <p>Configure your course subjects and timetables to unlock automated attendance tracking.</p>
          <Link to="/subjects" className="btn-hero-primary" style={{ marginTop: "16px" }}>
            <BookPlus size={16} />
            <span>Add Your First Subject</span>
          </Link>
        </div>
      ) : (
        <div className="attendance-grid">
          {summary.map((subject) => (
            <AttendanceCard
              key={subject.subject_id}
              subject={subject}
              onUpdate={loadAttendance}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;