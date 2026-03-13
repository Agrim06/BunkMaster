import { useEffect, useState } from "react";
import { getSubjects, addSubject, deleteSubject, updateSubject, resetSubject } from "../api/subject.api"
import "../styles/subjects.css"

const Subjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [classesPerWeek, setClassesPerWeek] = useState("");
    const [daysInput, setDaysInput] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [minAttendance, setMinAttendance] = useState("");
    const [editingId, setEditingId] = useState(null); 

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
            const parsedDays = daysInput.split(",").map(d => d.trim()).filter(d => Boolean(d));

            const subjectPayload = {
                name,
                classes_per_week: parseInt(classesPerWeek, 10),
                days: parsedDays,
                min_attendance: minAttendance ? parseInt(minAttendance, 10) : 75
            };

            if(editingId){
                await updateSubject(editingId, subjectPayload);
            }
            else{
                await addSubject(subjectPayload);
            }


            setName("");
            setClassesPerWeek("");
            setDaysInput("");
            setEditingId(null);
            setMinAttendance("");

            loadSubjects();

        } catch (error) {
            console.error("Error saving subject:", error);
            alert("Error saving subject updates !")
        }
    };

    const handleEditClick = (subject) => {
        setEditingId(subject.id || subject._id);
        setName(subject.name);
        setClassesPerWeek(subject.classes_per_week.toString());
        setDaysInput(subject.days ? subject.days.join(", ") : "");
        setMinAttendance(subject.min_attendance ? subject.min_attendance.toString() : "75");
        
        window.scrollTo({ top: 0, behavior: "smooth" });
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

    const handleResetSubject = async(id) =>{
        if(!window.confirm("Reset all attendance for this subject? This action cannot be undone !")) return;
        try{
            await resetSubject(id);
            alert("Subject data has been reset!");
            loadSubjects();
        }catch(error){
            console.error("Error resetting subjects:", error);
            alert("Error resetting subject!");
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

                            <div className="input-wrapper full-width">
                                <label>Days Schedule</label>
                                <input
                                    type="text"
                                    placeholder="Mon, Wed, Fri"
                                    value={daysInput}
                                    onChange={(e) => setDaysInput(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                        <button type="submit" style={{ flex: 1 }}>
                            {editingId ? "Update Subject" : "Add Subject"}
                        </button>
                        
                        {editingId && (
                            <button 
                                type="button" 
                                className="cancel-btn"
                                onClick={() => {
                                    setEditingId(null);
                                    setName("");
                                    setClassesPerWeek("");
                                    setDaysInput("");
                                    setMinAttendance("");
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
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
                                                Target: {s.min_attendance}% 
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button 
                                        onClick={() => handleEditClick(s)} 
                                        className="edit-btn" 
                                        title="Edit Subject"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleResetSubject(s._id || s.id)}
                                        className="reset-btn"
                                        title="Reset Attendance"
                                    >
                                        ↺
                                    </button>
                                    <button onClick={() => handleDeleteSubject(s._id || s.id)} className="delete-btn" title="Delete Subject">
                                        ✖
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Subjects;



