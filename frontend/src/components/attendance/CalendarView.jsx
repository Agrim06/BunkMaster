import React, { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import api from "../../api/axios";
import { markAttendance, deleteAttendance } from "../../api/attendance.api"
import "react-calendar/dist/Calendar.css";
import "../../styles/calendar.css"

const CalendarView = ({ subjectId, onClose, onUpdate }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        api.get(`/attendance/history/${subjectId}`)
            .then(res => setHistory(res.data))
            .catch(err => console.error("Failed to load history! ", err));
    }, [subjectId]);

    const getTileClassName = ({ date, view }) => {
        if (view != 'month') return null;

        const log = history.find(h =>
            new Date(h.date).toDateString() === date.toDateString()
        );

        if (!log) return null;
        return log.attended ? `attended-present` : `attended-absent`;
    };

    const [selectedDate, setSelectedDate] = useState(null);

    const onDateClick = (date) => {
        setSelectedDate(date);
    }

    const handleMark = async (status) => {
        if (!selectedDate) return;
        try {
            const utcDate = new Date(Date.UTC(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate()
            ));

            await markAttendance(subjectId, status, utcDate);
            const result = await api.get(`/attendance/history/${subjectId}`);
            setHistory(result.data);
            setSelectedDate(null);
            if (onUpdate) onUpdate(); 
        } catch (error) {
            console.error("Error marking past attendance!", error);
        }
    }

    const handleClear = async () => {
        if (!selectedDate) return;
        try {
            const dateStr = selectedDate.toLocaleDateString('en-CA'); 
            await deleteAttendance(subjectId, dateStr);
            
            const result = await api.get(`/attendance/history/${subjectId}`);
            setHistory(result.data);
            setSelectedDate(null);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Error clearing attendance!", error);
            alert("Failed to clear attendance!");
        }
    }

    return (
        <div className="calendar-container">
            <button className="close-calendar-btn" onClick={onClose} title="Close History">×</button>
            <h4 style={{ marginBottom: "15px", color: "var(--primary)", textAlign: "center" }}>Attendance History</h4>
            
            <Calendar
                tileClassName={getTileClassName}
                onClickDay={onDateClick}
            />

            {selectedDate && (
                <div className="date-popup">
                    <p>Mark attendance for<br/><span style={{ color: "var(--primary)" }}>{selectedDate.toLocaleDateString()}</span></p>
                    <div className="popup-actions">
                        <button onClick={() => handleMark(true)} className="btn-present">✅ Present</button>
                        <button onClick={() => handleMark(false)} className="btn-absent">❌ Absent</button>
                        <button onClick={handleClear} className="btn-clear">🗑️ Clear</button>
                        <button onClick={() => setSelectedDate(null)} className="btn-cancel">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;