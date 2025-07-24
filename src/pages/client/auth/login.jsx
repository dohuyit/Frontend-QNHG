import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.scss';
import { loginUser } from '@services/client/auth/loginService';
import { toast } from 'react-toastify';
import thumb1 from "@assets/client/images/auth/thumb1.webp";
import thumb2 from "@assets/client/images/auth/thumb2.webp";
import thumb3 from "@assets/client/images/auth/thumb3.webp";
import thumb4 from "@assets/client/images/auth/thumb4.webp";

export default function LoginUserPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const res = await loginUser(form);

      if (res?.data?.token) {
        localStorage.setItem('token', res.data.token);
        if (res.data.user) {
          const { id, email, full_name, phone_number } = res.data.user;
          localStorage.setItem('clientUser', JSON.stringify({
            id,
            email,
            full_name,
            phone: phone_number // Lưu số điện thoại
          }));
        }
        window.dispatchEvent(new Event('storage'));
      }

      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      const apiErrors = error.response?.data?.errors;
      const message = error.response?.data?.message || 'Email hoặc mật khẩu không đúng.';

      if (apiErrors) {
        setErrors(apiErrors);
      }

      toast.error(message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-left">
          <div className="auth-images-grid">
            <div className="auth-image-item"><img src={thumb1} alt="" /></div>
            <div className="auth-image-item"><img src={thumb2} alt="" /></div>
            <div className="auth-image-item"><img src={thumb3} alt="" /></div>
            <div className="auth-image-item"><img src={thumb4} alt="" /></div>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-form-box">
            <div className="auth-title">ĐĂNG NHẬP THÀNH VIÊN</div>
            {success && <div className="alert success">Đăng nhập thành công! Chuyển trang...</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="auth-input"
              />
              {errors.email && <p className="field-error">{errors.email}</p>}

              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                value={form.password}
                onChange={handleChange}
                className="auth-input"
              />
              {errors.password && <p className="field-error">{errors.password}</p>}

              <button type="submit" className="auth-btn">Đăng nhập</button>
            </form>

            <div className="auth-link">
              <a href="/forgot" className="forgot">Quên mật khẩu?</a>
              <span> | </span>
              <a href="/register-page" className="register">Đăng ký thành viên</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
