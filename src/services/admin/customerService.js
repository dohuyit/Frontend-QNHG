import axios from "axios";

const API_URL = "http://localhost:8000/api/admin/customers"; // Đổi lại endpoint đúng với backend của bạn

// Lấy danh sách chi nhánh (có thể truyền params filter/search)
export const getCustomers = (params) => {
  return axios.get(`${API_URL}/list`, { params });
};

// Lấy chi tiết 1 chi nhánh
export const getCustomerDetail = (id) => {
  return axios.get(`${API_URL}/${id}/detail`);
};

// Cập nhật chi nhánh
export const updateCustomer = (id, data) => {
  return axios.post(`${API_URL}/${id}/update`, data, {
    headers: { "Content-Type": "multipart/json" },
  });
};

// Xóa chi nhánh
export const deleteCustomer = (id) => {
  return axios.delete(`${API_URL}/${id}/soft/delete`);
};
