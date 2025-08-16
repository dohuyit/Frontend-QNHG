import api from './api';

// Traditional login
export const login = async (credentials) => {
    const response = await api.post('/admin/login', credentials);
    return response.data;
};

// FaceNet login (sinh token từ user_id + confidence)
export const faceAuthLogin = async (userId, confidence) => {
    const response = await api.post('/admin/face-auth/login', {
        user_id: userId,
        confidence,
    });
    return response.data;
};

// Face login
export const faceLogin = async (base64Image) => {
    const response = await api.post('/admin/face/login', {
        base64_image: base64Image
    });
    return response.data;
};

// Face login via LBPH
export const faceLoginLbph = async (base64Image, threshold = 65.0) => {
    const response = await api.post('/admin/face/login-lbph', {
        base64_image: base64Image,
        threshold,
    });
    return response.data;
};

// Recognize only (preview user info before confirm login)
export const faceRecognizeLbph = async (base64Image, threshold = 65.0) => {
    const response = await api.post('/admin/face/recognize-lbph', {
        base64_image: base64Image,
        threshold,
    });
    return response.data;
};

// Register face
export const registerFace = async (userId, base64Image) => {
    const response = await api.post('/admin/face/register', {
        user_id: userId,
        base64_image: base64Image
    });
    return response.data;
};

// Delete face
export const deleteFace = async (userId) => {
    const response = await api.delete(`/admin/face/delete/${userId}`);
    return response.data;
};

// Health check
export const faceHealthCheck = async () => {
    const response = await api.get('/admin/face/health');
    return response.data;
};

// Logout
export const logout = async () => {
    const response = await api.post('/admin/logout');
    return response.data;
};

export const forgotPassword = (email) => {
    return api.post(`/admin/forgot-password`, { email });
};

export const resetPassword = (id, data) => {
    return api.post(`/admin/reset-password/${id}`, data);
};

export const changePassword = (data) => {
    return api.post(`/admin/users/change-password`, data);
};
