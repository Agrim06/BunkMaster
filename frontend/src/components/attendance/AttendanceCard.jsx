import { useState } from "react";
import { markAttendance } from "../../api/attendance.api";
import { resetSubject } from "../../api/subject.api";
import CalendarView from "./CalendarView"

const AttendanceCard = ({ subject, onUpdate }) => {

    const getStatusInfo = (status) => {
        switch (status) {
            case "SAFE": return { class: "status-safe", icon: "🟢" };
            case "BORDERLINE": return { class: "status-warning", icon: "⚠️" };
            case "SHORTAGE": return { class: "status-danger", icon: "🚨" };
            default: return { class: "status-safe", icon: "•" };
        }
    };

    const statusInfo = getStatusInfo(subject.status);

    const handleAttendance = async (status) => {
        try {
            await markAttendance(subject.subject_id, status, new Date());
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Error marking attendance:", error);
        }
    };

    const handleReset = async () => {
        if (!window.confirm(`Reset all attendance for ${subject.subject_name}? This cannot be undone!`)) return;
        try {
            await resetSubject(subject.subject_id);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Error resetting subject:", error);
        }
    };

    const [showCalendar, setShowCalendar] = useState(false);

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const todayName = daysOfWeek[new Date().getDay()].toLowerCase();

    const validDays = Array.isArray(subject.days)
        ? subject.days.filter(d => typeof d === 'string' && d.trim() !== '')
        : [];

    const hasSchedule = validDays.length > 0;
    const isClassToday = !hasSchedule || validDays.some(d => {
        const dayStr = d.toLowerCase().trim();
        return dayStr.startsWith(todayName) || todayName.startsWith(dayStr);
    });

    return (
        <div className="attendance-card">
            <div className="card-header">
                <div>
                    <h3 className="subject-name">{subject.subject_name}</h3>
                    <div className="percent-label" style={{ marginTop: "6px" }}>Target: {subject.min_attendance || 75}%</div>
                </div>
                <div className="card-header-right">
                    <div className={`status-badge ${statusInfo.class}`}>
                        {statusInfo.icon} {subject.status}
                    </div>
                    <button className="card-reset-btn" onClick={handleReset} title="Reset Attendance">
                        ↺
                    </button>
                </div>
            </div>

            <div className="percentage-display">
                <div className="big-percent">{subject.attendance_percentage}%</div>
                <div className="attendance-bunk">
                    {subject.safe_bunk > 0 ? ( 
                         subject.safe_bunk > 1 ?(
                             <span style={{ color: "var(--success)" }}>You can bunk <strong>{subject.safe_bunk}</strong> classes!</span>)
                             : (<span style={{ color: "var(--success)" }}>You can bunk <strong>{subject.safe_bunk}</strong> class!</span>) 
                    ) : (
                        <span style={{ color: "var(--danger)" }}>Don't miss any more classes!</span>
                    )}
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-item">
                    <span>Attended</span>
                    <span className="stat-value">{subject.attended_count}</span>
                </div>
                <div className="stat-item">
                    <span>Missed</span>
                    <span className="stat-value">{subject.missed_count}</span>
                </div>
                <div className="stat-item">
                    <span>Total</span>
                    <span className="stat-value">{subject.attended_count + subject.missed_count}</span>
                </div>
            </div>

            <div style={{ minHeight: "50px", marginBottom: "8px" }}>
                {!isClassToday ? (
                    <div className="no-class-msg" style={{ textAlign: "center", color: "var(--warning)", fontSize: "0.9rem", backgroundColor: "rgba(255, 204, 0, 0.1)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255, 204, 0, 0.2)" }}>
                        🎉 No classes scheduled for {subject.subject_name} today!
                    </div>
                ) : (
                    <div className="class-today-msg" style={{ textAlign: "center", color: "var(--primary)", fontSize: "0.9rem", backgroundColor: "rgba(0, 242, 234, 0.1)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(0, 242, 234, 0.2)" }}>
                        📅 You have {subject.subject_name} class today!
                    </div>
                )}
            </div>

            <div className="action-buttons">
                <button className="btn-attend" onClick={() => handleAttendance(true)}>
                    ✅ Present
                </button>
                <button className="btn-miss" onClick={() => handleAttendance(false)}>
                    ❌ Absent
                </button>
                <button className="btn-history" onClick={() => setShowCalendar(!showCalendar)}>
                    {showCalendar ? "Hide Calendar" : "View History"}
                </button>
            </div>
            {showCalendar && (
                <CalendarView
                    subjectId={subject.subject_id}
                    onClose={() => setShowCalendar(false)}
                    onUpdate={onUpdate}
                />
            )}

        </div>
    );
};

export default AttendanceCard;
