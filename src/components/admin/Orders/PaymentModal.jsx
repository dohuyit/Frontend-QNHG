import React, { useState, useEffect, useCallback } from "react";
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
import { getDiscountCodes } from "@services/admin/discountCodeService";
import "./PaymentModal.scss";

const PaymentModal = ({
  isOpen,
  toggle,
  orderItems = [],
  isSubmitting,
  setIsSubmitting,
  orderMethod,
  selectedTables = [],
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
  const VAT_RATE = 5; // Định nghĩa VAT mặc định là 8%
  const [discountList, setDiscountList] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState("");
  const [selectedDiscountAmount, setSelectedDiscountAmount] = useState(0);
  const [filteredOrderItems, setFilteredOrderItems] = useState([]);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [discountedTotal, setDiscountedTotal] = useState(0);

  // Lọc các món ăn theo trạng thái và tính lại tổng tiền
  useEffect(() => {
    const validStatuses = ["preparing", "ready"]; // Trạng thái hợp lệ
    const srcItems = Array.isArray(orderItems) ? orderItems : [];
    const filtered = srcItems.filter((item) =>
      validStatuses.includes(item?.kitchen_status)
    );
    setFilteredOrderItems(filtered);

    // Tính lại tổng tiền (subtotal + VAT)
    const newSubtotal = filtered.reduce(
      (sum, item) =>
        sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 0),
      0
    );

    setCalculatedTotal(newSubtotal); // Lưu subtotal trước VAT

    // Tính lại tổng tiền sau khi áp dụng giảm giá
    const discount = discountList.find((d) => d.code === selectedDiscount);
    const discountValue = discount ? parseFloat(discount.value) : 0;
    setSelectedDiscountAmount(discountValue);

    const afterDiscount = Math.max(0, newSubtotal - discountValue);
    const afterVat = afterDiscount * (1 + VAT_RATE / 100);
    setDiscountedTotal(afterVat);
  }, [orderItems, selectedDiscount, discountList]);

  // Lấy danh sách mã giảm giá khi modal mở
  const fetchDiscountCodes = useCallback(async () => {
    try {
      const res = await getDiscountCodes();
      console.log("API trả về items:", res.data.data.items);
      setDiscountList(
        Array.isArray(res.data?.data?.items) ? res.data.data.items : []
      );
    } catch (error) {
      console.error("Lỗi khi lấy mã giảm giá:", error);
      toast.error("Không lấy được danh sách mã giảm giá");
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      fetchDiscountCodes();
    }
  }, [isOpen, fetchDiscountCodes]);

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

      // Kiểm tra xem có món ăn hợp lệ để thanh toán không
      if (filteredOrderItems.length === 0) {
        toast.error("Không có món ăn nào sẵn sàng để thanh toán!");
        return;
      }

      const finalAmount = discountedTotal;
      const paymentPayload = {
        payment_method: selectedPaymentMethod,
        amount_paid: finalAmount,
        sub_total: calculatedTotal, // Thêm tổng tiền hàng
        discount_code: selectedDiscount || null,
        discount_amount: discountValue,
        type: discountObj?.type || null,
        notes: orderNotes || "",
        discount_amount: selectedDiscountAmount,
        delivery_fee: 0,
        user_id: currentUserId,
        items: filteredOrderItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
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
  const handleDiscountChange = (e) => {
    const code = e.target.value;
    setSelectedDiscount(code);

    const discountObj = discountList.find((d) => d.code === code);

    if (!discountObj) {
      setDiscountValue(0);
      setTotalAfterDiscount(calculatedTotal);
      return;
    }

    let discount = 0;
    if (discountObj.type === "percentage") {
      discount = (calculatedTotal * discountObj.value) / 100;
    } else if (discountObj.type === "fixed") {
      discount = discountObj.value;
    }

    if (discount > calculatedTotal) discount = calculatedTotal;

    setDiscountValue(discount);
    setTotalAfterDiscount(calculatedTotal - discount);
  };

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
          <Col md={6} className="payment-modal-left-col">
            <div className="payment-modal-section customer-info-section">
              <h5 className="payment-section-title">
                <i className="ri-user-line me-2"></i>Thông tin khách hàng
              </h5>
              <Row className="mb-3">
                <Col md={12}>
                  <Label>Họ và tên *</Label>
                  <Input type="text" value={displayContactName} readOnly />
                </Col>
                <Col md={12} className="mt-2">
                  <Label>Số điện thoại *</Label>
                  <Input type="tel" value={displayContactPhone} readOnly />
                </Col>
                <Col md={12} className="mt-2">
                  <Label>Email *</Label>
                  <Input type="email" value={displayContactEmail} readOnly />
                </Col>
              </Row>
            </div>

            {orderMethod === "Dine In" && (
              <div className="payment-modal-section table-info-section">
                <h5 className="payment-section-title">
                  <i className="ri-map-pin-line me-2"></i>Thông tin đặt bàn
                </h5>
                <div className="payment-table-display-container">
                  <p>
                    {Array.isArray(selectedTables) && selectedTables.length > 0
                      ? selectedTables.map((t) => t?.table_number).join(", ")
                      : "---"}
                  </p>
                </div>
              </div>
            )}

            <div className="payment-modal-section payment-method-section mt-3">
              <h5 className="payment-section-title">
                <i className="ri-wallet-line me-2"></i>Phương thức thanh toán
              </h5>
              <div className="payment-method-options">
                {/* Tiền mặt */}
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

                {/* MoMo */}
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

                {/* VNPay */}
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

          {/* Cột phải: Tóm tắt đơn hàng */}
          <Col md={6} className="payment-modal-right-col">
            <div className="payment-modal-section order-summary-section">
              <h5 className="payment-section-title">
                <i className="ri-shopping-cart-line me-2"></i>Tóm tắt đơn hàng
              </h5>
              <div className="order-items-list">
                {filteredOrderItems.map((item, index) => (
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
                        <span className="ms-2 badge bg-info">
                          {item.kitchen_status === "preparing"
                            ? "Đang chuẩn bị"
                            : "Sẵn sàng"}
                        </span>
                      </p>
                    </div>
                    <div className="order-item-total">
                      {formatPriceToVND(item.quantity * item.price)}
                    </div>
                  </div>
                ))}
              </div>

              {filteredOrderItems.length === 0 && (
                <div className="alert alert-warning">
                  Không có món ăn nào đang được chuẩn bị hoặc sẵn sàng để thanh
                  toán
                </div>
              )}

              {/* Select mã giảm giá */}
              <div className="payment-modal-section discount-section mb-3">
                <h5 className="payment-section-title">
                  <i className="ri-discount-line me-2"></i>Mã giảm giá
                </h5>
                <Input
                  type="select"
                  value={selectedDiscount}
                  onChange={handleDiscountChange}
                >
                  <option value="">Chọn mã giảm giá</option>
                  {discountList.length === 0 && (
                    <option disabled>Không có mã giảm giá</option>
                  )}
                  {discountList.map((d) => {
                    const valueNumber = Number(d.value) || 0; // ép sang number, fallback 0
                    return (
                      <option key={d.id} value={d.code}>
                        {d.code} -{" "}
                        {d.type === "percentage"
                          ? `Giảm ${
                              Number.isInteger(valueNumber)
                                ? valueNumber
                                : valueNumber.toFixed(2)
                            }%`
                          : `Giảm ${formatPriceToVND(valueNumber)}`}
                      </option>
                    );
                  })}
                </Input>
              </div>

              <div className="order-summary-totals">
                <div className="summary-row">
                  <span className="summary-label">Tạm tính:</span>
                  <span className="summary-value">
                    {formatPriceToVND(calculatedTotal)}
                  </span>
                </div>
                {selectedDiscountAmount > 0 && (
                  <div className="summary-row discount-row">
                    <span className="summary-label">Giảm giá:</span>
                    <span className="summary-value text-success">
                      - {formatPriceToVND(selectedDiscountAmount)}
                    </span>
                  </div>
                )}
                {selectedDiscountAmount > 0 && (
                  <div className="summary-row">
                    <span className="summary-label">Sau giảm giá:</span>
                    <span className="summary-value">
                      {formatPriceToVND(
                        Math.max(0, calculatedTotal - selectedDiscountAmount)
                      )}
                    </span>
                  </div>
                )}
                <div className="summary-row">
                  <span className="summary-label">VAT ({VAT_RATE}%):</span>
                  <span className="summary-value">
                    {formatPriceToVND(
                      Math.max(0, calculatedTotal - selectedDiscountAmount) *
                        (VAT_RATE / 100)
                    )}
                  </span>
                </div>
                <div className="summary-row total-row">
                  <span className="summary-label total-label">Tổng cộng:</span>
                  <span className="summary-value total-value">
                    {formatPriceToVND(discountedTotal)}
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
          disabled={isSubmitting || !selectedPaymentMethod}
        >
          {isSubmitting ? <Spinner size="sm" /> : "Xác nhận thanh toán"}
        </Button>
        <Button color="secondary" onClick={toggle} disabled={isSubmitting}>
          Hủy bỏ
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default PaymentModal;
