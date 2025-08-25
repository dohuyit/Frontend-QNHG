import React, { useState, useEffect } from "react";
import "./bookingPopup.scss";
import { useNavigate } from "react-router-dom";
import { createBooking } from "../../../../services/client/bookingService";
import SuccessModal from "./SuccessModal";
import ArrivalTimeSelect from "./ArrivalTimeSelect";
import { toast } from "react-toastify";
import logo from "@assets/client/images/header/logo.png";

const convertTo24Hour = (time12h) => {
  if (!time12h) return "";
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  if (hours === "12") hours = "00";
  if (modifier === "PM") hours = String(parseInt(hours, 10) + 12);
  return `${hours.padStart(2, "0")}:${minutes}`;
};

const BookingPopup = ({ isOpen, onClose }) => {
  const [guestCount, setGuestCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [orderTable, setOrderTable] = useState({
    customer_id: "",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    reservation_date: "",
    reservation_time: "",
    number_of_guests: 1,
    table_id: "",
    notes: "",
    status: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderTable((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const submissionData = {
      ...orderTable,
      reservation_time: convertTo24Hour(orderTable.reservation_time),
    };

    try {
      await createBooking(submissionData);
      localStorage.setItem("latestReservation", JSON.stringify(submissionData));
      setShowSuccess(true);
    } catch (error) {
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        setErrors(apiErrors);
      }
      toast.error(error.response?.data?.message || "Lỗi tạo đơn đặt bàn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const userData = localStorage.getItem("clientUser"); // Đổi key ở đây
      if (userData) {
        const userObj = JSON.parse(userData);
        setOrderTable((prev) => ({
          ...prev,
          customer_id: userObj.id || "",
          customer_name: userObj.full_name || "", // Đổi name thành full_name
          customer_phone: userObj.phone || "", // Nếu có phone thì lấy, không thì để ""
          customer_email: userObj.email || "",
        }));
      } else {
        setOrderTable((prev) => ({
          ...prev,
          customer_id: "",
          customer_name: "",
          customer_phone: "",
          customer_email: "",
        }));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <>
      {loading && (
        <div className="booking-loading-overlay">
          <div className="booking-loading-popup">
            <img src={logo} alt="Restaurant Logo" />
            <svg
              className="pl"
              viewBox="0 0 128 128"
              width="128px"
              height="128px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="pl-grad-yellow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f39c12"></stop>
                  <stop offset="100%" stopColor="#e67e22"></stop>
                </linearGradient>
              </defs>
              <circle
                className="pl__ring"
                r="56"
                cx="64"
                cy="64"
                fill="none"
                stroke="currentColor"
                strokeWidth="16"
                strokeLinecap="round"
              ></circle>
              <path
                className="pl__worm"
                d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z"
                fill="none"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="44 1111"
                strokeDashoffset="10"
              ></path>
            </svg>
            <span
              style={{ color: "#fff", marginTop: "10px", fontSize: "16px" }}
            >
              Đang xử lý đặt bàn...
            </span>
          </div>
        </div>
      )}
      <div className="popup-overlay">
        <div className="popup">
          <h2>Đặt bàn</h2>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <h4>Thông tin của bạn</h4>
              <input
                type="text"
                name="customer_name"
                placeholder="Tên của bạn"
                value={orderTable.customer_name}
                onChange={handleChange}
              />
              {errors.customer_name && (
                <p className="error">{errors.customer_name}</p>
              )}

              <input
                type="tel"
                name="customer_phone"
                placeholder="Số điện thoại"
                value={orderTable.customer_phone}
                onChange={handleChange}
              />
              {errors.customer_phone && (
                <p className="error">{errors.customer_phone}</p>
              )}

              <input
                type="email"
                name="customer_email"
                placeholder="Email"
                value={orderTable.customer_email}
                onChange={handleChange}
              />
              {errors.customer_email && (
                <p className="error">{errors.customer_email}</p>
              )}
            </div>

            <div className="form-group">
              <h4>Thông tin đặt bàn</h4>
              <div className="row-booking">
                <div className="form-field">
                  <label>Số lượng khách</label>
                  <div className="quantity">
                    <button
                      type="button"
                      onClick={() => {
                        const newCount = Math.max(1, guestCount - 1);
                        setGuestCount(newCount);
                        setOrderTable((prev) => ({
                          ...prev,
                          number_of_guests: newCount,
                        }));
                      }}
                    >
                      -
                    </button>
                    <input type="text" value={guestCount} readOnly />
                    <button
                      type="button"
                      onClick={() => {
                        const newCount = guestCount + 1;
                        setGuestCount(newCount);
                        setOrderTable((prev) => ({
                          ...prev,
                          number_of_guests: newCount,
                        }));
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="form-field">
                  <label>Ngày đặt</label>
                  <input
                    type="date"
                    name="reservation_date"
                    value={orderTable.reservation_date}
                    min={minDate}
                    onChange={handleChange}
                  />
                  {errors.reservation_date && (
                    <p className="error">{errors.reservation_date}</p>
                  )}
                </div>

                <div className="form-field">
                  <ArrivalTimeSelect
                    selectedTime={orderTable.reservation_time}
                    onTimeChange={(time) =>
                      setOrderTable((prev) => ({
                        ...prev,
                        reservation_time: time,
                      }))
                    }
                    reservationDate={orderTable.reservation_date}
                  />
                  {errors.reservation_time && (
                    <p className="error">{errors.reservation_time}</p>
                  )}
                </div>
              </div>

              <textarea
                name="notes"
                placeholder="Ghi chú"
                value={orderTable.notes}
                onChange={handleChange}
              />
              {errors.notes && <p className="error">{errors.notes}</p>}
            </div>

            <div className="actions">
              <button type="button" onClick={onClose}>
                Đóng
              </button>
              <button type="submit" disabled={loading}>
                {loading ? "Đang xử lý..." : "ĐẶT BÀN NGAY"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        message="Yêu cầu đặt bàn của bạn đã được gửi. Chúng tôi sẽ liên hệ để xác nhận!"
        onClose={() => {
          setShowSuccess(false);
          onClose();
          navigate("/reservation_success");
        }}
      />
    </>
  );
};

export default BookingPopup;
