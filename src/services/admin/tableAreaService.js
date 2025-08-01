import axios from 'axios';

export const BASE_URL = "http://localhost:8000";
const API_URL = `${BASE_URL}/api/admin/table-areas`;

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

// ===== CRUD KHU VỰC BÀN =====
export const getTableAreas = (params) => apiClient.get(`/list`, { params });
export const getTableArea = (id) => apiClient.get(`/${id}/detail`);
export const createTableArea = (data) => apiClient.post(`/create`, data);
export const updateTableArea = (id, data) => apiClient.post(`/${id}/update`, data);
export const deleteTableArea = (id) => apiClient.delete(`/${id}/delete`);
export const countTableArea = () => {
    return apiClient.get(`/count-by-status`);
};
