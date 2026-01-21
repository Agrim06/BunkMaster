import api from "./axios";

//GET  /attendance/summary
export const getAttendanceSummary = async () => {
    const response = await api.get("/attendance/summary");
    return response.data;
};

//POST /attendance/{subject_id}
export const markAttendance = async (subjectId, attended , date = null) => {
    const payload = { attended };
    if( date ) payload.date = date;

    const response = await api.post(`/attendance/${subjectId}`, payload);
    return response.data;
}

