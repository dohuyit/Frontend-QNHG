import React, { useState, useRef, useEffect } from 'react';
import { 
  Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert, Progress, Spinner 
} from 'reactstrap';
import { toast } from 'react-toastify';
import { faceRecognitionService, cameraUtils, FACE_RECOGNITION_CONSTANTS } from '@services/admin/faceRecognitionService';
import { faceAuthLogin } from '@services/admin/authService';

const FaceLogin = ({ isOpen, toggle, onLoginSuccess }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [countdown, setCountdown] = useState(0);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Khởi tạo camera
  const initCamera = async () => {
    try {
      setCameraError(null);
      if (!cameraUtils.isCameraSupported()) {
        throw new Error('Trình duyệt không hỗ trợ camera');
      }
      
      const stream = await cameraUtils.initCamera(videoRef.current);
      streamRef.current = stream;
      setIsCameraOn(true);
    } catch (error) {
      console.error('Camera init error:', error);
      setCameraError(error.message);
      toast.error(error.message);
    }
  };

  // Dừng camera
  const stopCamera = () => {
    if (streamRef.current) {
      cameraUtils.stopCamera(streamRef.current);
      streamRef.current = null;
      setIsCameraOn(false);
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  // Bắt đầu quét khuôn mặt
  const startScanning = () => {
    if (!isCameraOn || !videoRef.current) {
      toast.error('Camera chưa sẵn sàng');
      return;
    }

    setIsScanning(true);
    setRecognitionResult(null);
    
    // Quét mỗi 2 giây
    scanIntervalRef.current = setInterval(async () => {
      try {
        // Chụp ảnh từ video
        const imageData = cameraUtils.captureImage(videoRef.current, canvasRef.current);
        
        // Resize ảnh để tối ưu
        const resizedImage = await cameraUtils.resizeImage(imageData);
        
        // Gửi lên server để nhận diện
        const response = await faceRecognitionService.recognizeFace(resizedImage);
        
        // Trường hợp backend đã xác thực và trả token trực tiếp
        if (response?.success && response?.login_success && response?.token) {
          setRecognitionResult(response);
          let count = 1; // đăng nhập gần như ngay lập tức
          setCountdown(count);
          const countdownInterval = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
              clearInterval(countdownInterval);
              handleLoginSuccess(response);
            }
          }, 500);
          clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = null;
        }
        else if (response.success && response.accuracy >= FACE_RECOGNITION_CONSTANTS.MIN_ACCURACY) {
          // Nhận diện thành công
          setRecognitionResult(response);
          
          // Đếm ngược 3 giây trước khi đăng nhập
          let count = 3;
          setCountdown(count);
          
          const countdownInterval = setInterval(() => {
            count--;
            setCountdown(count);
            
            if (count === 0) {
              clearInterval(countdownInterval);
              handleLoginSuccess(response);
            }
          }, 1000);
          
          // Dừng quét
          clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = null;
          
        } else if (response.success) {
          // Nhận diện được nhưng độ chính xác thấp
          toast.warning(`Độ chính xác: ${response.accuracy}% (cần ít nhất ${FACE_RECOGNITION_CONSTANTS.MIN_ACCURACY}%)`);
        }
        
      } catch (error) {
        console.error('Face recognition error:', error);
        toast.error('Lỗi nhận diện khuôn mặt');
      }
    }, 2000);
  };

  // Dừng quét
  const stopScanning = () => {
    setIsScanning(false);
    setRecognitionResult(null);
    setCountdown(0);
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  // Xử lý đăng nhập thành công
  const handleLoginSuccess = async (result) => {
    stopCamera();
    setIsScanning(false);
    
    toast.success(`Chào mừng ${result.user_info?.full_name}!`);
    
    try {
      // Nếu response từ nhận diện đã có token -> dùng luôn
      if (result?.login_success && result?.token) {
        localStorage.setItem('admin_token', result.token);
        try { localStorage.setItem('admin_user', JSON.stringify(result.user_info)); } catch (e) {}
        if (onLoginSuccess) {
          onLoginSuccess({
            user_id: result.user_id,
            user_info: result.user_info,
            accuracy: result.accuracy,
            login_type: 'face_recognition',
            token: result.token,
          });
        }
      } else {
        // Fallback: gọi API Laravel để sinh token giống đăng nhập thường
        const confidence = (result.accuracy || 0) / 100; // Backend yêu cầu 0..1
        const resp = await faceAuthLogin(result.user_id, confidence);
        if (resp?.success && resp?.data?.token) {
          localStorage.setItem('admin_token', resp.data.token);
          try { localStorage.setItem('admin_user', JSON.stringify(resp.data.user)); } catch (e) {}
          if (onLoginSuccess) {
            onLoginSuccess({
              user_id: result.user_id,
              user_info: result.user_info,
              accuracy: result.accuracy,
              login_type: 'face_recognition',
              token: resp.data.token,
            });
          }
        } else {
          toast.error('Không thể tạo token đăng nhập.');
        }
      }
    } catch (e) {
      console.error('Face auth login error:', e);
      toast.error('Lỗi đăng nhập bằng khuôn mặt.');
    }
    
    // Đóng modal
    toggle();
  };

  // Reset khi mở/đóng modal
  useEffect(() => {
    if (isOpen) {
      initCamera();
    } else {
      stopCamera();
      setRecognitionResult(null);
      setCountdown(0);
      stopScanning();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Modal 
      isOpen={isOpen} 
      toggle={toggle}
      size="lg"
      backdrop="static"
      centered
    >
      <ModalHeader toggle={toggle}>
        <i className="fas fa-user-check me-2"></i>
        Đăng nhập bằng khuôn mặt
      </ModalHeader>
      
      <ModalBody>
        {cameraError && (
          <Alert color="danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {cameraError}
          </Alert>
        )}
        
        <div className="text-center mb-3">
          <div className="position-relative d-inline-block">
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted
              style={{ 
                width: '400px', 
                height: '300px', 
                border: '2px solid #ddd', 
                borderRadius: '8px',
                backgroundColor: '#f8f9fa'
              }}
            />
            <canvas 
              ref={canvasRef}
              style={{ display: 'none' }}
            />
            
            {/* Overlay khi đang quét */}
            {isScanning && !recognitionResult && (
              <div 
                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                style={{ 
                  backgroundColor: 'rgba(0,0,0,0.3)', 
                  borderRadius: '8px',
                  color: 'white'
                }}
              >
                <div className="text-center">
                  <Spinner color="light" className="mb-2" />
                  <p className="mb-0">Đang quét khuôn mặt...</p>
                </div>
              </div>
            )}
            
            {/* Overlay khi nhận diện thành công */}
            {recognitionResult && (
              <div 
                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                style={{ 
                  backgroundColor: 'rgba(40, 167, 69, 0.8)', 
                  borderRadius: '8px',
                  color: 'white'
                }}
              >
                <div className="text-center">
                  <i className="fas fa-check-circle fa-3x mb-3"></i>
                  <h5>Nhận diện thành công!</h5>
                  <p className="mb-2">
                    <strong>{recognitionResult.user_info?.full_name}</strong>
                  </p>
                  <p className="mb-2">
                    Độ chính xác: <strong>{recognitionResult.accuracy}%</strong>
                  </p>
                  <p className="mb-2">
                    Quyền: <strong>{recognitionResult.user_info?.role_name}</strong>
                  </p>
                  {countdown > 0 && (
                    <div>
                      <p className="mb-2">Đăng nhập sau: <strong>{countdown}s</strong></p>
                      <Progress value={(4-countdown)/3*100} color="light" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {!isCameraOn && !cameraError && (
          <div className="text-center py-4">
            <Spinner color="primary" />
            <p className="mt-2">Đang khởi tạo camera...</p>
          </div>
        )}
        
        {isCameraOn && !isScanning && !recognitionResult && (
          <Alert color="info">
            <i className="fas fa-info-circle me-2"></i>
            Nhìn thẳng vào camera và bấm "Bắt đầu quét" để đăng nhập bằng khuôn mặt.
          </Alert>
        )}
        
        {isScanning && !recognitionResult && (
          <Alert color="warning">
            <i className="fas fa-search me-2"></i>
            Đang quét khuôn mặt... Vui lòng giữ khuôn mặt trong khung hình và không di chuyển.
          </Alert>
        )}
      </ModalBody>
      
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Hủy
        </Button>
        
        {isCameraOn && !recognitionResult && (
          <>
            {!isScanning ? (
              <Button color="primary" onClick={startScanning}>
                <i className="fas fa-play me-2"></i>
                Bắt đầu quét
              </Button>
            ) : (
              <Button color="warning" onClick={stopScanning}>
                <i className="fas fa-stop me-2"></i>
                Dừng quét
              </Button>
            )}
          </>
        )}
        
        {recognitionResult && countdown === 0 && (
          <Button color="success" onClick={() => handleLoginSuccess(recognitionResult)}>
            <i className="fas fa-sign-in-alt me-2"></i>
            Đăng nhập ngay
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default FaceLogin;
