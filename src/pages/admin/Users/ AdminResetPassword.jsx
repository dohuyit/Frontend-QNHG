import React, { useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import Swal from "sweetalert2"
import { resetPassword } from "@services/admin/authService"
import { Eye, EyeOff } from "lucide-react" // Nếu bạn dùng Lucide

export default function AdminResetPassword() {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!password || !confirmPassword) {
            setError("Vui lòng nhập đầy đủ mật khẩu")
            return
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu không khớp")
            return
        }

        try {
            await resetPassword(id, {
                token,
                password,
                password_confirmation: confirmPassword,
            })

            Swal.fire("Thành công!", "Mật khẩu đã được đặt lại.", "success").then(() => {
                navigate("/admin/login?message=Đặt lại mật khẩu thành công!")
            })
        } catch (err) {
            const msg = err?.response?.data?.message || "Lỗi đặt lại mật khẩu!"
            Swal.fire("Lỗi", msg, "error")
        }
    }

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="card p-4 shadow" style={{ width: "100%", maxWidth: "400px" }}>
                <h3 className="mb-4 text-center">🔒 Đặt lại mật khẩu</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Mật khẩu mới</label>
                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Xác nhận mật khẩu</label>
                        <div className="input-group">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="form-control"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger py-2">{error}</div>
                    )}

                    <button type="submit" className="btn btn-primary w-100">
                        Xác nhận
                    </button>
                </form>

                <div className="text-center mt-3">
                    <a href="/admin/login">← Quay lại đăng nhập</a>
                </div>
            </div>
        </div>
    )
}
