import React, { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import api from "../../api/axios";
import { markAttendance } from "../../api/attendance.api"
import "react-calendar/dist/Calendar.css";
import "../../styles/calendar.css"

const CalendarView = ({ subjectId, onClose }) => {
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
        } catch (error) {
            console.error("Error marking past attendance!", error);
        }
    }

    return (
        <div className="calendar-container">
            {selectedDate && (
                <div className="date-popup">
                    <p>Mark for {selectedDate.toDateString()}</p>
                    <div className="popup-actions">
                        <button onClick={() => handleMark(true)} className="btn-present">Present</button>
                        <button onClick={() => handleMark(false)} className="btn-absent">Absent</button>
                        <button onClick={() => setSelectedDate(null)} className="btn-cancel">Cancel</button>
                    </div>
                </div>
            )}
            <button className="close-calendar-btn" onClick={onClose}>×</button>
            <Calendar
                tileClassName={getTileClassName}
                onClickDay={onDateClick}
            />
            <style>{`
                .attended-present { background: #056c1dff !important; color: #155724; }
                .attended-absent { background: #ed1023ff !important; color: #721c24; }
                .react-calendar { width: 100%; border: none;border-radius : 5px; background: white; color: black }
                
                .close-calendar-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: transparent;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #333;
                    z-index: 60;
                }
                .close-calendar-btn:hover {
                    color: red;
                }
            `}</style>
        </div>
    );
};

export default CalendarView;