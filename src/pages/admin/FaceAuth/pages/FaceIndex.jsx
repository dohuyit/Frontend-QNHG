import React, { useEffect, useState, useRef } from 'react';
import {
  Card, CardBody, Button, Table, Badge, Spinner, Form, FormGroup, Label, Input,
  Modal, ModalHeader, ModalBody, ModalFooter, Progress, Alert, Row, Col
} from 'reactstrap';
import Breadcrumb from '@components/admin/ui/Breadcrumb';
import { toast } from 'react-toastify';
import { faceRecognitionService, cameraUtils, FACE_RECOGNITION_CONSTANTS } from '@services/admin/faceRecognitionService';

const FaceIndex = () => {
  const [faces, setFaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);

  // Modal states
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);

  // Registration form state
  const [registerFormData, setRegisterFormData] = useState({
    user_id: '',
    email: '',
    full_name: '',
    role: 'nhân viên'
  });

  // Registration process states
  const [isRegistering, setIsRegistering] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [capturedImages, setCapturedImages] = useState([]);
  const [registrationStep, setRegistrationStep] = useState('form'); // 'form', 'capture', 'complete'

  // Training states
  const [isTraining, setIsTraining] = useState(false);
  const [selectedUserForTraining, setSelectedUserForTraining] = useState(null);

  // Refs cho video/canvas
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // State
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Fetch danh sách users đã đăng ký
  const fetchFaces = async () => {
    setLoading(true);
    try {
      const response = await faceRecognitionService.getRegisteredUsers();
      if (response.success) {
        setFaces(response.data || []);
      } else {
        toast.error(response.message || 'Lỗi tải danh sách');
      }
    } catch (error) {
      console.error('Fetch faces error:', error);
      toast.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch thống kê hệ thống
  const fetchStatistics = async () => {
    try {
      const response = await faceRecognitionService.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Fetch statistics error:', error);
    }
  };

  // Khởi tạo camera
  const initCamera = async () => {
    try {
      const stream = await cameraUtils.initCamera(videoRef.current, { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      setCameraStream(stream);
      setIsCameraOn(true);
      setIsVideoReady(true);
      setCameraError(null);
    } catch (error) {
      setCameraError(error.message || 'Không thể truy cập camera');
      setIsCameraOn(false);
      setIsVideoReady(false);
    }
  };

  // Dừng camera
  const stopCamera = () => {
    if (cameraStream) {
      try { cameraStream.getTracks().forEach(t => t.stop()); } catch (e) {}
      setCameraStream(null);
      setIsCameraOn(false);
      setIsVideoReady(false);
    }
  };

  // Bắt đầu quá trình đăng ký
  const startRegistration = () => {
    if (!registerFormData.user_id || !registerFormData.email || !registerFormData.full_name) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setRegistrationStep('capture');
    setCaptureProgress(0);
    setCapturedImages([]);
    // Nếu chưa có stream thì khởi tạo; nếu đã có thì đảm bảo videoRef gắn srcObject
    if (!cameraStream) {
      setIsVideoReady(false);
      initCamera();
    } else {
      // gắn lại stream vào video hiện tại
      if (videoRef.current && videoRef.current.srcObject !== cameraStream) {
        try { videoRef.current.srcObject = cameraStream; } catch (e) {}
        try { const p = videoRef.current.play(); if (p && p.then) p.catch(() => {}); } catch (e) {}
      }
      setIsVideoReady(true);
    }
  };

  // Chụp ảnh liên tiếp
  const startCapturing = async () => {
    if (!isCameraOn || !videoRef.current) {
      toast.error('Camera chưa sẵn sàng');
      return;
    }

    setIsRegistering(true);
    const totalImages = FACE_RECOGNITION_CONSTANTS.MAX_IMAGES;
    const captureInterval = FACE_RECOGNITION_CONSTANTS.CAPTURE_INTERVAL;

    try {
      // Chờ video sẵn sàng trước khi chụp
      const video = videoRef.current;
      if (video.readyState < 2) {
        await new Promise(resolve => {
          const onReady = () => { video.removeEventListener('loadeddata', onReady); resolve(); };
          video.addEventListener('loadeddata', onReady);
        });
      }
      if (!isVideoReady) setIsVideoReady(true);
      for (let i = 1; i <= totalImages; i++) {
        // Chụp ảnh
        const imageData = cameraUtils.captureImage(videoRef.current, canvasRef.current);

        // Resize ảnh để tối ưu
        const resizedImage = await cameraUtils.resizeImage(imageData);

        // Gửi trực tiếp lên Flask để lưu dataset
        const res = await fetch('http://localhost:5000/api/face/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: parseInt(registerFormData.user_id, 10),
            image: resizedImage,
            image_count: i,
            user_info: i === 1 ? {
              email: registerFormData.email,
              full_name: registerFormData.full_name,
              role: registerFormData.role
            } : {}
          })
        });
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.message || `Lỗi chụp ảnh ${i}`);
        }

        // Cập nhật progress
        setCaptureProgress(Math.round((i / totalImages) * 100));
        setCapturedImages(prev => [...prev, resizedImage]);

        // Delay giữa các lần chụp
        if (i < totalImages) {
          await new Promise(resolve => setTimeout(resolve, captureInterval));
        }
      }

      toast.success(`Đã chụp thành công ${totalImages} ảnh!`);

      // Tự động training sau khi chụp xong
      try {
        const trainRes = await fetch('http://localhost:5000/api/face/train', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: parseInt(registerFormData.user_id, 10) })
        });
        const trainJson = await trainRes.json();
        if (trainJson.success) {
          toast.success(trainJson.message || 'Training thành công!');
        } else {
          toast.error(trainJson.message || 'Training thất bại');
        }
      } catch (e) {
        console.error('Auto train error:', e);
        toast.error('Lỗi gọi API training');
      }

      setRegistrationStep('complete');
      stopCamera();
      fetchFaces(); // Refresh danh sách

    } catch (error) {
      console.error('Capture error:', error);
      toast.error(error.message || 'Lỗi trong quá trình chụp ảnh');
    } finally {
      setIsRegistering(false);
    }
  };

  // Training model
  const startTraining = async (userId) => {
    setIsTraining(true);
    setSelectedUserForTraining(userId);

    try {
      const response = await faceRecognitionService.trainFaces(userId);

      if (response.success) {
        toast.success(response.message || 'Training thành công!');
        fetchFaces(); // Refresh danh sách
        setShowTrainingModal(false);
      } else {
        toast.error(response.message || 'Lỗi training');
      }
    } catch (error) {
      console.error('Training error:', error);
      toast.error('Lỗi kết nối server');
    } finally {
      setIsTraining(false);
      setSelectedUserForTraining(null);
    }
  };

  // Xóa user
  const deleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn xóa dữ liệu khuôn mặt này?')) {
      return;
    }

    try {
      const response = await faceRecognitionService.deleteUserFace(userId);

      if (response.success) {
        toast.success(response.message || 'Xóa thành công!');
        fetchFaces(); // Refresh danh sách
      } else {
        toast.error(response.message || 'Lỗi xóa dữ liệu');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Lỗi kết nối server');
    }
  };

  // Reset form đăng ký
  const resetRegistrationForm = () => {
    setRegisterFormData({
      user_id: '',
      email: '',
      full_name: '',
      role: 'nhân viên'
    });
    setRegistrationStep('form');
    setCaptureProgress(0);
    setCapturedImages([]);
    stopCamera();
  };

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setRegisterFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Tính toán user ID tiếp theo
  const computeNextUserId = () => {
    const ids = faces.map(f => Number(f.user_id)).filter(n => !Number.isNaN(n));
    return ids.length ? Math.max(...ids) + 1 : 1;
  };

  // Mở modal đăng ký
  const openRegisterModal = () => {
    // Khởi tạo form với user_id gợi ý
    setRegisterFormData({
      user_id: computeNextUserId(),
      email: '',
      full_name: '',
      role: 'nhân viên'
    });
    setShowRegisterModal(true);
    // Chuẩn bị trạng thái đăng ký và bật camera để preview ngay ở bước form
    setRegistrationStep('form');
    setCaptureProgress(0);
    setCapturedImages([]);
    setCameraError(null);
    // Bật camera ngay trong bước form
    setTimeout(() => { initCamera(); }, 0);
  };

  // Component lifecycle
  useEffect(() => {
    fetchFaces();
    fetchStatistics();
  }, []);

  useEffect(() => {
    // Cleanup camera khi component unmount
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumb title="Quản lý nhận diện khuôn mặt" breadcrumbItem="Nhận diện khuôn mặt" />

        {/* Thống kê tổng quan */}
        {statistics && (
          <Row className="mb-4">
            <Col md={3}>
              <Card>
                <CardBody className="text-center">
                  <h4 className="text-primary">{statistics.total_users}</h4>
                  <p className="mb-0">Tổng số users</p>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <CardBody className="text-center">
                  <h4 className="text-success">{statistics.trained_users}</h4>
                  <p className="mb-0">Đã training</p>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <CardBody className="text-center">
                  <h4 className="text-warning">{statistics.untrained_users}</h4>
                  <p className="mb-0">Chưa training</p>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <CardBody className="text-center">
                  <h4 className={statistics.api_connected ? "text-success" : "text-danger"}>
                    {statistics.api_connected ? "✓" : "✗"}
                  </h4>
                  <p className="mb-0">API Python</p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        {/* Danh sách users */}
        <Card>
          <CardBody>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Danh sách nhận diện khuôn mặt</h5>
              <Button color="primary" onClick={openRegisterModal}>
                <i className="fas fa-plus me-2"></i>
                Đăng ký khuôn mặt mới
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Spinner color="primary" />
                <p className="mt-2">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Quyền</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {faces.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <i className="fas fa-user-slash fa-3x text-muted mb-3"></i>
                        <p className="text-muted">Chưa có dữ liệu khuôn mặt nào</p>
                      </td>
                    </tr>
                  ) : (
                    faces.map((face) => (
                      <tr key={face.id}>
                        <td>{face.user_id}</td>
                        <td>{face.full_name}</td>
                        <td>{face.email}</td>
                        <td>
                          <Badge
                            color={
                              face.role_name === 'admin' ? 'danger' :
                                face.role_name === 'bếp' ? 'warning' : 'info'
                            }
                          >
                            {face.role_name}
                          </Badge>
                        </td>
                        <td>
                          <Badge color={face.is_trained ? 'success' : 'secondary'}>
                            {face.is_trained ? 'Đã training' : 'Chưa training'}
                          </Badge>
                        </td>
                        <td>{new Date(face.created_at).toLocaleDateString('vi-VN')}</td>
                        <td>
                          {!face.is_trained && (
                            <Button
                              color="success"
                              size="sm"
                              className="me-2"
                              onClick={() => {
                                setSelectedUserForTraining(face.user_id);
                                setShowTrainingModal(true);
                              }}
                              disabled={isTraining}
                            >
                              <i className="fas fa-brain me-1"></i>
                              Training
                            </Button>
                          )}
                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => deleteUser(face.user_id)}
                          >
                            <i className="fas fa-trash me-1"></i>
                            Xóa
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
          </CardBody>
        </Card>

        {/* Modal đăng ký khuôn mặt */}
        <Modal
          isOpen={showRegisterModal}
          toggle={() => {
            // Dừng camera khi đóng modal
            try { if (cameraStream) cameraStream.getTracks().forEach(t => t.stop()); } catch (e) {}
            setCameraStream(null);
            setIsCameraOn(false);
            setShowRegisterModal(false);
            resetRegistrationForm();
          }}
          size="xl"
          backdrop="static"
        >
          <ModalHeader toggle={() => {
            try { if (cameraStream) cameraStream.getTracks().forEach(t => t.stop()); } catch (e) {}
            setCameraStream(null);
            setIsCameraOn(false);
            setShowRegisterModal(false);
            resetRegistrationForm();
          }}>
            Đăng ký nhận diện khuôn mặt
          </ModalHeader>
            <ModalBody>
              <Row>
                {/* Cột trái: Form */}
                <Col md={6}>
                  <Form>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label>ID người dùng</Label>
                          <Input
                            type="number"
                            name="user_id"
                            value={registerFormData.user_id}
                            onChange={handleFormChange}
                          />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label>Quyền <span className="text-danger">*</span></Label>
                          <Input
                            type="select"
                            name="role"
                            value={registerFormData.role}
                            onChange={handleFormChange}
                          >
                            {FACE_RECOGNITION_CONSTANTS.ROLES.map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </Input>
                        </FormGroup>
                      </Col>
                    </Row>
                    <FormGroup>
                      <Label>Họ và tên <span className="text-danger">*</span></Label>
                      <Input
                        type="text"
                        name="full_name"
                        value={registerFormData.full_name}
                        onChange={handleFormChange}
                        placeholder="Nhập họ và tên"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Email <span className="text-danger">*</span></Label>
                      <Input
                        type="email"
                        name="email"
                        value={registerFormData.email}
                        onChange={handleFormChange}
                        placeholder="Nhập địa chỉ email"
                      />
                    </FormGroup>
                  </Form>
                </Col>

                {/* Cột phải: Camera + điều khiển */}
                <Col md={6}>
                  <Alert color="info" fade={false}>
                    <i className="fas fa-info-circle me-2"></i>
                    Hệ thống sẽ chụp {FACE_RECOGNITION_CONSTANTS.MAX_IMAGES} ảnh khuôn mặt của bạn.
                    Vui lòng nhìn thẳng vào camera và giữ khuôn mặt trong khung hình.
                  </Alert>

                  {cameraError && (
                    <Alert color="danger" fade={false}>
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
                        style={{ width: '400px', height: '300px', border: '2px solid #ddd', borderRadius: '8px', background: '#000' }}
                      />
                      {!isVideoReady && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} className="d-flex flex-column align-items-center justify-content-center text-white">
                          <Spinner color="light" />
                          <div className="mt-2 small">Đang chuẩn bị camera...</div>
                        </div>
                      )}
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                  </div>

                  <div className="d-flex gap-2 justify-content-center mb-3">
                    <Button color="secondary" onClick={() => {
                      try { if (cameraStream) cameraStream.getTracks().forEach(t => t.stop()); } catch (e) {}
                      setCameraStream(null);
                      setIsCameraOn(false);
                      setTimeout(() => initCamera(), 0);
                    }}>
                      <i className="fas fa-sync-alt me-1"></i>
                      Khởi động lại camera
                    </Button>
                    {!isRegistering ? (
                      <Button color="primary" onClick={startCapturing} disabled={!isVideoReady || !!cameraError}>
                        <i className="fas fa-camera me-1"></i>
                        Bắt đầu chụp ảnh
                      </Button>
                    ) : (
                      <Button color="warning" disabled>
                        <Spinner size="sm" className="me-2" /> Đang chụp...
                      </Button>
                    )}
                  </div>

                  {isRegistering && (
                    <div className="mb-2">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Tiến độ chụp ảnh:</span>
                        <span>{captureProgress}%</span>
                      </div>
                      <Progress value={captureProgress} color="success" />
                      <p className="text-center mt-2 text-muted">
                        Đã chụp {capturedImages.length}/{FACE_RECOGNITION_CONSTANTS.MAX_IMAGES} ảnh
                      </p>
                    </div>
                  )}
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => {
              setShowRegisterModal(false);
              resetRegistrationForm();
            }}>
              Đóng
            </Button>
          </ModalFooter>
        </Modal>

        {/* Modal training */}
        <Modal
          isOpen={showTrainingModal}
          toggle={() => setShowTrainingModal(false)}
          centered
        >
          <ModalHeader toggle={() => setShowTrainingModal(false)}>
            Training nhận diện khuôn mặt
          </ModalHeader>
          <ModalBody>
            <div className="text-center">
              {isTraining ? (
                <>
                  <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} className="mb-3" />
                  <h5>Đang training...</h5>
                  <p className="text-muted">
                    Hệ thống đang xử lý dữ liệu khuôn mặt. Quá trình này có thể mất vài phút.
                  </p>
                </>
              ) : (
                <>
                  <i className="fas fa-brain fa-4x text-primary mb-3"></i>
                  <h5>Training nhận diện khuôn mặt</h5>
                  <p className="text-muted">
                    Bạn có chắc muốn training dữ liệu khuôn mặt cho User ID: {selectedUserForTraining}?
                  </p>
                </>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => setShowTrainingModal(false)}
              disabled={isTraining}
            >
              Hủy
            </Button>
            <Button
              color="primary"
              onClick={() => startTraining(selectedUserForTraining)}
              disabled={isTraining}
            >
              {isTraining ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Đang training...
                </>
              ) : (
                'Bắt đầu training'
              )}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default FaceIndex;
