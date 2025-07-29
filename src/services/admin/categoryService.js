import axios from 'axios';

export const BASE_URL = "http://localhost:8000";
const API_URL = `${BASE_URL}/api/admin/categories`;

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

// ===== CRUD DANH MỤC =====
export const getCategories = (params) => apiClient.get(`/list`, { params });
export const getTrashedCategory = (params) => apiClient.get(`/trash`, { params });
export const getCategory = (id) => apiClient.get(`/${id}/detail`);
export const createCategory = (data) => apiClient.post(`/create`, data);
export const updateCategory = (id, data) => apiClient.post(`/${id}/update`, data, {
    headers: { "Content-Type": "multipart/form-data" },
});
export const deleteSoftCategory = (id) => apiClient.delete(`/${id}/soft/delete`);
export const deleteForceCategory = (id) => apiClient.delete(`/${id}/force/delete`);
export const restoreCategory = (id) => apiClient.post(`/${id}/restore`);
export const countCategory = () => {
    return apiClient.get(`/count-by-status`);
};