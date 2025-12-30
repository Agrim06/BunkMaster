import api from "./axios";

//GET  /attendance/summary
export const getAttendanceSummary = async () => {
    const response = await api.get("/attendance/summary");
    return response.data;
};

//POST /attendance/{subject_id}
export const markAttendance = async (subjectId, attended) => {
    const response = await api.post(`/attendance/${subjectId}`, {
        attended: attended,
    });
    return response.data;
}

