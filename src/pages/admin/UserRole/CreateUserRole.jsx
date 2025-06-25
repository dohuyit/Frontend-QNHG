import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { createUserRole, updateUserRole } from "@services/admin/userRoleService";
import { getUsers } from "@services/admin/userService";
import { getRoles } from "@services/admin/roleService";

export default function CreateUserRole({ userRole, onSuccess, onClose }) {
    const [formData, setFormData] = useState({
        user_id: "",
        role_id: ""
    });

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    // Gán lại formData khi có dữ liệu userRole được truyền vào (edit)
    useEffect(() => {
        if (userRole) {
            setFormData({
                user_id: userRole.user_id,
                role_id: userRole.role_id,
            });
        }
    }, [userRole]);

    const fetchUsers = async () => {
        try {
            const res = await getUsers();
            setUsers(res.data?.data?.items || []);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách users:", err);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await getRoles();
            setRoles(res.data?.data?.items || []);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách roles:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            if (userRole?.id) {
                await updateUserRole(userRole.id, formData);
                Swal.fire("Thành công", "Đã cập nhật phân quyền", "success");
            } else {
                await createUserRole(formData);
                Swal.fire("Thành công", "Đã thêm phân quyền", "success");
            }
            onSuccess?.();
        } catch (err) {
            const response = err.response?.data;
            console.log("API error response:", response);
            if (response?.errors && Object.keys(response.errors).length > 0) {
                setErrors(response.errors);
            } else if (response?.message) {
                Swal.fire("Lỗi", response.message, "error");
            } else {
                Swal.fire("Lỗi", "Đã xảy ra lỗi không xác định", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    const renderError = (field) => {
        const error = errors[field];
        if (!error) return null;
        return (
            <div className="invalid-feedback d-block">
                {Array.isArray(error) ? error[0] : error}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Người dùng</label>
                <select
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    className={`form-control ${errors.user_id ? "is-invalid" : ""}`}
                >
                    <option value="">-- Chọn người dùng --</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.full_name} ({user.username})
                        </option>
                    ))}
                </select>
                {renderError("user_id")}
            </div>

            <div className="mb-3">
                <label className="form-label">Vai trò</label>
                <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleChange}
                    className={`form-control ${errors.role_id ? "is-invalid" : ""}`}
                >
                    <option value="">-- Chọn vai trò --</option>
                    {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                            {role.role_name}
                        </option>
                    ))}
                </select>
                {renderError("role_id")}
            </div>

            <div className="d-flex justify-content-end">
                <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={onClose}
                    disabled={loading}
                >
                    Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Đang xử lý..." : userRole ? "Cập nhật" : "Thêm"}
                </button>
            </div>
        </form>
    );
}
