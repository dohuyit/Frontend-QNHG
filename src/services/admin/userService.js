// src/services/admin/userService.js
import axios from "axios";

export const BASE_URL = "http://localhost:8000";
const API_URL = `${BASE_URL}/api/admin/users`;

// Lấy token từ localStorage
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

export const getUsers = (params = {}) => {
    return apiClient.get(`/list`, { params });
};

export const createUser = (data) => {
    return apiClient.post(`/create`, data);
};

export const updateUser = (id, data) => {
    return apiClient.post(`/${id}/update`, data);
};

export const deleteUser = (id) => {
    return apiClient.post(`/${id}/delete`);
};
export const blockUser = (id) => {
    return apiClient.post(`/${id}/block`);
};

export const unblockUser = (id) => {
    return apiClient.post(`/${id}/unblock`);
};

export const getUserDetail= (id) => {
    return apiClient.get(`/${id}/detail`);
};

export const countUsersByStatus = () => {
    return apiClient.get(`/count-by-status`);
};