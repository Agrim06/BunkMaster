import api from "./axios"

export const getSubjects = async () => {
    const response = await api.get("/subjects");
    return response.data;
};

export const addSubject = async (subjectData) => {
    const response = await api.post(`/subjects/`, subjectData);
    return response.data;
};

export const deleteSubject = async(id) =>{
   const response = await api.delete(`/subjects/${id}`);
   return response.data;
}

export const updateSubject = async(id, subjectData) =>{
    const response = await api.put(`/subjects/${id}`, subjectData);
    return response.data;
}

export const resetSubject = async(id) =>{
    const response = await api.post(`/subjects/${id}/reset`);
    return response.data;
}