import React, { useEffect, useRef, useState } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Alert } from 'reactstrap';
import { toast } from 'react-toastify';
import { updateFace } from '@services/admin/faceService';

const ModalUpdateFace = ({ isOpen, toggle, userId, onSuccess }) => {
    const [capturedImages, setCapturedImages] = useState([]);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        let started = false;
        if (isOpen) {
            start();
            started = true;
        }
        return () => {
            if (started) stop();
        };
    }, [isOpen]);

    const start = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError('Trình duyệt không hỗ trợ camera!');
                return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
            }
            setError('');
        } catch (err) {
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
        setError('');
    };

    const capture = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        setCapturedImages([]);
        setProgress(0);
        let images = [];
        for (let i = 0; i < 10; i++) {
            const video = videoRef.current;
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
    };

    const handleSubmit = async () => {
        if (!userId) return setError('Thiếu User ID');
        if (!capturedImages.length) return setError('Vui lòng chụp đủ 10 ảnh');
        setIsProcessing(true);
        setError('');
        try {
            for (let i = 0; i < capturedImages.length; i++) {
                await updateFace(parseInt(userId, 10), capturedImages[i]);
                setProgress(i + 1);
            }
            toast.success('Cập nhật khuôn mặt thành công!');
            onSuccess && onSuccess();
            setCapturedImages([]);
            setProgress(0);
        } catch {
            setError('Cập nhật khuôn mặt thất bại');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
            <ModalHeader toggle={toggle}>Cập nhật khuôn mặt cho User #{userId}</ModalHeader>
            <ModalBody>
                {error && <Alert color="danger" timeout={3000}>{error}</Alert>}
                {capturedImages.length === 0 ? (
                    <div>
                        <video ref={videoRef} autoPlay playsInline muted className="w-100" style={{ maxHeight: 420, objectFit: 'cover' }} />
                        <div className="d-flex gap-2 mt-3">
                            <Button color="primary" onClick={capture}>Chụp 10 ảnh liên tiếp</Button>
                            <Button color="secondary" onClick={toggle}>Hủy</Button>
                        </div>
                        {progress > 0 && <div className="mt-2">Đã chụp {progress}/10 ảnh</div>}
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
                                {isProcessing ? `Đang gửi ${progress}/10...` : 'Lưu cập nhật'}
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

export default ModalUpdateFace;


