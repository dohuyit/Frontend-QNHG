import axios from 'axios';

export const BASE_URL = "http://localhost:8000";
const API_URL = `${BASE_URL}/api/admin/discount-codes`;

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
    },
});

// Interceptor thêm Authorization header trước khi gửi request
apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Đảm bảo Content-Type là multipart/form-data cho các request có file
    if (config.data instanceof FormData) {
        config.headers["Content-Type"] = "multipart/form-data";
    } else {
        config.headers["Content-Type"] = "application/json";
    }
    return config;
});

// ===== CRUD MÃ GIẢM GIÁ =====
export const getDiscountCodes = (params) => apiClient.get(`/list`, { params });
export const createDiscountCode = (data) => apiClient.post(`/create`, data);
export const updateDiscountCode = (id, data) => apiClient.post(`/${id}/update`, data);
export const deleteDiscountCode = (id) => apiClient.delete(`/${id}/delete`);
export const countDiscountCodes = () => apiClient.get(`/count-by-status`);
