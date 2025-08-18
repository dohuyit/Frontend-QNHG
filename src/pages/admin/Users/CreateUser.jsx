import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { createUser, updateUser } from "@services/admin/userService";
import { getRoles } from "@services/admin/roleService";

export default function CreateUser({ user, onSuccess, onClose }) {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        full_name: "",
        email: "",
        phone_number: "",
        avatar: null,
        role_id: "",
    });

    const [roleOptions, setRoleOptions] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [previewAvatar, setPreviewAvatar] = useState(null);

    useEffect(() => {
        async function fetchRoles() {
            try {
                const res = await getRoles();
                setRoleOptions(res.data.data.items || []);
            } catch (error) {
                console.error("Không thể load vai trò", error);
                setRoleOptions([]);
            }
        }

        fetchRoles();
    }, []);


    useEffect(() => {
        if (user) {
            console.log('User data for editing:', user);
            console.log('Available role options:', roleOptions);
            
            // Xử lý role_id từ nhiều cấu trúc dữ liệu khác nhau
            let roleId = "";
            
            // Trường hợp 1: có role_id trực tiếp
            if (user.role_id) {
                roleId = String(user.role_id);
            } 
            // Trường hợp 2: có role object với id
            else if (user.role && typeof user.role === 'object' && user.role.id) {
                roleId = String(user.role.id);
            } 
            // Trường hợp 3: có role_name hoặc role string
            else if (user.role_name) {
                const foundRole = roleOptions.find(role => role.role_name === user.role_name);
                roleId = foundRole ? String(foundRole.id) : "";
            }
            else if (user.role && typeof user.role === 'string') {
                const foundRole = roleOptions.find(role => role.role_name === user.role);
                roleId = foundRole ? String(foundRole.id) : "";
            }
            // Trường hợp 4: có roles array (lấy role đầu tiên)
            else if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
                roleId = String(user.roles[0].id);
            }
            // Trường hợp 5: Backend chưa trả về thông tin role
            else {
                console.warn('Backend không trả về thông tin role cho user. Cần sửa backend để include role.');
                // Để trống để user có thể chọn role mới
                roleId = "";
            }

            console.log('Detected role_id:', roleId);
            console.log('User has role info?', {
                has_role_id: !!user.role_id,
                has_role: !!user.role,
                has_role_name: !!user.role_name,
                has_roles: !!user.roles
            });

            setFormData(prev => ({
                username: user.username || "",
                password: "",
                full_name: user.full_name || "",
                email: user.email || "",
                phone_number: user.phone_number || "",
                avatar: null,
                status: user.status || "active",
                role_id: roleId,
            }));

            if (user.avatar) {
                setPreviewAvatar(`http://localhost:8000/storage/${user.avatar}`);
            }
        }
    }, [user, roleOptions]);

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
            if (user && key === "password") continue; // Không gửi password khi cập nhật
            if (formData[key]) {
                payload.append(key, formData[key]);
            }
        }

        try {
            const res = user?.id
                ? await updateUser(user.id, payload)
                : await createUser(payload);

            Swal.fire("Thành công!", res.data.message || "Thành công", "success");
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
            <div className="row">
                <div className="col-md-6 mb-3">
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
                    <div className="col-md-6 mb-3">
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

                <div className="col-md-6 mb-3">
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

                <div className="col-md-6 mb-3">
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

                <div className="col-md-6 mb-3">
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

                <div className="col-md-6 mb-3">
                    <label className="form-label">Vai trò</label>
                    <select
                        name="role_id"
                        className={`form-select ${errors.role_id ? "is-invalid" : ""}`}
                        value={formData.role_id}
                        onChange={handleChange}
                    >
                        <option value="">-- Chọn vai trò --</option>
                        {Array.isArray(roleOptions) &&
                            roleOptions.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.role_name}
                                </option>
                            ))}
                    </select>
                    {errors.role_id && <div className="invalid-feedback">{errors.role_id[0]}</div>}
                </div>

                <div className="col-md-6 mb-3">
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
            </div>

            <div className="d-flex justify-content-end mt-3">
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
