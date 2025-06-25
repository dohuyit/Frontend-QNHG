import axios from "axios";

const API_URL = "http://localhost:8000/api/admin/permission/groups";

export const getPermissionGroups = (params) => {
    return axios.get(`${API_URL}/list`, { params });
};

export const createPermissionGroup = (data) => {
    return axios.post(`${API_URL}/create`, data, {
        headers: { "Content-Type": "application/json" },
    });
};

export const updatePermissionGroup = (id, data) => {
    return axios.post(`${API_URL}/${id}/update`, data, {
        headers: { "Content-Type": "application/json" },
    });
};

export const deletePermissionGroup = (id) => {
    return axios.post(`${API_URL}/${id}/delete`);
};
