import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { createUser, updateUser } from "@services/admin/userService";

export default function CreateUser({ user, onSuccess, onClose }) {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        full_name: "",
        email: "",
        phone_number: "",
        avatar: null,
        status: "active",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [previewAvatar, setPreviewAvatar] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                password: "", // Không dùng trong cập nhật
                full_name: user.full_name || "",
                email: user.email || "",
                phone_number: user.phone_number || "",
                avatar: null,
                status: user.status || "active",
            });

            if (user.avatar) {
                setPreviewAvatar(`http://localhost:8000/storage/${user.avatar}`);
            }
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (files) {
            const file = files[0];
            setFormData((prev) => ({
                ...prev,
                [name]: file,
            }));

            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewAvatar(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        const payload = new FormData();

        for (const key in formData) {
            if (user && key === "password") continue; // Không gửi password khi update
            if (formData[key]) {
                payload.append(key, formData[key]);
            }
        }

        try {
            if (user?.id) {
                await updateUser(user.id, payload); // Gọi update
            } else {
                await createUser(payload); // Gọi create
            }

            Swal.fire(
                "Thành công!",
                user ? "Cập nhật người dùng thành công!" : "Thêm người dùng thành công!",
                "success"
            );
            onSuccess?.();
        } catch (err) {
            const errs = err.response?.data?.errors || {};
            const formatted = {};
            for (const key in errs) {
                formatted[key] = Array.isArray(errs[key]) ? errs[key] : [errs[key]];
            }
            setErrors(formatted);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="mb-3">
                <label className="form-label">Tên đăng nhập</label>
                <input
                    type="text"
                    name="username"
                    className={`form-control ${errors.username ? "is-invalid" : ""}`}
                    value={formData.username}
                    onChange={handleChange}
                />
                {errors.username && <div className="invalid-feedback">{errors.username[0]}</div>}
            </div>

            {!user && (
                <div className="mb-3">
                    <label className="form-label">Mật khẩu</label>
                    <input
                        type="password"
                        name="password"
                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password[0]}</div>}
                </div>
            )}

            <div className="mb-3">
                <label className="form-label">Họ và tên</label>
                <input
                    type="text"
                    name="full_name"
                    className={`form-control ${errors.full_name ? "is-invalid" : ""}`}
                    value={formData.full_name}
                    onChange={handleChange}
                />
                {errors.full_name && <div className="invalid-feedback">{errors.full_name[0]}</div>}
            </div>

            <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                    type="text"
                    name="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    value={formData.email}
                    onChange={handleChange}
                />

                {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
            </div>

            <div className="mb-3">
                <label className="form-label">Số điện thoại</label>
                <input
                    type="text"
                    name="phone_number"
                    className={`form-control ${errors.phone_number ? "is-invalid" : ""}`}
                    value={formData.phone_number}
                    onChange={handleChange}
                />
                {errors.phone_number && <div className="invalid-feedback">{errors.phone_number[0]}</div>}
            </div>

            <div className="mb-3">
                <label className="form-label">Ảnh đại diện</label>
                <div className="d-flex align-items-center gap-3">
                    <input
                        type="file"
                        name="avatar"
                        className={`form-control ${errors.avatar ? "is-invalid" : ""}`}
                        onChange={handleChange}
                        accept="image/*"
                    />
                    {previewAvatar && (
                        <img
                            src={previewAvatar}
                            alt="Avatar preview"
                            style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "1px solid #ddd",
                            }}
                        />
                    )}
                </div>
                {errors.avatar && <div className="invalid-feedback">{errors.avatar[0]}</div>}
            </div>

            <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={onClose} disabled={loading}>
                    Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Đang xử lý..." : user ? "Cập nhật" : "Thêm người dùng"}
                </button>
            </div>
        </form>
    );
}
