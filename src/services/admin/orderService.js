import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/admin";

// Lấy danh sách đơn hàng
export const getListOrders = (params) => {
    return axios.get(`${API_URL}/orders/list`, { params });
};

// Lấy chi tiết đơn hàng
export const getOrderDetail = (id) => {
    return axios.get(`${API_URL}/orders/${id}/detail`);
};

// Tạo đơn hàng mới
export const createOrder = (data) => {
    return axios.post(`${API_URL}/orders/create`, data, {
        headers: { "Content-Type": "application/json" },
    });
};

// Cập nhật đơn hàng
export const updateOrder = (id, data) => {
    return axios.post(`${API_URL}/orders/${id}/update`, data, {
        headers: { "Content-Type": "application/json" },
    });
};

// Cập nhật trạng thái item trong đơn hàng
export const updateItemStatus = (orderItemId, status) => {
    return axios.post(`${API_URL}/orders/items/${orderItemId}/status`, { status });
};

// Tách đơn hàng
export const splitOrder = (orderId, data) => {
    return axios.post(`${API_URL}/orders/${orderId}/split`, data);
};

// Gộp đơn hàng
export const mergeOrders = (data) => {
    return axios.post(`${API_URL}/orders/merge`, data);
};

// Lấy lịch sử item đơn hàng
export const getOrderItemHistory = (orderItemId) => {
    return axios.get(`${API_URL}/orders/items/${orderItemId}/history`);
};

// Theo dõi đơn hàng
export const trackOrder = (orderCode) => {
    return axios.get(`${API_URL}/orders/track/${orderCode}`);
};

// Thêm item vào đơn hàng
export const addOrderItem = (orderId, data) => {
    return axios.post(`${API_URL}/orders/${orderId}/items`, data);
};

// Cập nhật item trong đơn hàng
export const updateOrderItem = (orderId, itemId, data) => {
    return axios.put(`${API_URL}/orders/${orderId}/items/${itemId}`, data);
};

// Xóa item khỏi đơn hàng
export const deleteOrderItem = (orderId, itemId) => {
    return axios.delete(`${API_URL}/orders/${orderId}/items/${itemId}`);
}; 