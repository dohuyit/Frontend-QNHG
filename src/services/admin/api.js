import axios from 'axios';

// Lấy token từ localStorage
const getToken = () => {
    const adminToken = localStorage.getItem("admin_token");
    return adminToken || null;
};

// Tạo axios instance
const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
});

// Interceptor thêm Authorization header
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor xử lý response
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response &&
            error.response.status === 403 &&
            error.response.data?.code === "ACCOUNT_INACTIVE"
        ) {
            localStorage.removeItem("admin_token");
            window.location.href = "http://localhost:5173/admin/login";
        }
        return Promise.reject(error);
    }
);

export default api;


