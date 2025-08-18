// src/services/admin/faceService.js
import axios from 'axios';

const FACE_BASE_URL = 'http://localhost:5000';

const faceApi = axios.create({
  baseURL: FACE_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

export const listFaces = () => faceApi.get('/faces');
export const getFace = (userId) => faceApi.get(`/faces/${userId}`);
export const updateFace = (userId, base64Image) => faceApi.put(`/faces/${userId}`, { base64_image: base64Image });
export const registerFaceDirect = (userId, base64Image) => faceApi.post('/register-face', { user_id: userId, base64_image: base64Image });
export const deleteFaceDirect = (userId) => faceApi.delete(`/delete-face/${userId}`);
export const health = () => faceApi.get('/health');

// LBPH helpers
export const captureLbph = (payload) => faceApi.post('/lbph/capture', payload);
export const trainLbph = (payload) => faceApi.post('/lbph/train', payload);
export const listLbphFaces = () => faceApi.get('/lbph/faces');


