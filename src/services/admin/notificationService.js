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

// Lấy danh sách thông báo
export const getNotificationList = (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `/notifications/list?${queryParams}` : `/notifications/list`;
    return apiClient.get(url);
};

// Đánh dấu tất cả thông báo đã đọc
export const markAllNotificationsRead = () => {
    return apiClient.post(`/notifications/mark-all-read`);
};

// Đánh dấu một thông báo cụ thể đã đọc (nếu cần trong tương lai)
export const markNotificationRead = (notificationId) => {
    return apiClient.post(`/notifications/${notificationId}/mark-read`);
};

// Lấy số lượng thông báo chưa đọc
export const getUnreadNotificationCount = () => {
    return apiClient.get(`/notifications/unread-count`);
};
