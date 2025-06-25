import axios from 'axios';

const API_URL = "http://localhost:8000/api/admin/table-areas";

// ===== CRUD KHU VỰC BÀN =====
export const getTableAreas = (params) => axios.get(`${API_URL}/list`, { params });
export const getTableArea = (id) => axios.get(`${API_URL}/${id}/detail`);
export const createTableArea = (data) => axios.post(`${API_URL}/create`, data);
export const updateTableArea = (id, data) => axios.post(`${API_URL}/${id}/update`, data,{
    headers: { "Content-Type": "multipart/json" },
  });
export const deleteTableArea = (id) => axios.delete(`${API_URL}/${id}/delete`);

