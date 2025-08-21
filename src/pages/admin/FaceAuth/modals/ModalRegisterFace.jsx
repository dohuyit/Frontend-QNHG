import React, { useEffect, useRef, useState } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Alert, Input, Label, FormGroup } from 'reactstrap';
import { toast } from 'react-toastify';
import { faceRecognitionService } from '@services/admin/faceRecognitionService';
// Modal sử dụng backend Laravel, không gọi trực tiếp Python API

const ModalRegisterFace = ({ isOpen, toggle, onSuccess }) => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [capturedImages, setCapturedImages] = useState([]);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

useEffect(() => {
        let started = false;
        if (isOpen) {
            fetchAvailableUsers();
            start();
            started = true;
        }
        return () => {
            if (started) stop();
        };
    }, [isOpen]);

  const fetchAvailableUsers = async () => {
    try {
      const res = await faceRecognitionService.getAvailableUsers();
      if (res.success) {
        setAvailableUsers(res.data || []);
      } else {
        toast.error(res.message || 'Không thể tải danh sách người dùng');
      }
    } catch (e) {
      toast.error('Lỗi kết nối server khi tải danh sách người dùng');
    }
  };

  const start = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Trình duyệt không hỗ trợ camera!');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        // Đảm bảo video phát sau khi gán stream
        const tryPlay = async () => {
          try {
            await videoRef.current.play();
          } catch (_) {}
        };
        videoRef.current.onloadedmetadata = () => tryPlay();
        // Fallback: thử play ngay
        tryPlay();
      }
      setError('');
    } catch (err) {
      console.error('Camera start error:', err);
      setError('Không thể truy cập camera: ' + (err?.message || ''));
    }
  };

  const stop = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      streamRef.current = null;
    }
    setCapturedImages([]);
    setProgress(0);
    setSelectedUser('');
    setError('');
  };

  const capture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setCapturedImages([]);
    setProgress(0);
    let images = [];
    setIsCapturing(true);
    // Đợi video sẵn sàng trước khi chụp
    const video = videoRef.current;
    if (video.readyState < 2) {
      await new Promise(resolve => {
        const onReady = () => {
          video.removeEventListener('loadeddata', onReady);
          resolve();
        };
        video.addEventListener('loadeddata', onReady);
      });
    }
    for (let i = 0; i < 10; i++) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.85);
      images.push(base64);
      setProgress(i + 1);
      await new Promise(res => setTimeout(res, 200));
    }
    setCapturedImages(images);
    setIsCapturing(false);
  };

  const handleSubmit = async () => {
    if (!selectedUser) return setError('Vui lòng chọn nhân viên');
    if (capturedImages.length !== 10) return setError('Vui lòng chụp đủ 10 ảnh');
    setIsProcessing(true);
    setError('');
    try {
      for (let i = 0; i < capturedImages.length; i++) {
        const resp = await faceRecognitionService.captureface({
          user_id: parseInt(selectedUser, 10),
          image: capturedImages[i],
          image_count: i + 1,
        });
        if (!resp.success) throw new Error(resp.message || 'Lỗi khi gửi ảnh');
        setProgress(i + 1);
      }
      // Gọi train model sau khi upload ảnh xong (qua backend Laravel)
      const trainResp = await faceRecognitionService.trainFaces(parseInt(selectedUser, 10));
      if (!trainResp.success) throw new Error(trainResp.message || 'Training model thất bại');

      toast.success('Đăng ký và training khuôn mặt thành công!');
      onSuccess && onSuccess();
      setCapturedImages([]);
      setProgress(0);
    } catch (err) {
      setError('Đăng ký khuôn mặt thất bại: ' + (err?.message || ''));
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>Đăng ký khuôn mặt</ModalHeader>
      <ModalBody>
        {error && <Alert color="danger" timeout={3000}>{error}</Alert>}
        <FormGroup>
          <Label>Chọn nhân viên</Label>
          <Input
            type="select"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">-- Chọn người dùng --</option>
            {availableUsers.map(u => (
              <option key={u.id} value={u.id} disabled={u.has_face_registered}>
                {u.full_name || u.username} ({u.email}) {u.has_face_registered ? ' - Đã đăng ký' : ''}
              </option>
            ))}
          </Input>
        </FormGroup>
        {capturedImages.length === 0 ? (
          <div>
            <video ref={videoRef} autoPlay playsInline muted className="w-100" style={{ maxHeight: 420, objectFit: 'cover', background: '#000' }} />
            <div className="d-flex gap-2 mt-3">
              <Button color="primary" onClick={capture} disabled={!!error || isCapturing}>
                {isCapturing && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                {isCapturing ? 'Đang chụp...' : 'Chụp 10 ảnh liên tiếp'}
              </Button>
              <Button color="secondary" onClick={toggle}>Hủy</Button>
            </div>
            {progress > 0 && (
              <div className="mt-2 text-muted">
                Đã chụp {progress}/10 ảnh
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {capturedImages.map((img, idx) => (
                <img key={idx} src={img} alt={`face${idx}`} style={{ width: 64, height: 64, objectFit: 'cover', border: '1px solid #ccc' }} />
              ))}
            </div>
            <div className="d-flex gap-2 mt-3">
              <Button color="success" disabled={isProcessing} onClick={handleSubmit}>
                {isProcessing ? `Đang gửi ${progress}/10...` : 'Lưu đăng ký'}
              </Button>
              <Button color="warning" onClick={() => { setCapturedImages([]); setProgress(0); }}>Chụp lại</Button>
              <Button color="secondary" onClick={toggle}>Đóng</Button>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </ModalBody>
    </Modal>
  );
};

export default ModalRegisterFace;


