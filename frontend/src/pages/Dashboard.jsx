import React, { useState, useEffect } from "react";
import { getAttendanceSummary } from "../api/attendance.api";
import AttendanceCard from "../components/attendance/AttendanceCard";
import "../styles/dashboard.css"; // Ensure styles are imported

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

  if (loading) {
    return (
      <div className="dashboard-container">
        <p style={{ textAlign: "center", marginTop: "40px", color: "var(--text-secondary)" }}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <p style={{ color: "var(--danger)", textAlign: "center", marginTop: "40px" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Attendance Overview</h1>
        <p className="dashboard-subtitle">Track your progress and stay safe.</p>
      </div>

      {summary.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>No attendance data available. Add subjects to get started.</p>
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