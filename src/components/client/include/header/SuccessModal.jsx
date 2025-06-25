import React from "react";
import "./successModal.scss";

const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="success-modal-overlay">
      <div className="success-modal-box">
        <div className="success-icon">✔</div>
        <h3>ĐẶT BÀN THÀNH CÔNG</h3>
        <p className="message">{message}</p>
        <button onClick={onClose}>Tiếp tục</button>
      </div>
    </div>
  );
};

export default SuccessModal;
