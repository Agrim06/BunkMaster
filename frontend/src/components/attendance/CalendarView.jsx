import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import api from "../../api/axios";
import { markAttendance, deleteAttendance } from "../../api/attendance.api";
import { Check, X, Trash2, Calendar as CalendarIcon, XCircle } from "lucide-react";
import "react-calendar/dist/Calendar.css";
import "../../styles/calendar.css";

const CalendarView = ({ subjectId, subjectName, onClose, onUpdate }) => {
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    api
      .get(`/attendance/history/${subjectId}`)
      .then((res) => {
        setHistory(res.data || []);
        setLoadingHistory(false);
      })
      .catch((err) => {
        console.error("Failed to load history! ", err);
        setLoadingHistory(false);
      });
  }, [subjectId]);

  const getTileClassName = ({ date, view }) => {
    if (view !== "month") return null;

    const log = history.find(
      (h) => new Date(h.date).toDateString() === date.toDateString()
    );

    if (!log) return null;
    return log.attended ? "attended-present" : "attended-absent";
  };

  const onDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleMark = async (status) => {
    if (!selectedDate) return;
    try {
      const utcDate = new Date(
        Date.UTC(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        )
      );

      await markAttendance(subjectId, status, utcDate);
      const result = await api.get(`/attendance/history/${subjectId}`);
      setHistory(result.data || []);
      setSelectedDate(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error marking past attendance!", error);
    }
  };

  const handleClear = async () => {
    if (!selectedDate) return;
    try {
      const dateStr = selectedDate.toLocaleDateString("en-CA");
      await deleteAttendance(subjectId, dateStr);

      const result = await api.get(`/attendance/history/${subjectId}`);
      setHistory(result.data || []);
      setSelectedDate(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error clearing attendance!", error);
    }
  };

  return (
    <div className="calendar-modal-backdrop" onClick={onClose}>
      <div className="calendar-container" onClick={(e) => e.stopPropagation()}>
        <div className="calendar-header-bar">
          <div className="calendar-title-group">
            <CalendarIcon size={18} className="calendar-title-icon" />
            <h4>{subjectName ? `${subjectName} History` : "Attendance History"}</h4>
          </div>
          <button className="close-calendar-btn" onClick={onClose} title="Close Calendar">
            <X size={18} />
          </button>
        </div>

        <div className="calendar-wrapper-inner">
          <Calendar
            tileClassName={getTileClassName}
            onClickDay={onDateClick}
          />
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-dot present"></span>
            <span>Present</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot absent"></span>
            <span>Absent</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot unmarked"></span>
            <span>No record (tap to log)</span>
          </div>
        </div>

        {selectedDate && (
          <div className="date-popup-overlay" onClick={() => setSelectedDate(null)}>
            <div className="date-popup" onClick={(e) => e.stopPropagation()}>
              <div className="date-popup-header">
                <span className="date-popup-label">Log Attendance for</span>
                <span className="date-popup-val">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </div>

              <div className="popup-actions">
                <button onClick={() => handleMark(true)} className="btn-popup-present">
                  <Check size={16} />
                  <span>Mark Present</span>
                </button>
                <button onClick={() => handleMark(false)} className="btn-popup-absent">
                  <X size={16} />
                  <span>Mark Absent</span>
                </button>
                <button onClick={handleClear} className="btn-popup-clear">
                  <Trash2 size={16} />
                  <span>Clear Record</span>
                </button>
                <button onClick={() => setSelectedDate(null)} className="btn-popup-cancel">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;