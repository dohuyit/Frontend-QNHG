import api from './api';

const FACE_API_BASE = '/admin/face';

// Service để kết nối với Laravel API (không trực tiếp với Python)
export const faceRecognitionService = {
  /**
   * Chụp và lưu ảnh khuôn mặt
   */
  captureface: async (userId, imageData, imageCount, userInfo = {}) => {
    try {
      const response = await api.post(`${FACE_API_BASE}/capture`, {
        user_id: userId,
        image: imageData,
        image_count: imageCount,
        user_info: userInfo
      });
      return response.data;
    } catch (error) {
      console.error('Capture face error:', error);
      throw error;
    }
  },

  /**
   * Training model khuôn mặt
   */
  trainFaces: async (userId = null) => {
    try {
      const response = await api.post(`${FACE_API_BASE}/train`, {
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Train faces error:', error);
      throw error;
    }
  },

  /**
   * Nhận diện khuôn mặt để đăng nhập
   */
  recognizeFace: async (imageData) => {
    try {
      const response = await api.post(`${FACE_API_BASE}/recognize`, {
        image: imageData
      });
      return response.data;
    } catch (error) {
      console.error('Recognize face error:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách users đã đăng ký
   */
  getRegisteredUsers: async () => {
    try {
      const response = await api.get(`${FACE_API_BASE}/users`);
      return response.data;
    } catch (error) {
      console.error('Get registered users error:', error);
      throw error;
    }
  },

  /**
   * Xóa dữ liệu khuôn mặt user
   */
  deleteUserFace: async (userId) => {
    try {
      const response = await api.delete(`${FACE_API_BASE}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Delete user face error:', error);
      throw error;
    }
  },

  /**
   * Lấy thống kê hệ thống
   */
  getStatistics: async () => {
    try {
      const response = await api.get(`${FACE_API_BASE}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra kết nối Python API
   */
  checkApiConnection: async () => {
    try {
      const response = await api.get(`${FACE_API_BASE}/check-connection`);
      return response.data;
    } catch (error) {
      console.error('Check API connection error:', error);
      throw error;
    }
  }
};

// Utility functions cho xử lý camera và ảnh
export const cameraUtils = {
  /**
   * Khởi tạo camera
   */
  initCamera: async (videoElement, constraints = { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoElement) {
        // Thiết lập thuộc tính video đảm bảo phát trong modal/mobile
        try { videoElement.setAttribute('playsinline', ''); } catch (e) {}
        try { videoElement.playsInline = true; } catch (e) {}
        try { videoElement.muted = true; } catch (e) {}
        videoElement.srcObject = stream;
        // Thử play tránh bị treo khung đen
        try {
          const p = videoElement.play();
          if (p && typeof p.then === 'function') {
            p.catch(() => {});
          }
        } catch (e) {}
      }
      return stream;
    } catch (error) {
      console.error('Camera init error:', error);
      throw new Error('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
    }
  },

  /**
   * Dừng camera
   */
  stopCamera: (stream) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  },

  /**
   * Chụp ảnh từ video element
   */
  captureImage: (videoElement, canvasElement) => {
    if (!videoElement || !canvasElement) {
      throw new Error('Video hoặc Canvas element không tồn tại');
    }

    const context = canvasElement.getContext('2d');
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    
    context.drawImage(videoElement, 0, 0);
    
    // Trả về base64 string
    return canvasElement.toDataURL('image/jpeg', 0.8);
  },

  /**
   * Resize ảnh để tối ưu performance
   */
  resizeImage: (imageData, maxWidth = 640, maxHeight = 480, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Tính toán kích thước mới
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      
      img.src = imageData;
    });
  },

  /**
   * Kiểm tra browser có hỗ trợ camera không
   */
  isCameraSupported: () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
};

// Constants
export const FACE_RECOGNITION_CONSTANTS = {
  MIN_ACCURACY: 20,
  MAX_IMAGES: 100,
  CAPTURE_INTERVAL: 20, // ms
  ROLES: ['admin', 'bếp', 'nhân viên']
};
