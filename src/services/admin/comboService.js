import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/admin";

export const getCombos = (params) => {
    return axios.get(`${API_URL}/combos/list`, { params });
};

export const getComboDetail = (id) => {
    return axios.get(`${API_URL}/combos/${id}/detail`);
};

export const createCombo = (data) => {
    return axios.post(`${API_URL}/combos/create`, data);
};

export const updateCombo = (id, data) => {
    return axios.post(`${API_URL}/combos/${id}/update`, data, {
        headers: { "Content-Type": "application/json" },
    });
};

export const getTrashedCombos = (params) => {
    return axios.get(`${API_URL}/combos/trash`, { params });
};

export const softDeleteCombo = (id) => {
    return axios.delete(`${API_URL}/combos/${id}/soft/delete`);
};

export const forceDeleteCombo = (id) => {
    return axios.delete(`${API_URL}/combos/${id}/force/delete`);
};

export const restoreCombo = (id) => {
    return axios.post(`${API_URL}/combos/${id}/restore`);
};

export const addItemToCombo = (id, data) => {
    return axios.post(`${API_URL}/combos/${id}/add-items`, data, {
        headers: { "Content-Type": "application/json" },
    });
};

export const updateItemQuantity = (comboId, dishId, data) => {
    return axios.post(`${API_URL}/combos/${comboId}/${dishId}/update-quantity`, data, {
        headers: { "Content-Type": "application/json" },
    });
}; 