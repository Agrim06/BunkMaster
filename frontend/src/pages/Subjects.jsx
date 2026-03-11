import { useEffect, useState } from "react";
import { getSubjects, addSubject, deleteSubject } from "../api/subject.api"
import "../styles/subjects.css"

const Subjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [classesPerWeek, setClassesPerWeek] = useState("");
    const [days, setDays] = useState([]);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [minAttendance, setMinAttendance] = useState("");

    const loadSubjects = () => {
        getSubjects()
            .then((data) => {
                setSubjects(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        loadSubjects();
    }, []);

    const handleAddSubject = async (e) => {
        e.preventDefault();

        console.log("Sending subject:", { name });

        if (!name.trim()) return;

        const classesInt = parseInt(classesPerWeek, 10);
        if (isNaN(classesInt) || classesInt <= 0) {
            alert("Please enter a valid number for classes per week.");
            return;
        }

        try {
            await addSubject({
                name,
                classes_per_week: parseInt(classesPerWeek, 10),
                days,
                min_attendance: minAttendance ? parseInt(minAttendance, 10) : 75
            });
            setName("");
            setClassesPerWeek("");
            setDays([]);
            loadSubjects();
            setMinAttendance("");
        } catch (error) {
            console.error("Error adding subject:", error);
        }
    };

    const handleDeleteSubject = async (id) => {
        if (!window.confirm("Are you sure you want to delete this permanently?")) return;

        try {
            await deleteSubject(id);
            setSubjects(subjects.filter((s) => (s._id || s.id !== id)));
        } catch (error) {
            console.error("Error deleting subject:", error);
            alert("Error deleting subject!");
        }

    }
    return (
        <div className="subjects-container">
            <h1 className="subjects-title">Manage your subjects</h1>

            <div className="subjects-content">
                <form onSubmit={handleAddSubject} className="add-subject-form">
                    <div className="form-group">
                        <div className="form-grid">
                            <div className="input-wrapper full-width">
                                <label>Subject Name</label>
                                <input
                                    type="text"
                                    placeholder="Science"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="input-wrapper">
                                <label>Classes per week</label>
                                <input
                                    type="number"
                                    placeholder="3"
                                    value={classesPerWeek}
                                    onChange={(e) => setClassesPerWeek(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="input-wrapper full-width">
                                <label>Days Schedule</label>
                                <input
                                    type="text"
                                    placeholder="Mon, Wed, Fri"
                                    onChange={(e) =>
                                        setDays(e.target.value.split(",").map((d) => d.trim()))
                                    }
                                    required
                                />
                            </div>

                        <div className="input-wrapper">
                                <label>Target Attendance</label>
                                <input
                                    type="number"
                                    placeholder="75%"
                                    value={minAttendance}
                                    onChange={(e) => setMinAttendance(e.target.value)}
                                    min="0"
                                    max="100"
                                />
                            </div>                            
                        </div>
                    </div>
                    <button type="submit">Add Subject</button>
                </form>

                {loading ? (
                    <p>Loading subjects...</p>
                ) : (
                    <div className="subjects-list">
                        {subjects.map((s) => (
                            <div key={s._id || s.id} className="subject-item">
                                <div className="subject-info">
                                    <h3 className="subject-name-display">{s.name}</h3>

                                    <div className="subject-details">
                                        <div className="detail-badge">
                                            <span className="detail-icon">📅</span>
                                            {s.classes_per_week} classes/week
                                        </div>

                                        {s.days && s.days.length > 0 && (
                                            <div className="detail-badge days-badge">
                                                <span className="detail-icon">🕒</span>
                                                {s.days.join(", ")}
                                            </div>
                                        )}

                                        {s.min_attendance && (
                                            <div className="detail-badge target-badge">
                                                <span className="detail-icon">🎯</span>
                                                {s.min_attendance}% Target
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteSubject(s._id || s.id)} className="delete-btn" title="Delete Subject">
                                    ✖
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Subjects;



