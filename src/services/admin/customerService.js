import axios from "axios";

export const BASE_URL = "http://localhost:8000";
const API_URL = `${BASE_URL}/api/admin/customers`; // Đổi lại endpoint đúng với backend của bạn

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
    // Đảm bảo Content-Type là multipart/form-data khi gửi FormData
    if (config.data instanceof FormData) {
        config.headers["Content-Type"] = "multipart/form-data";
    } else {
        config.headers["Content-Type"] = "application/json";
    }
    return config;
});

// Lấy danh sách chi nhánh (có thể truyền params filter/search)
export const getCustomers = (params) => {
    return apiClient.get(`/list`, { params });
};

// Lấy chi tiết 1 chi nhánh
export const getCustomerDetail = (id) => {
    return apiClient.get(`/${id}/detail`);
};

// Cập nhật chi nhánh (hỗ trợ upload ảnh)
export const updateCustomer = (id, data) => {
    return apiClient.post(`/${id}/update`, data);
};

// Xóa chi nhánh
export const deleteCustomer = (id) => {
    return apiClient.delete(`/${id}/soft/delete`);
};
