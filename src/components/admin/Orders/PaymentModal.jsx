import React from "react";
import {
  Row,
  Col,
  Button,
  Input,
  Label,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { Wallet, CreditCard, Scan } from "lucide-react";
import { formatPriceToVND } from "@helpers/formatPriceToVND";
import dishDefaultImg from "@assets/admin/images/dish/dish-default.webp";
import "./PaymentModal.scss"; // New SCSS file for custom styles

const PaymentModal = ({
  isOpen,
  toggle,
  orderItems,
  subtotal,
  vat,
  total,
  isSubmitting,
  setIsSubmitting,
  orderMethod,
  selectedTables,
  contactName,
  contactPhone,
  contactEmail,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  fullUrl,
  orderId,
  paymentOrder,
  navigate,
  toast,
  orderNotes,
}) => {
  const handlePaymentConfirmation = async () => {
    setIsSubmitting(true);
    try {
      let currentUserId = null;
      try {
        const adminUserString = localStorage.getItem("admin_user");
        if (adminUserString) {
          const adminUser = JSON.parse(adminUserString);
          currentUserId = adminUser.id || null;
        }
      } catch (error) {
        console.error("Error parsing admin_user from localStorage:", error);
      }

      const paymentPayload = {
        payment_method: selectedPaymentMethod,
        amount_paid: total,
        notes: orderNotes || "",
        discount_amount: 0,
        delivery_fee: 0,
        user_id: currentUserId,
      };

      console.log("Payload thanh toán:", paymentPayload);

      const paymentRes = await paymentOrder(orderId, paymentPayload);
      const paymentUrl = paymentRes.data?.data?.payment_url;

      if (
        (selectedPaymentMethod === "momo" ||
          selectedPaymentMethod === "vnpay") &&
        paymentUrl
      ) {
        window.location.href = paymentUrl;
      } else {
        if (paymentRes.data?.code === "SUCCESS") {
          toast.success(paymentRes.data.message, { autoClose: 2000 });
          navigate("/orders/list");
        } else {
          toast.error(
            paymentRes.data.message || "Thanh toán đơn hàng thất bại!"
          );
        }
      }
    } catch (error) {
      console.error("Error confirming payment:", error.response || error);
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        const errorMessages = Object.values(apiErrors)
          .map((e) => (Array.isArray(e) ? e.join(", ") : e))
          .join("; ");
        toast.error(errorMessages || "Lỗi khi xác nhận thanh toán!");
      } else {
        toast.error(
          error.response?.data?.message || "Lỗi khi xác nhận thanh toán!"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logic to display contact info with fallback
  const displayContactName = contactName || "Khách hàng chưa nhập";
  const displayContactPhone = contactPhone || "Chưa có số điện thoại";
  const displayContactEmail = contactEmail || "Chưa có email";

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      centered
      size="lg"
      className="payment-confirm-modal"
    >
      <ModalHeader toggle={toggle} className="payment-modal-header">
        Xác nhận thanh toán
      </ModalHeader>
      <ModalBody className="payment-modal-body">
        <Row className="h-100">
          {/* Cột trái: Thông tin khách hàng và Phương thức thanh toán */}
          <Col md={6} className="payment-modal-left-col">
            <div className="payment-modal-section customer-info-section">
              <h5 className="payment-section-title">
                <i className="ri-user-line me-2"></i>Thông tin khách hàng
              </h5>
              <div className="customer-info-grid">
                <Row className="mb-3">
                  <Col md={12} className="qnhg-col-md-6">
                    <div className="customer-info-item">
                      <Label className="qnhg-form-label">Họ và tên *</Label>
                      <Input
                        type="text"
                        value={displayContactName}
                        readOnly
                        className="qnhg-form-control"
                      />
                    </div>
                  </Col>
                  <Col md={12} className="qnhg-col-md-6">
                    <div className="customer-info-item">
                      <Label className="qnhg-form-label">Số điện thoại *</Label>
                      <Input
                        type="tel"
                        value={displayContactPhone}
                        readOnly
                        className="qnhg-form-control"
                      />
                    </div>
                  </Col>
                  <Col md={12} className="qnhg-col-md-6">
                    <div className="customer-info-item">
                      <Label className="qnhg-form-label">Email *</Label>
                      <Input
                        type="email"
                        value={displayContactEmail}
                        readOnly
                        className="qnhg-form-control"
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            </div>

            {orderMethod === "Dine In" && (
              <div className="payment-modal-section table-info-section">
                <h5 className="payment-section-title">
                  <i className="ri-map-pin-line me-2"></i>Thông tin đặt bàn
                </h5>
                <div className="table-info-box">
                  <p className="label">Số bàn</p>
                  <p className="value">
                    {selectedTables.length > 0
                      ? selectedTables.map((t) => t.table_number).join(", ")
                      : "---"}
                  </p>
                </div>
              </div>
            )}

            <div className="payment-modal-section payment-method-section">
              <h5 className="payment-section-title">
                <i className="ri-wallet-line me-2"></i>Phương thức thanh toán
              </h5>
              <div className="payment-method-options">
                <div
                  className={`payment-method-option ${
                    selectedPaymentMethod === "cash" ? "selected" : ""
                  }`}
                  onClick={() => setSelectedPaymentMethod("cash")}
                >
                  <div className="icon-box cash">
                    <Wallet size={24} color="#fff" />
                  </div>
                  <div className="text-content">
                    <div className="title">Tiền mặt</div>
                    <div className="subtitle">Thanh toán tại quầy</div>
                  </div>
                  <div className="radio-circle">
                    {selectedPaymentMethod === "cash" && (
                      <div className="inner-circle"></div>
                    )}
                  </div>
                  <span className="badge-popular">Phổ biến</span>
                </div>

                <div
                  className={`payment-method-option ${
                    selectedPaymentMethod === "momo" ? "selected" : ""
                  }`}
                  onClick={() => setSelectedPaymentMethod("momo")}
                >
                  <div className="icon-box momo">
                    <Scan size={24} color="#fff" />
                  </div>
                  <div className="text-content">
                    <div className="title">MoMo</div>
                    <div className="subtitle">Ví điện tử MoMo</div>
                  </div>
                  <div className="radio-circle">
                    {selectedPaymentMethod === "momo" && (
                      <div className="inner-circle"></div>
                    )}
                  </div>
                </div>

                <div
                  className={`payment-method-option ${
                    selectedPaymentMethod === "vnpay" ? "selected" : ""
                  }`}
                  onClick={() => setSelectedPaymentMethod("vnpay")}
                >
                  <div className="icon-box vnpay">
                    <CreditCard size={24} color="#fff" />
                  </div>
                  <div className="text-content">
                    <div className="title">VNPay</div>
                    <div className="subtitle">Cổng thanh toán VNPay</div>
                  </div>
                  <div className="radio-circle">
                    {selectedPaymentMethod === "vnpay" && (
                      <div className="inner-circle"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* Cột phải: Tóm tắt đơn hàng và Tổng cộng */}
          <Col md={6} className="payment-modal-right-col">
            <div className="payment-modal-section order-summary-section">
              <h5 className="payment-section-title">
                <i className="ri-shopping-cart-line me-2"></i>Tóm tắt đơn hàng
              </h5>
              <div className="order-items-list">
                {orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="order-item-row d-flex align-items-center mb-3"
                  >
                    <div className="order-item-img-block me-3">
                      <img
                        src={
                          item.image_url
                            ? `${fullUrl}${item.image_url}`
                            : dishDefaultImg
                        }
                        alt={item.name}
                        className="order-item-img"
                      />
                    </div>
                    <div className="order-item-details flex-grow-1">
                      <p className="item-name mb-1">{item.name}</p>
                      <p className="item-price-qty mb-0">
                        {item.quantity} x {formatPriceToVND(item.price)}
                      </p>
                    </div>
                    <div className="order-item-total">
                      {formatPriceToVND(item.quantity * item.price)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-summary-totals">
                <div className="summary-row">
                  <span className="summary-label">Tạm tính:</span>
                  <span className="summary-value">
                    {formatPriceToVND(subtotal)}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">VAT ({vat}%):</span>
                  <span className="summary-value">
                    {formatPriceToVND(subtotal * (vat / 100))}
                  </span>
                </div>
                <div className="summary-row total-row">
                  <span className="summary-label total-label">Tổng cộng:</span>
                  <span className="summary-value total-value">
                    {formatPriceToVND(total)}
                  </span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter className="payment-modal-footer">
        <Button
          color="primary"
          onClick={handlePaymentConfirmation}
          disabled={isSubmitting || selectedPaymentMethod === null}
          className="qnhg-button primary-button"
        >
          {isSubmitting ? (
            <Spinner size="sm"> Loading...</Spinner>
          ) : (
            "Xác nhận thanh toán"
          )}
        </Button>
        <Button
          color="secondary"
          onClick={toggle}
          disabled={isSubmitting}
          className="qnhg-button"
        >
          Hủy bỏ
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default PaymentModal;
