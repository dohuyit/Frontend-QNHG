import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Table,
  Spinner,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Input,
} from "reactstrap";
import { formatPriceToVND } from "@helpers/formatPriceToVND";
import {
  getBillDetails,
  exportBill,
  BASE_URL,
} from "@services/admin/orderService";
import { toast } from "react-toastify";
import {
  FaInfoCircle,
  FaBoxOpen,
  FaUser,
  FaMoneyBillWave,
  FaClipboardList,
  FaHandshake,
  FaFilePdf,
} from "react-icons/fa";
import dishDefaultImg from "@assets/admin/images/dish/dish-default.webp";
import "./BillDetailModal.scss";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
};

const BillDetailModal = ({ isOpen, toggle, orderId, fullUrl }) => {
  const [billData, setBillData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const response = await exportBill(orderId);

      if (response.data?.code === "SUCCESS" && response.data?.data?.pdf_url) {
        const pdfUrl = response.data.data.pdf_url;
        toast.success("Xuất hóa đơn PDF thành công!");

        // Đợi 1 giây sau khi hiển thị toast rồi mới mở PDF
        setTimeout(() => {
          const newWindow = window.open(pdfUrl, "_blank");
          if (newWindow) {
            newWindow.focus();
          } else {
            toast.warning("Vui lòng cho phép trình duyệt mở popup để xem PDF");
          }
        }, 2000);
      } else {
        throw new Error("Không nhận được URL của file PDF");
      }
    } catch (error) {
      console.error("Lỗi khi xuất PDF:", error);
      toast.error("Không thể xuất hóa đơn PDF. Vui lòng thử lại!");
    } finally {
      setIsExporting(false);
    }
  };
  useEffect(() => {
    const fetchBillDetails = async () => {
      if (!orderId) {
        setError("Không có ID đơn hàng để xem chi tiết hóa đơn.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await getBillDetails(orderId);
        if (response.data.code === "SUCCESS") {
          const bill = response.data.data.bill;
          const payment = response.data.data.bill.bill_payments?.[0];
          const order = response.data.data.order;

          console.log(order);

          if (!bill || !payment || !order) {
            throw new Error("Dữ liệu hóa đơn từ API không đầy đủ.");
          }

          setBillData(bill);
          setPaymentData(payment);
          setOrderData(order);
        } else {
          throw new Error(
            response.data.message || "Không thể lấy chi tiết hóa đơn."
          );
        }
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết hóa đơn:", err.response || err);
        setError(err.message || "Lỗi khi tải chi tiết hóa đơn.");
        toast.error(err.message || "Lỗi khi tải chi tiết hóa đơn.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && orderId) {
      fetchBillDetails();
    } else if (!isOpen) {
      // Reset state when modal is closed to ensure fresh data on next open
      setBillData(null);
      setPaymentData(null);
      setOrderData(null);
      setIsLoading(true); // Reset to true for next load
      setError(null);
    }
  }, [isOpen, orderId]);

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
        <ModalHeader toggle={toggle}>Đang tải chi tiết hóa đơn...</ModalHeader>
        <ModalBody className="text-center">
          <Spinner color="primary" />
          <p className="mt-2">Đang tải dữ liệu, vui lòng chờ...</p>
        </ModalBody>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
        <ModalHeader toggle={toggle}>Lỗi tải dữ liệu</ModalHeader>
        <ModalBody className="text-center">
          <p className="text-danger">{error}</p>
          <Button color="secondary" onClick={toggle}>
            Đóng
          </Button>
        </ModalBody>
      </Modal>
    );
  }

  // Use fetched data
  const bill = billData;
  const payment = paymentData;
  const order = orderData;

  console.log(order);

  // Hiển thị tên người đặt ưu tiên contact_name, sau đó đến customer.full_name, cuối cùng là Guest
  const customerName =
    order.contact_name || order.customer?.full_name || "Guest";

  // Đếm tổng số lượng items (tổng quantity)
  const totalQuantity = Array.isArray(order.items)
    ? order.items.reduce(
        (sum, item) => sum + (parseInt(item.quantity, 10) || 0),
        0
      )
    : 0;

  const tableInfo =
    order.order_tables && order.order_tables.length > 0
      ? order.order_tables.map((t) => t.table_item.table_number).join(", ")
      : "Chưa chọn bàn";

  const getOrderType = (type) => {
    if (type === "dine-in") return "Ăn tại chỗ";
    if (type === "takeaway") return "Mang đi";
    if (type === "delivery") return "Giao hàng";
    return "Không xác định";
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="xl"
      centered
      className="bill-detail-modal"
    >
      <div className="bill-modal-header-custom">
        <div className="bill-modal-header-content">
          <div className="bill-modal-header-title">
            <FaInfoCircle className="me-2" />
            Chi Tiết Hóa Đơn
          </div>
          <div className="bill-modal-header-code">#{bill.bill_code}</div>
        </div>
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={toggle}
        ></button>
      </div>
      <ModalBody className="pt-0">
        <div className="bill-tabs-wrapper">
          <Nav tabs className="bill-tabs mb-4">
            <NavItem>
              <NavLink
                className={activeTab === "info" ? "active" : ""}
                onClick={() => setActiveTab("info")}
                style={{ cursor: "pointer", fontWeight: 600 }}
              >
                Thông Tin Tổng Quan
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === "items" ? "active" : ""}
                onClick={() => setActiveTab("items")}
                style={{ cursor: "pointer", fontWeight: 600 }}
              >
                Chi Tiết Món Ăn
              </NavLink>
            </NavItem>
          </Nav>
        </div>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="info">
            <Row className="g-4">
              <Col md={6}>
                <div className="bill-info-box">
                  <div className="bill-info-box-title">
                    <FaClipboardList className="me-2" />
                    Thông Tin Đơn Hàng
                  </div>
                  <div className="bill-info-list">
                    <div className="bill-info-row">
                      <span>Mã đơn hàng:</span> <span>{order.order_code}</span>
                    </div>
                    <div className="bill-info-row">
                      <span>Loại:</span>{" "}
                      <span>{getOrderType(order.order_type)}</span>
                    </div>
                    <div className="bill-info-row">
                      <span>Số món:</span> <span>{totalQuantity}</span>
                    </div>
                    {order.order_type === "dine-in" && (
                      <div className="bill-info-row">
                        <span>Bàn:</span> <span>{tableInfo}</span>
                      </div>
                    )}
                    <div className="bill-info-row">
                      <span>Ngày đặt:</span>{" "}
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                    {order.notes && (
                      <div className="bill-info-row bill-info-row-note">
                        <span>Ghi chú:</span>
                        <Input
                          type="textarea"
                          readOnly
                          rows={2}
                          value={order.notes}
                          className="bill-note-input"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bill-info-box">
                  <div className="bill-info-box-title">
                    <FaMoneyBillWave className="me-2" />
                    Thông Tin Thanh Toán
                  </div>
                  <div className="bill-info-list">
                    <div className="bill-info-row">
                      <span>Mã hóa đơn:</span> <span>{bill.bill_code}</span>
                    </div>
                    <div className="bill-info-row">
                      <span>Phụ:</span>{" "}
                      <span>{formatPriceToVND(bill.sub_total)}</span>
                    </div>
                    <div className="bill-info-row">
                      <span>Giảm:</span>{" "}
                      <span>{formatPriceToVND(bill.discount_amount)}</span>
                    </div>
                    <div className="bill-info-row">
                      <span>Phí ship:</span>{" "}
                      <span>{formatPriceToVND(bill.delivery_fee)}</span>
                    </div>
                    <div className="bill-info-row bill-final-amount-row">
                      <span>Tổng tiền:</span>{" "}
                      <span>{formatPriceToVND(bill.final_amount)}</span>
                    </div>
                    <div className="bill-info-row">
                      <span>Trạng thái:</span>
                      <span className={`bill-status-badge ${bill.status}`}>
                        {bill.status === "paid" ? "Đã Thanh Toán" : bill.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Col>

              <Col md={6}>
                <div className="bill-info-box">
                  <div className="bill-info-box-title">
                    <FaUser className="me-2" />
                    Thông Tin Khách Hàng
                  </div>
                  <div className="bill-info-list">
                    <div className="bill-info-row">
                      <span>Tên:</span> <span>{customerName}</span>
                    </div>
                    <div className="bill-info-row">
                      <span>SĐT:</span>{" "}
                      <span>{order.contact_phone || "N/A"}</span>
                    </div>
                    <div className="bill-info-row">
                      <span>Email:</span>{" "}
                      <span>{order.contact_email || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="bill-info-box">
                  <div className="bill-info-box-title">
                    <FaHandshake className="me-2" />
                    Chi Tiết Thanh Toán
                  </div>
                  <div className="bill-info-list">
                    <div className="bill-info-row">
                      <span>Ngày phát hành:</span>{" "}
                      <span>{formatDate(bill.issued_at)}</span>
                    </div>
                    <div className="bill-info-row">
                      <span>Người phụ trách:</span>{" "}
                      <span>{bill.user?.full_name || "N/A"}</span>
                    </div>
                    <div className="bill-info-row">
                      <span>Phương thức:</span>{" "}
                      <span>
                        {payment.payment_method === "cash"
                          ? "Tiền mặt"
                          : payment.payment_method}
                      </span>
                    </div>
                    <div className="bill-info-row">
                      <span>Đã thanh toán:</span>{" "}
                      <span>{formatPriceToVND(payment.amount_paid)}</span>
                    </div>
                    <div className="bill-info-row">
                      <span>Thời gian:</span>{" "}
                      <span>{formatDate(payment.payment_time)}</span>
                    </div>
                    <div className="bill-info-row">
                      <span>Mã giao dịch:</span>{" "}
                      <span>{payment.transaction_ref || "N/A"}</span>
                    </div>
                    {payment.notes && (
                      <div className="bill-info-row bill-info-row-note">
                        <span>Ghi chú:</span>
                        <Input
                          type="textarea"
                          readOnly
                          rows={2}
                          value={payment.notes}
                          className="bill-note-input"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId="items">
            <div className="bill-items-table-wrapper rounded shadow-sm bg-white p-2 p-md-3 mb-2">
              <div className="bill-items-title mb-3">
                <FaBoxOpen className="me-2" />
                Chi Tiết Món Ăn
              </div>
              <Table bordered responsive className="mt-3 bill-items-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>TÊN MÓN/COMBO</th>
                    <th className="text-center">SỐ LƯỢNG</th>
                    <th className="text-center">ĐƠN GIÁ</th>
                    <th className="text-center">TỔNG CỘNG</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <tr key={index}>
                        <th scope="row">{index + 1}</th>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={
                                item.menu_item?.image_url
                                  ? `${fullUrl}${item.menu_item.image_url}`
                                  : dishDefaultImg
                              }
                              alt={
                                item.menu_item?.name || item.combo?.name || ""
                              }
                              className="bill-order-item-img me-2"
                            />
                            <div>
                              <div className="bill-item-name">
                                {item.menu_item?.name ||
                                  item.combo?.name ||
                                  "N/A"}
                              </div>
                              {item.notes && (
                                <small className="text-muted">
                                  ({item.notes})
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="bill-qty-badge">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="text-center">
                          {formatPriceToVND(item.unit_price)}
                        </td>
                        <td className="text-center">
                          {formatPriceToVND(item.unit_price * item.quantity)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        Không có chi tiết món ăn.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <div className="bill-items-summary mt-4">
                <div className="bill-items-subtotal d-flex justify-content-between align-items-center mb-2">
                  <div className="bill-items-total-label">
                    Tiền hàng ({totalQuantity} món):
                  </div>
                  <div className="bill-items-total-value">
                    {formatPriceToVND(bill.sub_total)}
                  </div>
                </div>
                {bill.discount_amount > 0 && (
                  <div className="bill-items-discount d-flex justify-content-between align-items-center mb-2">
                    <div className="bill-items-total-label text-success">
                      Giảm giá:
                    </div>
                    <div className="bill-items-total-value text-success">
                      - {formatPriceToVND(bill.discount_amount)}
                    </div>
                  </div>
                )}
                <div className="bill-items-total d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <div className="bill-items-total-label fw-bold">
                    Tổng thanh toán:
                  </div>
                  <div className="bill-items-total-value fs-5 fw-bold text-primary">
                    {formatPriceToVND(bill.final_amount)}
                  </div>
                </div>
              </div>
            </div>
          </TabPane>
        </TabContent>
      </ModalBody>
      <ModalFooter className="border-top-0 pt-0">
        <Button
          color="success"
          onClick={handleExportPDF}
          className="me-2"
          disabled={isExporting}
        >
          {isExporting ? (
            <Spinner size="sm" className="me-1" />
          ) : (
            <FaFilePdf className="me-1" />
          )}
          Xuất PDF
        </Button>
        <Button
          color="primary"
          onClick={toggle}
          className="qnhg-button bill-btn-close"
        >
          Đóng
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default BillDetailModal;
