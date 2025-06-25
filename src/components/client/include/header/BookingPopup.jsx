import React, { useState } from "react";
import "./bookingPopup.scss";
import { useNavigate } from "react-router-dom";
import { createBooking } from "../../../../services/client/bookingService";
import SuccessModal from "./SuccessModal";
import ArrivalTimeSelect from "./ArrivalTimeSelect";

const BookingPopup = ({ isOpen, onClose }) => {
  const [guestCount, setGuestCount] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const customer_id = 1;
  const navigate = useNavigate();

  const [orderTable, setOrderTable] = useState({
    customer_id,
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

  const [errors, setErrors] = useState({});

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

  const validate = () => {
    const newErrors = {};
    if (!orderTable.customer_name.trim()) newErrors.customer_name = "Vui lòng nhập tên";
    if (!orderTable.customer_phone.trim()) newErrors.customer_phone = "Vui lòng nhập số điện thoại";
    if (!orderTable.customer_email.trim()) newErrors.customer_email = "Vui lòng nhập email";
    if (!orderTable.reservation_date.trim()) newErrors.reservation_date = "Chọn ngày đặt";
    if (!orderTable.reservation_time.trim()) newErrors.reservation_time = "Chọn giờ đến";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const fullReservationTime = `${orderTable.reservation_date} ${orderTable.reservation_time}`;
    const submissionData = {
      ...orderTable,
      reservation_time: fullReservationTime,
    };

    try {
      await createBooking(submissionData);
      localStorage.setItem("latestReservation", JSON.stringify(submissionData));
      setShowSuccess(true);
    } catch (error) {
      console.error("Đặt bàn thất bại:", error.response?.data || error.message);
      alert("❌ Có lỗi xảy ra khi đặt bàn. Vui lòng thử lại.");
    }
  };

  if (!isOpen) return null;

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <>
      <div className="popup-overlay">
        <div className="popup">
          <h2>Đặt bàn</h2>
          <form className="form" onSubmit={handleSubmit}>
            {/* THÔNG TIN CỦA BẠN */}
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

            {/* THÔNG TIN ĐẶT BÀN */}
            <div className="form-group">
              <h4>Thông tin đặt bàn</h4>
              <div className="row">
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
