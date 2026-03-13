import api from "./axios";

//POST /login
export const loginUser = async (credentials) => {
    const formData = new URLSearchParams();
    formData.append("username", credentials.email);
    formData.append("password", credentials.password);

    const response = await api.post("/login", formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    return response.data;
};

//POST /register
export const registerUser = async (data) => {
    const response = await api.post("/register", data);
    return response.data;
};

//POST /verify-otp
export const verifyOtp = async (data) => {
    const response = await api.post("/verify-otp", data);
    return response.data;
};

//GET /me
export const getMe = async () => {
    const response = await api.get("/me");
    return response.data;
};
