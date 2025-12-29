import api from "./axios"

export const getSubjects = async () => {
    const response = await api.get("/subjects");
    return response.data;
};

export const addSubject = async (subjectData) => {
    const response = await api.post(`/subjects/`, subjectData);
    return response.data;
};

