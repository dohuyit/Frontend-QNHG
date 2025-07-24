import axios from 'axios';

export const BASE_URL = "http://localhost:8000";
const API_URL = `${BASE_URL}/api/admin/tables`;

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

// ===== CRUD BÀN =====
export const getTables = (params) => apiClient.get(`/list`, { params });
export const getTable = (id) => apiClient.get(`/${id}/detail`);
export const createTable = (data) => apiClient.post(`/create`, data);
export const updateTable = (id, data) => apiClient.post(`/${id}/update`, data);
export const deleteTable = (id) => apiClient.delete(`/${id}/delete`);
export const getTableStatus = (tableNumber) =>
    apiClient.get(`/get-by-status`, {
      params: { table_number: tableNumber },
    });
