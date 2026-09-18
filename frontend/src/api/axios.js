import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
    headers: {
        "Content-type": "application/json",
    },
    withCredentials: true, // Automatically sends and receives HttpOnly cookies
});

// Response Interceptor for global 401 Unauthorized handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Dispatch a custom event so AuthProvider can reset its user state without page reload loops
            window.dispatchEvent(new Event("authSessionExpired"));
        }
        return Promise.reject(error);
    }
);

export default api;