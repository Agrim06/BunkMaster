import React from "react";
import {useState, useEffect} from "react";
import { getAttendanceSummary } from "../api/attendance.api";
import AttendanceCard from "../components/attendance/AttendanceCard"

const Dashboard = () =>{
    const [summary , setSummary] = useState([]);
    const [loading , setLoading] = useState(true);
    const [error , setError] = useState("");

    useEffect(() => {
        getAttendanceSummary()
            .then((data) => {
            console.log("Attendance summary response:", data);

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
}, []);
  
  if (loading) {
    return (
      <div className="dashboard">
        <p>Loading attendance summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Attendance Overview</h1>

      {summary.length === 0 ? (
        <p>No attendance data available. Add subjects to get started.</p>
      ) : (
        <div className="attendance-grid">
          {summary.map((subject) => (
            <AttendanceCard
              key={subject.subject_id}
              subject={subject}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;