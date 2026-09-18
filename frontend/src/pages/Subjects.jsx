import { useEffect, useState } from "react";
import {
  getSubjects,
  addSubject,
  deleteSubject,
  updateSubject,
  resetSubject
} from "../api/subject.api";
import { downloadAttendanceData } from "../api/attendance.api";
import {
  BookOpen,
  Download,
  Plus,
  Pencil,
  RotateCcw,
  Trash2,
  Calendar,
  Clock,
  Target,
  Check,
  X,
  AlertCircle
} from "lucide-react";
import "../styles/subjects.css";

const ALL_DAYS = [
  { key: "Mon", label: "Mon" },
  { key: "Tue", label: "Tue" },
  { key: "Wed", label: "Wed" },
  { key: "Thu", label: "Thu" },
  { key: "Fri", label: "Fri" },
  { key: "Sat", label: "Sat" },
  { key: "Sun", label: "Sun" }
];

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [selectedDays, setSelectedDays] = useState(["Mon", "Wed", "Fri"]);
  const [minAttendance, setMinAttendance] = useState("75");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadAttendanceData();
    } catch (err) {
      alert("Failed to download attendance data. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleDay = (dayKey) => {
    setSelectedDays((prev) =>
      prev.includes(dayKey)
        ? prev.filter((d) => d !== dayKey)
        : [...prev, dayKey]
    );
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const subjectPayload = {
        name: name.trim(),
        classes_per_week: selectedDays.length > 0 ? selectedDays.length : 1,
        days: selectedDays,
        min_attendance: minAttendance ? parseInt(minAttendance, 10) : 75
      };

      if (editingId) {
        await updateSubject(editingId, subjectPayload);
      } else {
        await addSubject(subjectPayload);
      }

      resetForm();
      loadSubjects();
    } catch (error) {
      console.error("Error saving subject:", error);
      alert("Error saving subject. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setSelectedDays(["Mon", "Wed", "Fri"]);
    setMinAttendance("75");
    setEditingId(null);
  };

  const handleEditClick = (subject) => {
    setEditingId(subject.id || subject._id);
    setName(subject.name || "");
    setSelectedDays(Array.isArray(subject.days) ? subject.days : []);
    setMinAttendance(subject.min_attendance ? subject.min_attendance.toString() : "75");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject permanently?")) return;

    try {
      await deleteSubject(id);
      setSubjects((prev) => prev.filter((s) => (s._id || s.id) !== id));
    } catch (error) {
      console.error("Error deleting subject:", error);
      alert("Error deleting subject!");
    }
  };

  const handleResetSubject = async (id) => {
    if (!window.confirm("Reset all attendance for this subject? This cannot be undone!")) return;
    try {
      await resetSubject(id);
      loadSubjects();
    } catch (error) {
      console.error("Error resetting subjects:", error);
      alert("Error resetting subject!");
    }
  };

  return (
    <div className="subjects-container">
      {/* Top Header */}
      <div className="subjects-header">
        <div>
          <h1 className="subjects-title">Manage Subjects</h1>
          <p className="subjects-subtitle">
            Configure course subjects, schedule days, and minimum target thresholds
          </p>
        </div>

        <button
          className="download-btn"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          <Download size={16} />
          <span>{isDownloading ? "Downloading..." : "Export CSV"}</span>
        </button>
      </div>

      {/* Main Workspace: Form & List */}
      <div className="subjects-content">
        {/* Left / Form Panel */}
        <div className="subject-form-card">
          <div className="form-card-header">
            <div className="form-icon-pill">
              {editingId ? <Pencil size={18} /> : <Plus size={18} />}
            </div>
            <div>
              <h3>{editingId ? "Edit Subject" : "Add New Subject"}</h3>
              <p>{editingId ? "Update subject configuration" : "Setup course schedule & target"}</p>
            </div>
          </div>

          <form onSubmit={handleAddSubject} className="add-subject-form">
            <div className="form-group-field">
              <label>Subject Name</label>
              <input
                type="text"
                placeholder="e.g. Data Structures & Algorithms"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group-field">
              <label>Target Attendance (%)</label>
              <input
                type="number"
                placeholder="75"
                value={minAttendance}
                onChange={(e) => setMinAttendance(e.target.value)}
                min="1"
                max="100"
              />
            </div>

            {/* Schedule Day Selector */}
            <div className="form-group-field">
              <div className="label-with-count">
                <label>Schedule Days</label>
                <span className="classes-count-badge">
                  Total weekly {selectedDays.length === 1 ? "class" : "classes"} : {selectedDays.length} 
                </span>
              </div>
              <div className="day-selector-pills">
                {ALL_DAYS.map((day) => {
                  const isSelected = selectedDays.includes(day.key);
                  return (
                    <button
                      type="button"
                      key={day.key}
                      className={`day-pill ${isSelected ? "selected" : ""}`}
                      onClick={() => toggleDay(day.key)}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-actions-row">
              <button
                type="submit"
                className="btn-submit-subject"
                disabled={isSubmitting}
              >
                {editingId ? <Check size={16} /> : <Plus size={16} />}
                <span>{editingId ? "Update Subject" : "Add Subject"}</span>
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn-cancel-edit"
                  onClick={resetForm}
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right / Subjects List Panel */}
        <div className="subjects-list-panel">
          <div className="list-panel-header">
            <h3>Configured Subjects ({subjects.length})</h3>
          </div>

          {loading ? (
            <div className="subjects-loading-state">
              <div className="loading-spinner"></div>
              <p>Loading course subjects...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="subjects-empty-state">
              <BookOpen size={36} className="empty-icon" />
              <h4>No subjects added yet</h4>
              <p>Fill out the form on the left to add your first subject.</p>
            </div>
          ) : (
            <div className="subjects-items-grid">
              {subjects.map((s) => {
                const subId = s._id || s.id;
                const isEditing = editingId === subId;

                return (
                  <div
                    key={subId}
                    className={`subject-card-item ${isEditing ? "editing" : ""}`}
                  >
                    <div className="subject-item-top">
                      <div className="subject-title-area">
                        <h4 className="subject-title">{s.name}</h4>
                      </div>

                      <div className="subject-actions-group">
                        <button
                          onClick={() => handleEditClick(s)}
                          className="action-icon-btn edit"
                          title="Edit Subject"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleResetSubject(subId)}
                          className="action-icon-btn reset"
                          title="Reset Attendance"
                        >
                          <RotateCcw size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(subId)}
                          className="action-icon-btn delete"
                          title="Delete Subject"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="subject-badges-row">
                      <div className="subject-chip">
                        <Calendar size={13} />
                        <span>{s.classes_per_week || 0} classes/wk</span>
                      </div>

                      <div className="subject-chip target">
                        <Target size={13} />
                        <span>Target: {s.min_attendance || 75}%</span>
                      </div>
                    </div>

                    {s.days && s.days.length > 0 && (
                      <div className="subject-schedule-days">
                        <Clock size={12} className="clock-icon" />
                        <div className="schedule-day-tags">
                          {s.days.map((day, idx) => (
                            <span key={idx} className="day-tag">
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subjects;
