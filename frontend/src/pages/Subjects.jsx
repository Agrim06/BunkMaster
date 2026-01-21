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
                        <input
                            type="text"
                            placeholder="Subject name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <input
                            type="number"
                            placeholder="Classes per week"
                            value={classesPerWeek}
                            onChange={(e) => setClassesPerWeek(e.target.value)}
                            min="1"
                            required
                        />

                        <input
                            type="text"
                            placeholder="Days (comma separated, e.g. Mon,Wed,Fri)"
                            onChange={(e) =>
                                setDays(e.target.value.split(",").map((d) => d.trim()))
                            }
                            required
                        />
                        <input
                            type="number"
                            placeholder="Minimum Attendance"
                            value={minAttendance}
                            onChange={(e) => setMinAttendance(e.target.value)}
                            min="0"
                            max="100"
                        />
                    </div>
                    <button type="submit">Add Subject</button>
                </form>

                {loading ? (
                    <p>Loading subjects...</p>
                ) : (
                    <ul className="subjects-list">
                        {subjects.map((s) => (
                            <li key={s._id || s.id} className="subject-item">
                                {s.name}
                                <button onClick={() => handleDeleteSubject(s._id || s.id)} className="delete-btn">
                                    ❌
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Subjects;



