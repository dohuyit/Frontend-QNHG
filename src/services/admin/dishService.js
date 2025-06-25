import axios from 'axios';

const API_URL = "http://localhost:8000/api/admin/dishes";

// ===== CRUD MÓN ĂN =====
export const getDishes = (params) => axios.get(`${API_URL}/list`, { params });
export const getTrashedDish = (params) => axios.get(`${API_URL}/trash`, { params });
export const getDish = (id) => axios.get(`${API_URL}/${id}/detail`);
export const createDish = (data) => axios.post(`${API_URL}/create`, data);
export const updateDish = (id, data) => axios.post(`${API_URL}/${id}/update`, data, {
    headers: { "Content-Type": "multipart/json" },
});
export const deleteSoftDish = (id) => axios.delete(`${API_URL}/${id}/soft/delete`);
export const deleteForceDish = (id) => axios.delete(`${API_URL}/${id}/force/delete`);
export const restoreDish = (id) => axios.post(`${API_URL}/${id}/restore`);