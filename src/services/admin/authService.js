
import axios from "axios";

export const BASE_URL = "http://localhost:8000";
const API_URL = `${BASE_URL}/api/admin`;

// Lấy token từ localStorage hoặc nơi bạn lưu token
const getToken = () => {
    const adminToken = localStorage.getItem("admin_token");
    return adminToken || null;
};

// Tạo axios instance dùng chung
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
});

// Interceptor thêm Authorization header trước khi gửi request
apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = (data) => {
    return apiClient.post(`/login`, data, { headers: { "Authorization": undefined } }); // Login does not need a token
};
export const logout = () => {
    return apiClient.post(`/logout`, {});
};

export const forgotPassword = (email) => {
    return apiClient.post(`/forgot-password`, { email }, { headers: { "Authorization": undefined } }); // Forgot password does not need a token
};

export const resetPassword = (id, data) => {
    return apiClient.post(`/reset-password/${id}`, data, { headers: { "Authorization": undefined } }); // Reset password does not need a token
};

export const changePassword = (data) => {
    return apiClient.post(`/users/change-password`, data, {
        headers: { "Authorization": undefined }
    });
};
