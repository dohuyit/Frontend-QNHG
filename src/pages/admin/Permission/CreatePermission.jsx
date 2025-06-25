import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { createPermission, updatePermission } from "@services/admin/permissionService.js";
import { getPermissionGroups } from "@services/admin/permissiongroupService.js";

export default function CreatePermission({ permission = null, onSuccess, onClose }) {
    const [formData, setFormData] = useState({
        permission_name: "",
        permission_key: "",
        description: "",
        permission_group_id: ""
    });

    const [errors, setErrors] = useState({});
    const [groupOptions, setGroupOptions] = useState([]);

    useEffect(() => {
        getPermissionGroups()
            .then(res => {
                const items = res.data?.data?.items || res.data?.data || res.data || [];
                setGroupOptions(items);
            })
            .catch(err => {
                console.error("Lỗi khi tải nhóm quyền:", err);
                Swal.fire("Lỗi", "Không thể tải danh sách nhóm quyền", "error");
            });

        if (permission) {
            setFormData({
                permission_name: permission.permission_name || "",
                permission_key: permission.permission_key || "",
                description: permission.description || "",
                permission_group_id: permission.permission_group_id?.toString() || ""
            });
        }
    }, [permission]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        const payload = {
            ...formData,
            permission_group_id: Number(formData.permission_group_id)
        };

        const action = permission
            ? updatePermission(permission.id, payload)
            : createPermission(payload);

        action
            .then(() => {
                Swal.fire({
                    icon: "success",
                    title: "Thành công!",
                    text: permission ? "Cập nhật quyền thành công!" : "Thêm quyền thành công!",
                    timer: 1500
                });
                onSuccess?.();
            })
            .catch((err) => {
                const errs = err.response?.data?.errors || {};
                const formatted = {};
                for (const key in errs) {
                    formatted[key] = Array.isArray(errs[key]) ? errs[key] : [errs[key]];
                }
                setErrors(formatted);
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label fw-semibold">🔐 Tên quyền</label>
                <input
                    type="text"
                    className={`form-control ${errors.permission_name ? "is-invalid" : ""}`}
                    name="permission_name"
                    value={formData.permission_name}
                    onChange={handleChange}
                    placeholder="Nhập tên quyền (VD: Tạo bài viết...)"
                />
                {errors.permission_name && <div className="invalid-feedback">{errors.permission_name[0]}</div>}
            </div>
            <div className="mb-3">
                <label className="form-label fw-semibold"> Nhóm quyền</label>
                <select
                    name="permission_group_id"
                    className={`form-control ${errors.permission_group_id ? "is-invalid" : ""}`}
                    value={formData.permission_group_id}
                    onChange={handleChange}
                >
                    <option value="">-- Chọn nhóm quyền --</option>
                    {groupOptions.map(group => (
                        <option key={group.id} value={group.id}>
                            {group.group_name}
                        </option>
                    ))}
                </select>
                {errors.permission_group_id && (
                    <div className="invalid-feedback">{errors.permission_group_id[0]}</div>
                )}
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold">📝 Mô tả</label>
                <textarea
                    className={`form-control ${errors.description ? "is-invalid" : ""}`}
                    name="description"
                    rows="3"
                    placeholder="Mô tả chi tiết chức năng của quyền"
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
                    {permission ? "Cập nhật quyền" : "Thêm quyền"}
                </button>
            </div>
        </form>
    );
}
