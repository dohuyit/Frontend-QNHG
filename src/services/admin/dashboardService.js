// src/services/admin/dashboardService.js
import axios from "axios";

export const BASE_URL = "http://localhost:8000";
const API_URL = `${BASE_URL}/api/admin/statistics`;

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

// Thống kê trạng thái đặt bàn
export const getReservationStatusStats = () => {
    return apiClient.get(`/reservations/status-count`);
};

// Thống kê đặt bàn theo thời gian, params: { start_date, end_date, group_by }
export const getReservationTimeStats = (params = {}) => {
    return apiClient.get(`/reservations/time-count`, { params });
};

// Thống kê doanh thu theo thời gian, params: { start_date, end_date, group_by }
export const getOrderRevenueStats = (params = {}) => {
    return apiClient.get(`/orders/revenue`, { params });
};

// ========== Dashboard chuyên biệt ==========
// Sử dụng axios trực tiếp với URL tuyệt đối để tránh baseURL '/statistics'
export const getKitchenDashboard = (params = {}) => {
    const url = `${BASE_URL}/api/admin/dashboard/kitchen`;
    const token = getToken();
    return axios.get(url, {
        params,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
};

// Kitchen queue (items level)
export const getKitchenQueue = (params = {}) => {
    // Dùng endpoint hiện có trong backend: kitchen-orders/list
    // Gợi ý: truyền status để lấy hàng đợi đang chờ/đang nấu
    const url = `${BASE_URL}/api/admin/kitchen-orders/list`;
    const token = getToken();
    return axios.get(url, {
        params,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
};

// Quick actions for an order item: start, pause, done, reassign, print
export const actionKitchenItem = (itemId, action, payload = {}) => {
    // Map action UI -> status backend
    const map = { start: 'preparing', pause: 'pending', done: 'ready' };
    const status = map[action] || payload.status;
    const url = `${BASE_URL}/api/admin/kitchen-orders/${itemId}/update-status`;
    const token = getToken();
    return axios.post(url, { status }, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
};

// Station load stats
export const getKitchenStationLoad = (params = {}) => {
    const url = `${BASE_URL}/api/admin/kitchen/station-load`;
    const token = getToken();
    return axios.get(url, {
        params,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
};

// Delay stats per dish
export const getKitchenDelayStats = (params = {}) => {
    const url = `${BASE_URL}/api/admin/kitchen/delay-stats`;
    const token = getToken();
    return axios.get(url, {
        params,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
};

export const getStaffDashboard = (params = {}) => {
    const url = `${BASE_URL}/api/admin/dashboard/staff`;
    const token = getToken();
    return axios.get(url, {
        params,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
};
