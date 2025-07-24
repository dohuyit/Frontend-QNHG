import React, { useState } from "react";
import Swal from "sweetalert2";
import { changePassword } from "@services/admin/authService";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";

export default function ChangePassword() {
    const [formData, setFormData] = useState({
        old_password: "",
        new_password: "",
        new_password_confirmation: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const validate = () => {
        const errs = {};
        if (!formData.old_password) errs.old_password = "Mật khẩu cũ không được để trống";
        if (!formData.new_password) errs.new_password = "Mật khẩu mới không được để trống";
        if (formData.new_password !== formData.new_password_confirmation)
            errs.new_password_confirmation = "Mật khẩu xác nhận không khớp";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        const validationErrors = validate();
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }

        try {
            await changePassword(formData);
            Swal.fire("Thành công", "Đổi mật khẩu thành công!", "success");
            setFormData({ old_password: "", new_password: "", new_password_confirmation: "" });
        } catch (err) {
            const response = err.response;
            const message = response?.data?.message || "Đổi mật khẩu thất bại!";
            Swal.fire("Lỗi", message, "error");
        }
    };

    return (
        <div className="page-content">
            <Breadcrumbs title="Đổi mật khẩu" breadcrumbItem="Tài khoản" />
            <div className="container" style={{ maxWidth: 500 }}>
                <h4 className="mb-4">Đổi Mật Khẩu</h4>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-3">
                        <label className="form-label">Mật khẩu cũ</label>
                        <input
                            type="password"
                            name="old_password"
                            value={formData.old_password}
                            onChange={handleChange}
                            className={`form-control ${errors.old_password ? "is-invalid" : ""}`}
                        />
                        {errors.old_password && <div className="invalid-feedback">{errors.old_password}</div>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Mật khẩu mới</label>
                        <input
                            type="password"
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleChange}
                            className={`form-control ${errors.new_password ? "is-invalid" : ""}`}
                        />
                        {errors.new_password && <div className="invalid-feedback">{errors.new_password}</div>}
                    </div>

                    <div className="mb-4">
                        <label className="form-label">Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            name="new_password_confirmation"
                            value={formData.new_password_confirmation}
                            onChange={handleChange}
                            className={`form-control ${errors.new_password_confirmation ? "is-invalid" : ""}`}
                        />
                        {errors.new_password_confirmation && (
                            <div className="invalid-feedback">{errors.new_password_confirmation}</div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                        Đổi Mật Khẩu
                    </button>
                </form>
            </div>
        </div>
    );
}
