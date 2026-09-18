import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
    headers: {
        "Content-type": "application/json",
    },
    withCredentials: true, // Automatically sends and receives HttpOnly cookies
});

// Request Interceptor: Attach Authorization Bearer token header if present in storage
// (Ensures seamless cross-origin authentication across all browsers, including those with strict third-party cookie blocking)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor for global 401 Unauthorized handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            window.dispatchEvent(new Event("authSessionExpired"));
        }
        return Promise.reject(error);
    }
);

export default api;