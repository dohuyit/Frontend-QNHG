import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const Authmiddleware = (props) => {
  // Đảm bảo đăng nhập bằng khuôn mặt cũng sinh ra token hợp lệ
  // Nếu chưa có admin_token nhưng có admin_face_token thì đồng bộ sang admin_token
  let token = localStorage.getItem("admin_token");
  if (!token) {
    const faceToken = localStorage.getItem("admin_face_token");
    if (faceToken) {
      localStorage.setItem("admin_token", faceToken);
      token = faceToken;
    }
  }
  const location = useLocation();

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{props.children}</>;
};

export default Authmiddleware;
