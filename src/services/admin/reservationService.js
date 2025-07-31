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

// Lấy danh sách đơn đặt bàn
export const getReservations = (params) => {
    return apiClient.get(`/reservations/list`, { params });
};

// Lấy danh sách khu vực bàn
export const getTableAreas = (params) => {
    return apiClient.get(`/table-areas/list`, { params });
};

// Lấy chi tiết 1 đơn đặt bàn
export const getReservationDetail = (id) => {
    return apiClient.get(`/reservations/${id}/detail`);
};

// Lấy thông tin reservation theo ID
export const getReservationById = (id) => {
    return apiClient.get(`/reservations/${id}`);
};

// Tạo đơn đặt bàn mới
export const createReservation = (data) => {
    return apiClient.post(`/reservations/create`, data);
};

// Cập nhật đơn đặt bàn
export const updateReservation = (id, data) => {
    return apiClient.post(`/reservations/${id}/update`, data);
};

// Xóa đơn đặt bàn (soft delete)
export const deleteReservation = (id) => {
    return apiClient.delete(`/reservations/${id}/soft/delete`);
};

// Xóa vĩnh viễn đơn đặt bàn (force delete)
export const forceDeleteReservation = (id) => {
    return apiClient.delete(`/reservations/${id}/force/delete`);
};

// Khôi phục đơn đặt bàn từ thùng rác
export const restoreReservation = (id) => {
    return apiClient.post(`/reservations/${id}/restore`);
};

// Lấy danh sách đơn đặt bàn trong thùng rác
export const getTrashedReservations = (params) => {
    return apiClient.get(`/reservations/trash`, { params });
};

// Thay đổi trạng thái đơn đặt bàn
export const changeReservationStatus = (id, status) => {
    return apiClient.post(`/reservations/${id}/change-status`, { status });
};

// Xác nhận đơn đặt bàn
export const confirmReservation = (id) => {
    return apiClient.post(`/reservations/${id}/confirm`);
};

// Lấy lịch sử thay đổi đơn đặt bàn
export const getReservationChangeLogs = (id) => {
    return apiClient.get(`/reservations/${id}/change-logs`);
};

// Khu vực bàn
export const getListTableArea = () => apiClient.get("/table-areas/list");
export const getTableAreaDetail = (id) => apiClient.get(`/table-areas/${id}/detail`);
export const createTableArea = (data) => apiClient.post("/table-areas/create", data);
export const updateTableArea = (id, data) => apiClient.post(`/table-areas/${id}/update`, data);
export const deleteTableArea = (id) => apiClient.delete(`/table-areas/${id}/delete`); 