import React, { useEffect, useState, useRef, useMemo } from 'react';
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

  // State cho danh sách user có thể đăng ký
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

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

  // Tìm kiếm & Lọc
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // all | trained | untrained

  // Danh sách vai trò có trong dữ liệu (để render select)
  const roleOptions = useMemo(() => {
    const set = new Set((faces || []).map(f => f.role_name).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [faces]);

  // Áp dụng tìm kiếm và bộ lọc
  const filteredFaces = useMemo(() => {
    const text = (searchText || '').toLowerCase().trim();
    return (faces || []).filter(f => {
      // filter theo vai trò
      if (filterRole !== 'all' && f.role_name !== filterRole) return false;
      // filter theo trạng thái training
      if (filterStatus === 'trained' && !f.is_trained) return false;
      if (filterStatus === 'untrained' && f.is_trained) return false;
      // tìm theo tên hoặc email
      if (!text) return true;
      const name = (f.full_name || '').toLowerCase();
      const email = (f.email || '').toLowerCase();
      return name.includes(text) || email.includes(text);
    });
  }, [faces, searchText, filterRole, filterStatus]);

  // Fetch danh sách users có thể đăng ký
  const fetchAvailableUsers = async () => {
    try {
      const response = await faceRecognitionService.getAvailableUsers();
      if (response.success) {
        setAvailableUsers(response.data || []);
      } else {
        toast.error(response.message || 'Lỗi tải danh sách user');
      }
    } catch (error) {
      console.error('Fetch available users error:', error);
      toast.error('Lỗi kết nối server');
    }
  };

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
      const stream = await cameraUtils.initCamera(videoRef.current, {
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
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
      try {
        cameraStream.getTracks().forEach(t => t.stop());
      } catch (e) { }
      setCameraStream(null);
      setIsCameraOn(false);
      setIsVideoReady(false);
    }
  };

  // Bắt đầu quá trình đăng ký
  const startRegistration = () => {
    if (!selectedUser) {
      toast.error('Vui lòng chọn nhân viên để đăng ký!');
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
      if (videoRef.current && videoRef.current.srcObject !== cameraStream) {
        try { videoRef.current.srcObject = cameraStream; } catch (e) { }
        try {
          const p = videoRef.current.play();
          if (p && p.then) p.catch(() => { });
        } catch (e) { }
      }
      setIsVideoReady(true);
    }
  };

  // Chụp ảnh liên tiếp
  const startCapturing = async () => {
    setIsRegistering(true);
    setCaptureProgress(0);
    setCapturedImages([]);
    try {
      const totalImages = FACE_RECOGNITION_CONSTANTS.MAX_IMAGES;
      const captureInterval = FACE_RECOGNITION_CONSTANTS.CAPTURE_INTERVAL;
      if (!isVideoReady) setIsVideoReady(true);
      for (let i = 1; i <= totalImages; i++) {
        const imageData = cameraUtils.captureImage(videoRef.current, canvasRef.current);
        const resizedImage = await cameraUtils.resizeImage(imageData);
        const resp = await faceRecognitionService.captureface({
          user_id: parseInt(selectedUser, 10),
          image: resizedImage,
          image_count: i,
        });
        if (!resp.success) throw new Error(resp.message || `Lỗi chụp ảnh ${i}`);

        setCaptureProgress(Math.round((i / totalImages) * 100));
        setCapturedImages(prev => [...prev, resizedImage]);

        if (i < totalImages) {
          await new Promise(resolve => setTimeout(resolve, captureInterval));
        }
      }

      toast.success(`Đã chụp thành công ${totalImages} ảnh!`);

      // Auto train sau khi chụp
      try {
        const trainResp = await faceRecognitionService.trainFaces(parseInt(selectedUser, 10));
        if (trainResp.success) {
          toast.success(trainResp.message || 'Training thành công!');
        } else {
          toast.error(trainResp.message || 'Training thất bại');
        }
      } catch (e) {
        console.error('Auto train error:', e);
        toast.error('Lỗi gọi API training');
      }

      setRegistrationStep('complete');
      stopCamera();
      fetchFaces();
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
        fetchFaces();
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
    if (!window.confirm('Bạn có chắc muốn xóa dữ liệu khuôn mặt này?')) return;
    try {
      const response = await faceRecognitionService.deleteUserFace(userId);
      if (response.success) {
        toast.success(response.message || 'Xóa thành công!');
        fetchFaces();
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
    setSelectedUser('');
    setIsRegistering(false);
    setCaptureProgress(0);
    setCapturedImages([]);
    setRegistrationStep('form');
    stopCamera();
    setCameraError(null);
  };

  // Mở modal đăng ký
  const openRegisterModal = () => {
    resetRegistrationForm();
    fetchAvailableUsers();
    setShowRegisterModal(true);
    initCamera();
  };

  // Component lifecycle
  useEffect(() => {
    fetchFaces();
    fetchStatistics();
  }, []);

  useEffect(() => () => stopCamera(), []);

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumb title="Quản lý nhận diện khuôn mặt" breadcrumbItem="Nhận diện khuôn mặt" />

        {/* Thống kê tổng quan */}
        {statistics && (
          <Row className="mb-4">
            <Col md={3}>
              <Card><CardBody className="text-center">
                <h4 className="text-primary">{statistics.total_users}</h4>
                <p className="mb-0">Tổng số người dùng</p>
              </CardBody></Card>
            </Col>
            <Col md={3}>
              <Card><CardBody className="text-center">
                <h4 className="text-success">{statistics.trained_users}</h4>
                <p className="mb-0">Đã training</p>
              </CardBody></Card>
            </Col>
            <Col md={3}>
              <Card><CardBody className="text-center">
                <h4 className="text-warning">{statistics.untrained_users}</h4>
                <p className="mb-0">Chưa training</p>
              </CardBody></Card>
            </Col>
            <Col md={3}>
              <Card><CardBody className="text-center">
                <h4 className="text-info">
                  <Badge color={statistics.api_connected ? 'success' : 'danger'}>
                    {statistics.api_connected ? 'Kết nối' : 'Mất kết nối'}
                  </Badge>
                </h4>
                <p className="mb-0">API Python</p>
              </CardBody></Card>
            </Col>
          </Row>
        )}

        {/* Danh sách users */}
        <Card>
          <CardBody>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Danh sách nhận diện khuôn mặt</h5>
              <Button color="primary" onClick={openRegisterModal}>
                <i className="fas fa-plus me-1"></i>Đăng ký mới
              </Button>
            </div>
            {/* Bộ lọc và tìm kiếm */}
            <Row className="g-2 mb-3">
              <Col md={4}>
                <Input
                  type="text"
                  placeholder="Tìm theo họ tên hoặc email..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Input type="select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                  {roleOptions.map(opt => (
                    <option key={opt} value={opt}>
                      {opt === 'all' ? 'Tất cả quyền' : opt}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col md={3}>
                <Input type="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="all">Tất cả trạng thái</option>
                  <option value="trained">Đã training</option>
                  <option value="untrained">Chưa training</option>
                </Input>
              </Col>
              <Col md={2} className="d-grid">
                <Button color="secondary" onClick={() => { setSearchText(''); setFilterRole('all'); setFilterStatus('all'); }}>
                  Xóa bộ lọc
                </Button>
              </Col>
            </Row>
            {loading ? (
              <div className="text-center py-4">
                <Spinner color="primary" />
                <p className="mt-2">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>STT</th><th>Họ tên</th><th>Email</th>
                    <th>Quyền</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFaces.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-4">
                      <i className="fas fa-user-slash fa-3x text-muted mb-3"></i>
                      <p className="text-muted">Chưa có dữ liệu khuôn mặt nào</p>
                    </td></tr>
                  ) : filteredFaces.map((face, idx) => (
                    <tr key={face.id}>
                      <td>{idx + 1}</td>
                      <td>{face.full_name}</td>
                      <td>{face.email}</td>
                      <td>
                        <Badge color={
                          face.role_name === 'Admin' ? 'danger' :
                            face.role_name === 'Quản lý bếp' ? 'warning' : 'info'
                        }>{face.role_name}</Badge>
                      </td>
                      <td>
                        <Badge color={face.is_trained ? 'success' : 'secondary'}>
                          {face.is_trained ? 'Đã training' : 'Chưa training'}
                        </Badge>
                      </td>
                      <td>{new Date(face.created_at).toLocaleDateString('vi-VN')}</td>
                      <td>
                        {!face.is_trained && (
                          <Button color="success" size="sm" className="me-2"
                            onClick={() => { setSelectedUserForTraining(face.user_id); setShowTrainingModal(true); }}
                            disabled={isTraining}>
                            <i className="fas fa-brain me-1"></i>Training
                          </Button>
                        )}
                        <Button color="danger" size="sm" onClick={() => deleteUser(face.user_id)}>
                          <i className="fas fa-trash me-1"></i>Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </CardBody>
        </Card>

        {/* Modal đăng ký khuôn mặt */}
        <Modal isOpen={showRegisterModal} toggle={() => { stopCamera(); setShowRegisterModal(false); resetRegistrationForm(); }} size="xl" backdrop="static">
          <ModalHeader toggle={() => { stopCamera(); setShowRegisterModal(false); resetRegistrationForm(); }}>
            Đăng ký nhận diện khuôn mặt
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col md={12}>
                <Form>
                  <FormGroup>
                    <Label>Chọn nhân viên cần đăng ký <span className="text-danger">*</span></Label>
                    <Input type="select" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                      <option value="">-- Chọn nhân viên --</option>
                      {availableUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          [{user.id}] {user.full_name} - {user.email}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                  {selectedUser && (() => {
                    const user = availableUsers.find(u => u.id === parseInt(selectedUser, 10));
                    return user ? (
                      <div className="mb-3 p-2 border rounded bg-light">
                        <div><b>Họ tên:</b> {user.full_name}</div>
                        <div><b>Email:</b> {user.email}</div>
                        <div><b>Quyền:</b> {user.role_name}</div>
                      </div>
                    ) : null;
                  })()}
                </Form>
              </Col>
              <Col md={12}>
                <Alert color="info" fade={false}>
                  <i className="fas fa-info-circle me-2"></i>
                  Hệ thống sẽ chụp {FACE_RECOGNITION_CONSTANTS.MAX_IMAGES} ảnh khuôn mặt của bạn.
                </Alert>
                {cameraError && (
                  <Alert color="danger" fade={false}>
                    <i className="fas fa-exclamation-triangle me-2"></i>{cameraError}
                  </Alert>
                )}
                <div className="text-center mb-3">
                  <div className="position-relative d-inline-block">
                    <video ref={videoRef} autoPlay playsInline muted
                      style={{ width: '100%', height: '300px', border: '2px solid #ddd', borderRadius: '8px', background: '#000' }} />
                    {!isVideoReady && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }}
                        className="d-flex flex-column align-items-center justify-content-center text-white">
                        <Spinner color="light" />
                        <div className="mt-2 small">Đang chuẩn bị camera...</div>
                      </div>
                    )}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                  </div>
                </div>
                <div className="d-flex gap-2 justify-content-center mb-3">
                  <Button color="secondary" onClick={() => { stopCamera(); setTimeout(() => initCamera(), 0); }}>
                    <i className="fas fa-sync-alt me-1"></i>Khởi động lại camera
                  </Button>
                  {!isRegistering ? (
                    <Button color="primary" onClick={startCapturing} disabled={!isVideoReady || !!cameraError || !selectedUser}>
                      <i className="fas fa-camera me-1"></i>Bắt đầu chụp ảnh
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
                      <span>Tiến độ chụp ảnh:</span><span>{captureProgress}%</span>
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
            <Button color="secondary" onClick={() => { setShowRegisterModal(false); resetRegistrationForm(); }}>Đóng</Button>
          </ModalFooter>
        </Modal>

        {/* Modal training */}
        <Modal isOpen={showTrainingModal} toggle={() => setShowTrainingModal(false)} centered>
          <ModalHeader toggle={() => setShowTrainingModal(false)}>Training nhận diện khuôn mặt</ModalHeader>
          <ModalBody>
            <div className="text-center">
              {isTraining ? (
                <>
                  <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} className="mb-3" />
                  <h5>Đang training...</h5>
                  <p className="text-muted">Hệ thống đang xử lý dữ liệu khuôn mặt.</p>
                </>
              ) : (
                <>
                  <i className="fas fa-brain fa-4x text-primary mb-3"></i>
                  <h5>Training nhận diện khuôn mặt</h5>
                  <p className="text-muted">Bạn có chắc muốn training dữ liệu khuôn mặt cho User ID: {selectedUserForTraining}?</p>
                </>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setShowTrainingModal(false)} disabled={isTraining}>Hủy</Button>
            <Button color="primary" onClick={() => startTraining(selectedUserForTraining)} disabled={isTraining}>
              {isTraining ? (<><Spinner size="sm" className="me-2" />Đang training...</>) : 'Bắt đầu training'}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default FaceIndex;
