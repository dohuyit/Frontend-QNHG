import React, { useState, useEffect } from "react";
import "./bookingPopup.scss";
import { useNavigate } from "react-router-dom";
import { createBooking } from "../../../../services/client/bookingService";
import SuccessModal from "./SuccessModal";
import ArrivalTimeSelect from "./ArrivalTimeSelect";
import { toast } from "react-toastify";

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
          customer_phone: userObj.phone || "",    // Nếu có phone thì lấy, không thì để ""
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
              {errors.customer_name && <p className="error">{errors.customer_name}</p>}

              <input
                type="tel"
                name="customer_phone"
                placeholder="Số điện thoại"
                value={orderTable.customer_phone}
                onChange={handleChange}
              />
              {errors.customer_phone && <p className="error">{errors.customer_phone}</p>}

              <input
                type="email"
                name="customer_email"
                placeholder="Email"
                value={orderTable.customer_email}
                onChange={handleChange}
              />
              {errors.customer_email && <p className="error">{errors.customer_email}</p>}
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
                  {errors.reservation_date && <p className="error">{errors.reservation_date}</p>}
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
                  {errors.reservation_time && <p className="error">{errors.reservation_time}</p>}
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
              <button type="submit">ĐẶT BÀN NGAY</button>
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
