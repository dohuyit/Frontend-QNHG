import React, { useState, useEffect } from "react";
import { createPermissionGroup, updatePermissionGroup } from "@services/admin/permissiongroupService.js";
import Swal from "sweetalert2";

export default function CreatePermissionGroup({ onSuccess, onClose, group = null }) {
    const [formData, setFormData] = useState({
        group_name: "",
        description: ""
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (group) {
            setFormData({
                group_name: group.group_name || "",
                description: group.description || ""
            });
        }
    }, [group]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        const action = group
            ? updatePermissionGroup(group.id, formData)
            : createPermissionGroup(formData);

        action
            .then(() => {
                Swal.fire({
                    icon: "success",
                    title: "Thành công!",
                    text: group ? "🎉 Nhóm quyền đã được cập nhật!" : "🎉 Nhóm quyền đã được thêm thành công!",
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
                        formattedErrors[key] = Array.isArray(errData[key]) ? errData[key] : [errData[key]];
                    }
                    setErrors(formattedErrors);
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Lỗi!",
                        text: group ? "Lỗi khi cập nhật nhóm quyền." : "Đã xảy ra lỗi khi thêm nhóm quyền.",
                        confirmButtonText: "OK"
                    });
                }
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label fw-semibold">🔐 Tên nhóm quyền</label>
                <input
                    type="text"
                    name="group_name"
                    placeholder="Nhập tên nhóm quyền (VD: quản trị hệ thống...)"
                    className={`form-control ${errors.group_name ? "is-invalid" : ""}`}
                    value={formData.group_name}
                    onChange={handleChange}
                />
                {errors.group_name && <div className="invalid-feedback">{errors.group_name[0]}</div>}
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold">📝 Mô tả</label>
                <textarea
                    name="description"
                    placeholder="Mô tả chức năng, quyền hạn của nhóm"
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
                    {group ? "Cập nhật Nhóm quyền" : "Lưu Nhóm quyền"}
                </button>
            </div>
        </form>
    );
}
