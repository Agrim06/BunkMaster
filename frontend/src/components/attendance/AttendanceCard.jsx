import { useState } from "react";
import { markAttendance } from "../../api/attendance.api";
import { resetSubject } from "../../api/subject.api";
import CalendarView from "./CalendarView";
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  RotateCcw,
  Check,
  X,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock
} from "lucide-react";

const AttendanceCard = ({ subject, onUpdate }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const getStatusConfig = (status) => {
    switch (status) {
      case "SAFE":
        return {
          class: "status-safe",
          label: "SAFE",
          icon: <CheckCircle2 size={13} />
        };
      case "BORDERLINE":
        return {
          class: "status-warning",
          label: "BORDERLINE",
          icon: <AlertTriangle size={13} />
        };
      case "SHORTAGE":
        return {
          class: "status-danger",
          label: "SHORTAGE",
          icon: <AlertOctagon size={13} />
        };
      default:
        return {
          class: "status-safe",
          label: "SAFE",
          icon: <CheckCircle2 size={13} />
        };
    }
  };

  const statusConfig = getStatusConfig(subject.status);

  // Optimistic local state overrides
  const [optimisticDelta, setOptimisticDelta] = useState({ attended: 0, missed: 0 });

  const handleAttendance = async (status) => {
    if (isMarking) return;
    setIsMarking(true);

    // 1. INSTANT (0ms): Optimistically bump the attended/missed counts locally
    setOptimisticDelta((prev) => ({
      attended: prev.attended + (status ? 1 : 0),
      missed: prev.missed + (status ? 0 : 1),
    }));

    try {
      await markAttendance(subject.subject_id, status, new Date());
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error marking attendance:", error);
      // Rollback on error
      setOptimisticDelta((prev) => ({
        attended: prev.attended - (status ? 1 : 0),
        missed: prev.missed - (status ? 0 : 1),
      }));
      alert("Failed to mark attendance. Please check your connection.");
    } finally {
      setIsMarking(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(`Reset all attendance for "${subject.subject_name}"? This cannot be undone.`)) return;
    try {
      await resetSubject(subject.subject_id);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error resetting subject:", error);
    }
  };

  // Reset optimistic delta when fresh subject data arrives from parent
  useEffect(() => {
    setOptimisticDelta({ attended: 0, missed: 0 });
  }, [subject.attended_count, subject.missed_count]);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayName = daysOfWeek[new Date().getDay()].toLowerCase();

  const validDays = Array.isArray(subject.days)
    ? subject.days.filter((d) => typeof d === "string" && d.trim() !== "")
    : [];

  const hasSchedule = validDays.length > 0;
  const isClassToday =
    !hasSchedule ||
    validDays.some((d) => {
      const dayStr = d.toLowerCase().trim();
      return dayStr.startsWith(todayName) || todayName.startsWith(dayStr);
    });

  const attendedCount = (subject.attended_count || 0) + optimisticDelta.attended;
  const missedCount = (subject.missed_count || 0) + optimisticDelta.missed;
  const totalClasses = attendedCount + missedCount;
  const targetPct = subject.min_attendance || 75;
  const currentPct = totalClasses > 0 
    ? Math.round((attendedCount / totalClasses) * 100) 
    : (subject.attendance_percentage ?? 0);

  // Dynamic safe bunk calculation
  const safeBunk = currentPct >= targetPct
    ? Math.max(0, Math.floor((100 * attendedCount - targetPct * totalClasses) / targetPct))
    : 0;

  // Calculate classes needed if shortage
  const getBunkGuidance = () => {
    if (safeBunk > 0) {
      return {
        type: "safe",
        text: (
          <span>
            You can safely bunk <strong>{safeBunk}</strong> {safeBunk === 1 ? "class" : "classes"}!
          </span>
        ),
        icon: <CheckCircle2 size={14} />
      };
    }

    if (currentPct >= targetPct) {
      return {
        type: "warning",
        text: <span>On the threshold! Don't miss next class.</span>,
        icon: <AlertTriangle size={14} />
      };
    }

    // Shortage formula: (target * total - 100 * attended) / (100 - target)
    const needed = Math.max(
      1,
      Math.ceil((targetPct * totalClasses - 100 * attendedCount) / (100 - targetPct))
    );

    return {
      type: "danger",
      text: (
        <span>
          Attend next <strong>{needed}</strong> {needed === 1 ? "class" : "classes"} to recover!
        </span>
      ),
      icon: <TrendingUp size={14} />
    };
  };

  const guidance = getBunkGuidance();

  return (
    <div className="attendance-card">
      <div className="card-header">
        <div className="card-header-left">
          <h3 className="subject-name" title={subject.subject_name}>
            {subject.subject_name}
          </h3>
          <div className="target-badge-pill">
            Target: <strong>{targetPct}%</strong>
          </div>
        </div>

        <div className="card-header-right">
          <div className={`status-chip ${statusConfig.class}`}>
            <span className="status-pulse-dot"></span>
            {statusConfig.label}
          </div>
          <button
            className="card-reset-icon-btn"
            onClick={handleReset}
            title="Reset Attendance History"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Main Percentage & Progress Bar Block */}
      <div className="card-progress-section">
        <div className="card-percentage-row">
          <div className="percentage-numeric">
            <span className="big-percent">{currentPct}%</span>
            <span className="percent-unit">Attendance</span>
          </div>

          <div className={`bunk-guidance-pill ${guidance.type}`}>
            {guidance.icon}
            {guidance.text}
          </div>
        </div>

        <div className="progress-track">
          <div
            className={`progress-fill ${guidance.type}`}
            style={{ width: `${Math.min(100, Math.max(0, currentPct))}%` }}
          ></div>
          <div
            className="target-threshold-marker"
            style={{ left: `${Math.min(100, Math.max(0, targetPct))}%` }}
            title={`Target: ${targetPct}%`}
          ></div>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-label">Attended</span>
          <span className="stat-value text-success">{attendedCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Missed</span>
          <span className="stat-value text-danger">{missedCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Held</span>
          <span className="stat-value">{totalClasses}</span>
        </div>
      </div>

      {/* Today's Schedule Indicator */}
      <div className="schedule-status-banner">
        {isClassToday ? (
          <div className="schedule-today-pill">
            <Clock size={14} />
            <span>Class scheduled for today</span>
          </div>
        ) : (
          <div className="schedule-off-pill">
            <Calendar size={14} />
            <span>No class scheduled today</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="btn-attend"
          onClick={() => handleAttendance(true)}
          disabled={isMarking}
        >
          <Check size={16} />
          <span>Present</span>
        </button>

        <button
          className="btn-miss"
          onClick={() => handleAttendance(false)}
          disabled={isMarking}
        >
          <X size={16} />
          <span>Absent</span>
        </button>

        <button
          className={`btn-history ${showCalendar ? "active" : ""}`}
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <Calendar size={15} />
          <span>{showCalendar ? "Close" : "Calendar"}</span>
        </button>
      </div>

      {showCalendar && (
        <CalendarView
          subjectId={subject.subject_id}
          subjectName={subject.subject_name}
          onClose={() => setShowCalendar(false)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

export default AttendanceCard;
