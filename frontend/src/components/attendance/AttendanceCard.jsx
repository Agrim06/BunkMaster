import { markAttendance } from "../../api/attendance.api";

const AttendanceCard = ({ subject, onUpdate }) => {

    // Helper for Status Colors
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
            await markAttendance(subject.subject_id, status);
            if (onUpdate) onUpdate(); // Refresh data after update
        } catch (error) {
            console.error("Error marking attendance:", error);
        }
    };

    return (
        <div className="attendance-card">
            <div className="card-header">
                <div>
                    <h3 className="subject-name">{subject.subject_name}</h3>
                    <div className="percent-label">Target: {subject.min_attendance || 75}%</div>
                </div>
                <div className={`status-badge ${statusInfo.class}`}>
                    {statusInfo.icon} {subject.status}
                </div>
            </div>

            <div className="percentage-display">
                <div className="big-percent">{subject.attendance_percentage}%</div>
                <div className="attendance-bunk">
                    {subject.safe_bunk > 0 ? (
                        <span style={{ color: "var(--success)" }}>You can bunk <strong>{subject.safe_bunk}</strong> class(es)</span>
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

            <div className="action-buttons">
                <button className="btn-attend" onClick={() => handleAttendance(true)}>
                    ✅ Present
                </button>
                <button className="btn-miss" onClick={() => handleAttendance(false)}>
                    ❌ Absent
                </button>
            </div>
        </div>
    );
};

export default AttendanceCard;
