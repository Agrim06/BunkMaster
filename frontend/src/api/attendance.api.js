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
// GET /attendance/download
export const downloadAttendanceData = async () => {
    try {
        const response = await api.get("/attendance/download", {
            responseType: "blob",
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `attendance_data_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error downloading attendance data:", error);
        throw error;
    }
};
