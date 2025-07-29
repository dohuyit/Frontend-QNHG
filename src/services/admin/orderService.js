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

// Các hàm gọi API

export const getListOrders = (params) => {
    return apiClient.get("/orders/list", { params });
};

export const getOrderDetail = (id) => {
    return apiClient.get(`/orders/${id}/detail`);
};

export const createOrder = (data) => {
    return apiClient.post("/orders/create", data);
};

export const updateOrder = (id, data) => {
    return apiClient.post(`/orders/${id}/update`, data);
};

export const updateItemStatus = (orderItemId, status) => {
    return apiClient.post(`/orders/items/${orderItemId}/status`, { status });
};

export const getOrderItemHistory = (orderItemId) => {
    return apiClient.get(`/orders/items/${orderItemId}/history`);
};

export const trackOrder = (orderCode) => {
    return apiClient.get(`/orders/track/${orderCode}`);
};

export const getOrderByTableId = (tableId) => {
    return apiClient.get(`/orders/table/${tableId}`);
};

export const paymentOrder = (id, data) => {
    return apiClient.post(`/orders/${id}/pay`, data);
};

export const getBillDetails = (id) => {
    return apiClient.get(`/bills/${id}/detail`);
};

export const countOrder = () => {
    return apiClient.get(`/orders/count-by-status`);
};