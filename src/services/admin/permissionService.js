import axios from "axios";

const API_URL = "http://localhost:8000/api/admin/permissions";

export const getPermissions = (params) => {
    return axios.get(`${API_URL}/list`, { params });
};

export const getPermissionDetail = (id) => {
    return axios.get(`${API_URL}/${id}/detail`);
};

export const createPermission = (data) => {
    return axios.post(`${API_URL}/create`, data, {
        headers: { "Content-Type": "application/json" },
    });
};

export const updatePermission = (id, data) => {
    return axios.post(`${API_URL}/${id}/update`, data, {
        headers: { "Content-Type": "application/json" },
    });
};

export const deletePermission = (id) => {
    return axios.post(`${API_URL}/${id}/delete`);
};
