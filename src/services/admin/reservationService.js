import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/admin";

// Lấy danh sách đơn đặt bàn
export const getReservations = (params) => {
    return axios.get(`${API_URL}/reservations/list`, { params });
};

// Lấy danh sách khu vực bàn
export const getTableAreas = (params) => {
    return axios.get(`${API_URL}/table-areas/list`, { params });
};

// Lấy chi tiết 1 đơn đặt bàn
export const getReservationDetail = (id) => {
    return axios.get(`${API_URL}/reservations/${id}/detail`);
};

// Tạo đơn đặt bàn mới
export const createReservation = (data) => {
    return axios.post(`${API_URL}/reservations/create`, data, {
        headers: { "Content-Type": "application/json" },
    });
};

// Cập nhật đơn đặt bàn
export const updateReservation = (id, data) => {
    return axios.post(`${API_URL}/reservations/${id}/update`, data, {
        headers: { "Content-Type": "application/json" },
    });
};

// Xóa đơn đặt bàn (soft delete)
export const deleteReservation = (id) => {
    return axios.delete(`${API_URL}/reservations/${id}/soft/delete`);
};

// Xóa vĩnh viễn đơn đặt bàn (force delete)
export const forceDeleteReservation = (id) => {
    return axios.delete(`${API_URL}/reservations/${id}/force/delete`);
};

// Khôi phục đơn đặt bàn từ thùng rác
export const restoreReservation = (id) => {
    return axios.post(`${API_URL}/reservations/${id}/restore`);
};

// Lấy danh sách đơn đặt bàn trong thùng rác
export const getTrashedReservations = (params) => {
    return axios.get(`${API_URL}/reservations/trash`, { params });
};

// Thay đổi trạng thái đơn đặt bàn
export const changeReservationStatus = (id, status) => {
    return axios.post(`${API_URL}/reservations/${id}/change-status`, {
        status,
    });
};

// Xác nhận đơn đặt bàn
export const confirmReservation = (id) => {
    return axios.post(`${API_URL}/reservations/${id}/confirm`);
};

// Khu vực bàn
export const getListTableArea = () => axios.get("/api/admin/table-areas/list");
export const getTableAreaDetail = (id) => axios.get(`/api/admin/table-areas/${id}/detail`);
export const createTableArea = (data) => axios.post("/api/admin/table-areas/create", data);
export const updateTableArea = (id, data) => axios.post(`/api/admin/table-areas/${id}/update`, data);
export const deleteTableArea = (id) => axios.delete(`/api/admin/table-areas/${id}/delete`); 