import axios from "axios";

const API_URL = "http://localhost:8000/api/admin/roles";

export const getRoles = (params) => {
    return axios.get(`${API_URL}/list`, { params });
};

export const getRoleDetail = (id) => {
    return axios.get(`${API_URL}/${id}/detail`);
};

export const createRole = (data) => {
    return axios.post(`${API_URL}/create`, data, {
        headers: { "Content-Type": "application/json" },
    });
};

export const updateRole = (id, data) => {
    return axios.post(`${API_URL}/${id}/update`, data, {
        headers: { "Content-Type": "application/json" },
    });
};

export const deleteRole = (id) => {
    return axios.post(`${API_URL}/${id}/delete`);
};
