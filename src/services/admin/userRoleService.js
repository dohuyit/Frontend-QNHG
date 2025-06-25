import axios from "axios";

const API_URL = "http://localhost:8000/api/admin/user/roles";

export const getUserRoleList = (params) => {
    return axios.get(`${API_URL}/list`, { params });
};

export const createUserRole = (data) => {
    return axios.post(`${API_URL}/create`, data);
};

export const updateUserRole = (id, data) => {
    return axios.post(`${API_URL}/${id}/update`, data);
};

export const deleteUserRole = (id) => {
    return axios.post(`${API_URL}/${id}/delete`);
};
