"use client"

import { useState, useRef } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import Swal from "sweetalert2"
import { login as adminLogin, faceAuthLogin } from "@services/admin/authService"
import { redirectAfterLogin, getUserDisplayInfo } from "@services/admin/authRoutingService"
import { Coffee, Eye, EyeOff, Camera } from "lucide-react"
import "./AdminLogin.css"
import { faceRecognitionService, FACE_RECOGNITION_CONSTANTS } from "@services/admin/faceRecognitionService"

export default function AdminLogin() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const message = searchParams.get("message")

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const [errors, setErrors] = useState({})
    const [generalError, setGeneralError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Face recognition state
    const [isFaceRecognizing, setIsFaceRecognizing] = useState(false)
    const [registerUserId, setRegisterUserId] = useState("")
    const [registerRole, setRegisterRole] = useState("Admin")
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}
        
        if (!formData.email.trim()) {
            newErrors.email = "Email là bắt buộc"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ"
        }
        
        if (!formData.password) {
            newErrors.password = "Mật khẩu là bắt buộc"
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!validateForm()) return
        
        setIsLoading(true)
        setGeneralError("")
        
        try {
            const response = await adminLogin(formData)
            
            if (response.code === "SUCCESS") {
                // Lưu thông tin đăng nhập
                if (response.data.token) localStorage.setItem('admin_token', response.data.token)
                if (response.data.user) localStorage.setItem('admin_user', JSON.stringify(response.data.user))
                
                const userInfo = getUserDisplayInfo(response.data.user)
                const welcomeMessage = `Chào mừng ${userInfo.name}! (${userInfo.role})`
                
                Swal.fire("Thành công", welcomeMessage, "success").then(() => {
                    redirectAfterLogin(response.data.user, navigate)
                })
            } else {
                setGeneralError(response.message || "Đăng nhập thất bại")
            }
        } catch (error) {
            setGeneralError("Có lỗi xảy ra khi đăng nhập")
            console.error("Login error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Face recognition functions
    const startFaceRecognition = async () => {
        try {
            // Bật overlay trước để phần tử <video> được mount vào DOM
            setIsFaceRecognizing(true)

            // Chờ 1 tick để React render overlay và gán ref
            await new Promise(resolve => setTimeout(resolve, 0))

            // Đợi ref video sẵn sàng (tối đa ~1s)
            for (let i = 0; i < 20 && !videoRef.current; i++) {
                await new Promise(r => setTimeout(r, 50))
            }

            // Xin quyền camera và gán stream cho video
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                }
            })

            if (videoRef.current) {
                videoRef.current.srcObject = stream
                // Đảm bảo video phát
                try {
                    videoRef.current.setAttribute('playsinline', '')
                    videoRef.current.muted = true
                    const p = videoRef.current.play()
                    if (p && typeof p.then === 'function') {
                        p.catch(() => {})
                    }
                } catch (e) {}
            }
            streamRef.current = stream

            // Đợi camera sẵn sàng một chút
            await new Promise(resolve => setTimeout(resolve, 500))

            // Chụp một khung hình từ video
            const videoEl = videoRef.current
            const canvasEl = canvasRef.current
            if (!canvasEl) return
            const ctx = canvasEl.getContext('2d')
            canvasEl.width = videoEl.videoWidth || 640
            canvasEl.height = videoEl.videoHeight || 480
            ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height)
            const base64Image = canvasEl.toDataURL('image/jpeg')

            // Gọi Laravel API nhận diện để đồng bộ logic và token
            let faceResult
            try {
                faceResult = await faceRecognitionService.recognizeFace(base64Image)
            } catch (err) {
                // Nếu bị 401 (Unauthorized) do route bảo vệ, fallback gọi trực tiếp Flask API
                const status = err?.response?.status
                if (status === 401) {
                    const res = await fetch('http://localhost:5000/api/face/recognize', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: base64Image })
                    })
                    const data = await res.json().catch(() => ({}))
                    if (!res.ok || !data?.success) {
                        throw new Error(data?.message || 'Nhận diện thất bại (Flask)')
                    }
                    faceResult = data
                } else {
                    throw err
                }
            }

            if (!faceResult?.success) {
                throw new Error(faceResult?.message || 'Nhận diện thất bại')
            }

            // Lấy thông tin từ kết quả nhận diện
            const { user_info: userInfo, accuracy, user_id } = faceResult
            const accuracyPercentage = parseFloat(accuracy || 0)
            
            // Kiểm tra độ chính xác
            const autoLogin = accuracyPercentage >= FACE_RECOGNITION_CONSTANTS.MIN_ACCURACY
            
            const recognitionHtml = `
                <div style="text-align: left; font-size: 14px;">
                    <p><strong>Người dùng:</strong> ${userInfo?.full_name || 'N/A'}</p>
                    <p><strong>Email:</strong> ${userInfo?.email || 'N/A'}</p>
                    <p><strong>Quyền:</strong> ${userInfo?.role_name || 'N/A'}</p>
                    <p><strong>Độ chính xác:</strong> <span style="color: ${accuracyPercentage >= 80 ? '#28a745' : accuracyPercentage >= 60 ? '#ffc107' : '#dc3545'}; font-weight: bold;">${accuracyPercentage.toFixed(1)}%</span></p>
                </div>
            `

            if (autoLogin) {
                // Tự động đăng nhập nếu độ chính xác đủ cao
                const confidence = accuracyPercentage / 100; // 0-1

                // Ưu tiên dùng token trả về trực tiếp từ recognizeFace (nếu có)
                if (faceResult.login_success && faceResult.token) {
                    try {
                        localStorage.removeItem('admin_token')
                        localStorage.removeItem('admin_user')
                        localStorage.removeItem('roles')
                        localStorage.removeItem('permissions')
                    } catch (e) {}
                    localStorage.setItem('admin_token', faceResult.token)

                    const loggedUser = (faceResult?.data?.user) ? faceResult.data.user : {
                        id: userInfo?.id,
                        full_name: userInfo?.full_name,
                        email: userInfo?.email,
                        username: userInfo?.username,
                        roles: userInfo?.roles || [],
                        permissions: userInfo?.permissions || []
                    }
                    localStorage.setItem('admin_user', JSON.stringify(loggedUser))

                    await Swal.fire({
                        title: 'Đăng nhập thành công!',
                        html: recognitionHtml,
                        icon: 'success',
                        confirmButtonText: 'Vào trang quản trị',
                        timer: 3000,
                        timerProgressBar: true
                    })

                    redirectAfterLogin(loggedUser, navigate)
                    return
                }

                // Nếu recognizeFace không trả token, fallback gọi API tạo token
                const internalId = userInfo?.id ?? user_id
                const authResult = await faceAuthLogin(internalId, confidence)
                if (authResult.success && authResult.data?.token) {
                    try {
                        localStorage.removeItem('admin_token')
                        localStorage.removeItem('admin_user')
                        localStorage.removeItem('roles')
                        localStorage.removeItem('permissions')
                    } catch (e) {}
                    localStorage.setItem('admin_token', authResult.data.token)
                } else {
                    throw new Error('Không thể tạo token đăng nhập. Vui lòng thử lại.')
                }
                const loggedUser = {
                    id: authResult.data.user.id,
                    full_name: authResult.data.user.full_name,
                    email: authResult.data.user.email,
                    username: authResult.data.user.username,
                    roles: authResult.data.user.roles,
                    permissions: authResult.data.user.permissions
                }
                localStorage.setItem('admin_user', JSON.stringify(loggedUser))

                await Swal.fire({
                    title: 'Đăng nhập thành công!',
                    html: recognitionHtml,
                    icon: 'success',
                    confirmButtonText: 'Vào trang quản trị',
                    timer: 3000,
                    timerProgressBar: true
                })

                redirectAfterLogin(loggedUser, navigate)
            } else {
                // Hiển thị kết quả nhưng không tự động đăng nhập
                const result = await Swal.fire({
                    title: 'Kết quả nhận diện',
                    html: recognitionHtml,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Đăng nhập dù sao',
                    cancelButtonText: 'Hủy',
                    confirmButtonColor: accuracyPercentage >= 60 ? '#28a745' : '#dc3545'
                })

                if (result.isConfirmed) {
                    const confidence = accuracyPercentage / 100; // 0-1

                    // Nếu recognizeFace đã trả token thì dùng luôn
                    if (faceResult.login_success && faceResult.token) {
                        try {
                            localStorage.removeItem('admin_token')
                            localStorage.removeItem('admin_user')
                            localStorage.removeItem('roles')
                            localStorage.removeItem('permissions')
                        } catch (e) {}
                        localStorage.setItem('admin_token', faceResult.token)

                        const loggedUser = (faceResult?.data?.user) ? faceResult.data.user : {
                            id: userInfo?.id,
                            full_name: userInfo?.full_name,
                            email: userInfo?.email,
                            username: userInfo?.username,
                            roles: userInfo?.roles || [],
                            permissions: userInfo?.permissions || []
                        }
                        localStorage.setItem('admin_user', JSON.stringify(loggedUser))

                        Swal.fire('Thành công', 'Đăng nhập thành công!', 'success').then(() => {
                            redirectAfterLogin(loggedUser, navigate)
                        })
                        return
                    }

                    // Fallback: gọi API tạo token
                    const internalId = userInfo?.id ?? user_id
                    const authResult = await faceAuthLogin(internalId, confidence)
                    if (authResult.success && authResult.data?.token) {
                        try {
                            localStorage.removeItem('admin_token')
                            localStorage.removeItem('admin_user')
                            localStorage.removeItem('roles')
                            localStorage.removeItem('permissions')
                        } catch (e) {}
                        localStorage.setItem('admin_token', authResult.data.token)
                        
                        const loggedUser = {
                            id: authResult.data.user.id,
                            full_name: authResult.data.user.full_name,
                            email: authResult.data.user.email,
                            username: authResult.data.user.username,
                            roles: authResult.data.user.roles,
                            permissions: authResult.data.user.permissions
                        }
                        localStorage.setItem('admin_user', JSON.stringify(loggedUser))
                    } else {
                        Swal.fire('Lỗi', 'Không thể tạo token đăng nhập. Vui lòng thử lại.', 'error')
                        return
                    }
                    
                    Swal.fire('Thành công', 'Đăng nhập thành công!', 'success').then(() => {
                        const loggedUser = JSON.parse(localStorage.getItem('admin_user') || '{}')
                        redirectAfterLogin(loggedUser, navigate)
                    })
                }
            }
        } catch (error) {
            Swal.fire('Lỗi', error.message || 'Không thể nhận diện/đăng nhập bằng khuôn mặt.', 'error')
            console.error('Face login error:', error)
        } finally {
            // Dừng camera
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
                streamRef.current = null
            }
            setIsFaceRecognizing(false)
        }
    }

    const registerFace = async () => {
        try {
            if (!registerUserId) {
                Swal.fire('Thiếu thông tin', 'Vui lòng nhập User ID để đăng ký khuôn mặt', 'warning')
                return
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                }
            })

            if (!videoRef.current) return

            videoRef.current.srcObject = stream
            streamRef.current = stream

            await new Promise(resolve => setTimeout(resolve, 500))

            const videoEl = videoRef.current
            const canvasEl = canvasRef.current
            if (!canvasEl) return
            const ctx = canvasEl.getContext('2d')
            canvasEl.width = videoEl.videoWidth || 640
            canvasEl.height = videoEl.videoHeight || 480
            ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height)
            const base64Image = canvasEl.toDataURL('image/jpeg')

            const res = await fetch('http://localhost:8000/api/admin/face-auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: Number(registerUserId),
                    role_name: registerRole,
                    face_image: base64Image
                })
            })

            const data = await res.json().catch(() => ({}))
            if (!res.ok || !data?.success) {
                throw new Error(data?.message || 'Đăng ký khuôn mặt thất bại')
            }

            Swal.fire('Thành công', 'Đăng ký khuôn mặt thành công!', 'success')
        } catch (error) {
            console.error('Register face error:', error)
            Swal.fire('Lỗi', error.message || 'Không thể đăng ký khuôn mặt.', 'error')
        } finally {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
                streamRef.current = null
            }
        }
    }

    const stopFaceRecognition = () => {
        setIsFaceRecognizing(false)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
    }

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <div className="admin-login-logo-container">
                        <Coffee className="admin-login-logo-icon" />
                        <h1>QNHG Restaurant</h1>
                    </div>
                    <p className="admin-login-subtitle">Hệ thống quản lý nhà hàng</p>
                </div>

                {message && (
                    <div className="admin-login-alert admin-login-alert-info">
                        {message}
                    </div>
                )}

                {generalError && (
                    <div className="admin-login-alert admin-login-alert-danger">
                        {generalError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="admin-login-form">
                    <div className="admin-login-form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`admin-login-form-control ${errors.email ? 'admin-login-is-invalid' : ''}`}
                            placeholder="Nhập email của bạn"
                        />
                        {errors.email && <div className="admin-login-invalid-feedback">{errors.email}</div>}
                    </div>

                    <div className="admin-login-form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <div className="admin-login-password-input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`admin-login-form-control ${errors.password ? 'admin-login-is-invalid' : ''}`}
                                placeholder="Nhập mật khẩu của bạn"
                            />
                            <button
                                type="button"
                                className="admin-login-password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && <div className="admin-login-invalid-feedback">{errors.password}</div>}
                    </div>

                    <button
                        type="submit"
                        className="admin-login-btn admin-login-btn-primary admin-login-btn-block"
                        disabled={isLoading}
                    >
                        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                </form>

                {/* Face Recognition Section */}
                <div className="admin-login-face-auth-section">
                    <h4>Xác thực bằng khuôn mặt</h4>
                    <div className="admin-login-face-auth-buttons">
                        <button
                            className="admin-login-btn admin-login-btn-success admin-login-btn-block admin-login-mb-2"
                            onClick={startFaceRecognition}
                            disabled={isFaceRecognizing}
                        >
                            <Camera size={20} className="admin-login-me-2" />
                            {isFaceRecognizing ? "Đang nhận diện..." : "Đăng nhập bằng khuôn mặt"}
                        </button>
                    </div>
                    
                </div>
                <div className="admin-login-footer">
                    <p>
                        <Link to="/admin/forgot-password">Quên mật khẩu?</Link>
                    </p>
                </div>
            </div>

            {/* Overlay camera centered */}
            {isFaceRecognizing && (
                <div className="admin-face-overlay">
                    <div className="admin-face-modal">
                        <div className="admin-face-modal-header">
                            <h3>Đang nhận diện khuôn mặt</h3>
                            <button type="button" className="admin-face-close-btn" onClick={stopFaceRecognition}>
                                Đóng
                            </button>
                        </div>
                        <video
                            ref={videoRef}
                            className="admin-face-video"
                            autoPlay
                            muted
                            playsInline
                        />
                    </div>
                </div>
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    )
}
