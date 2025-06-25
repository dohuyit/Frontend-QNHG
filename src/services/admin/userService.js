// src/services/admin/userService.js
import axios from "axios";

const API_URL = "http://localhost:8000/api/admin/users";

export const getUsers = (params = {}) => {
    return axios.get(`${API_URL}/list`, { params });
};

export const createUser = (data) => {
    return axios.post(`${API_URL}/create`, data);
};

export const updateUser = (id, data) => {
    return axios.post(`${API_URL}/${id}/update`, data);
};

export const deleteUser = (id) => {
    return axios.post(`${API_URL}/${id}/delete`);
};
export const blockUser = (id) => {
    return axios.post(`${API_URL}/${id}/block`);
};

export const unblockUser = (id) => {
    return axios.post(`${API_URL}/${id}/unblock`);
};
