import React, { useState, useEffect } from "react";
import { createRole, updateRole } from "@services/admin/roleService"; // ✅ import update
import Swal from "sweetalert2";

export default function CreateRole({ onSuccess, onClose, role = null }) {
    const [formData, setFormData] = useState({
        role_name: "",
        description: ""
    });
    const [errors, setErrors] = useState({});

    // ✅ Fill dữ liệu nếu đang ở chế độ sửa
    useEffect(() => {
        if (role) {
            setFormData({
                role_name: role.role_name || "",
                description: role.description || ""
            });
        }
    }, [role]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        const action = role ? updateRole(role.id, formData) : createRole(formData); // ✅ Phân biệt thêm/sửa

        action
            .then(() => {
                Swal.fire({
                    icon: "success",
                    title: "Thành công!",
                    text: role ? "🎉 Vai trò đã được cập nhật!" : "🎉 Vai trò đã được thêm thành công!",
                    confirmButtonText: "OK",
                    timer: 2000,
                }).then(() => {
                    onSuccess?.();
                });
            })
            .catch((error) => {
                const errData = error.response?.data?.errors;
                if (errData) {
                    const formattedErrors = {};
                    for (const key in errData) {
                        formattedErrors[key] = Array.isArray(errData[key])
                            ? errData[key]
                            : [errData[key]];
                    }

                    setErrors(formattedErrors);
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Lỗi!",
                        text: role ? "Lỗi khi cập nhật vai trò." : "Đã xảy ra lỗi khi thêm vai trò.",
                        confirmButtonText: "OK"
                    });
                }
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label fw-semibold">🔑 Mã vai trò</label>
                <input
                    type="text"
                    name="role_name"
                    placeholder="Nhập mã vai trò (VD: admin, editor...)"
                    className={`form-control ${errors.role_name ? "is-invalid" : ""}`}
                    value={formData.role_name}
                    onChange={handleChange}
                />
                {errors.role_name && <div className="invalid-feedback">{errors.role_name[0]}</div>}
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold">📝 Mô tả</label>
                <textarea
                    name="description"
                    placeholder="Mô tả quyền hạn, chức năng của vai trò"
                    className={`form-control ${errors.description ? "is-invalid" : ""}`}
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                ></textarea>
                {errors.description && <div className="invalid-feedback">{errors.description[0]}</div>}
            </div>

            <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={onClose}>
                    Hủy
                </button>
                <button type="submit" className="btn btn-success">
                    <i className="bi bi-check-circle me-1"></i>
                    {role ? "Cập nhật Vai Trò" : "Lưu Vai Trò"}
                </button>
            </div>
        </form>
    );
}
