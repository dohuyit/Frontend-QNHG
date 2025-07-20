import axios from "axios";

export const BASE_URL = "http://127.0.0.1:8000";
const API_URL = `${BASE_URL}/api/admin`;

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

// Lấy danh sách đơn bếp
export const getListKitchenOrders = (params) => {
    return apiClient.get(`/kitchen-orders/list`, { params });
};

// Cập nhật trạng thái đơn bếp
export const updateKitchenOrderStatus = (id, data) => {
    return apiClient.post(`/kitchen-orders/${id}/update-status`, data);
};

// Đếm số lượng đơn bếp theo trạng thái
export const countKitchenOrdersByStatus = () => {
    return apiClient.get(`/kitchen-orders/count-by-status`);
}; 