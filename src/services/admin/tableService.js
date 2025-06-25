import axios from 'axios';

const API_URL = "http://localhost:8000/api/admin/tables";

// ===== CRUD BÀN =====
export const getTables = (params) => axios.get(`${API_URL}/list`, { params });
export const getTable = (id) => axios.get(`${API_URL}/${id}/detail`);
export const createTable = (data) => axios.post(`${API_URL}/create`, data);
export const updateTable = (id, data) => axios.post(`${API_URL}/${id}/update`, data,{
    headers: { "Content-Type": "multipart/json" },
  });
export const deleteTable = (id) => axios.delete(`${API_URL}/${id}/delete`);

