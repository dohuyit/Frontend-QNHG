import React from "react";
import "./successfulReservation.scss";
import { useLocation, useNavigate } from "react-router-dom";

const SuccessfulReservation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const reservationData =
    location.state?.reservationData ||
    JSON.parse(localStorage.getItem("latestReservation"));

  if (!reservationData) {
    return (
      <div className="success-container">
        <h2>Không tìm thấy thông tin đặt bàn</h2>
        <button onClick={() => navigate("/")}>Quay lại trang chủ</button>
      </div>
    );
  }

  return (
    <div className="success-container">
      <div className="success-box">
        <div className="checkmark">✔️</div>
        <h2>Quý khách đã gửi yêu cầu đặt bàn thành công</h2>
        <p>
          Hoàng Gia sẽ liên hệ lại với bạn qua số{" "}
          <span className="phone">{reservationData.customer_phone}</span> để xác nhận trong ít phút nữa.
          Chân thành cảm ơn quý khách.
        </p>

        <div className="details">
          <p><strong>Tên khách:</strong> {reservationData.customer_name}</p>
          <p><strong>Số điện thoại:</strong> {reservationData.customer_phone}</p>
          <p><strong>Tổng khách:</strong> {reservationData.number_of_guests} khách</p>
          <p><strong>Ngày đặt:</strong> {reservationData.reservation_date}</p>
          <p><strong>Giờ đến:</strong> {reservationData.reservation_time}</p>
        </div>

        <button onClick={() => navigate("/")}>Trở về trang chủ</button>
      </div>
    </div>
  );
};

export default SuccessfulReservation;
