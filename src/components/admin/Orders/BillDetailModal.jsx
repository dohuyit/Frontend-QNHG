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
} from "reactstrap";
import { formatPriceToVND } from "@helpers/formatPriceToVND";
import { getBillDetails } from "@services/admin/orderService";
import { toast } from "react-toastify";
import { 
  FaUser, 
  FaShoppingCart, 
  FaMoneyBillWave, 
  FaClipboardList, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaTag, 
  FaHandshake, 
  FaBarcode, 
  FaRegStickyNote, 
  FaClock 
} from "react-icons/fa";
import dishDefaultImg from "@assets/admin/images/dish/dish-default.webp";
import "./BillDetailModal.scss";

const BillDetailModal = ({
  isOpen,
  toggle,
  orderId,
  fullUrl, // Add fullUrl prop for image display
}) => {
  const [billData, setBillData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
          throw new Error(response.data.message || "Không thể lấy chi tiết hóa đơn.");
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
          <Button color="secondary" onClick={toggle}>Đóng</Button>
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
  const customerName = order.contact_name || order.customer?.full_name || "Guest";

  // Đếm tổng số lượng items (tổng quantity)
  const totalQuantity = Array.isArray(order.items)
    ? order.items.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0)
    : 0;

  const tableInfo = order.order_tables && order.order_tables.length > 0
    ? order.order_tables.map(t => t.table_item.table_number).join(", ")
    : "Chưa chọn bàn";

  const getOrderType = (type) => {
    if (type === "dine-in") return "Ăn tại chỗ";
    if (type === "takeaway") return "Mang đi";
    if (type === "delivery") return "Giao hàng";
    return "Không xác định";
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered className="bill-detail-modal">
      <ModalHeader toggle={toggle} className="border-bottom-0 pb-0">
        <h4 className="mb-0">Chi Tiết Hóa Đơn & Thanh Toán</h4>
      </ModalHeader>
      <ModalBody className="pt-0">
        <Row>
          <Col md={6} className="pe-md-4">
            <h5 className="section-title"><FaShoppingCart className="me-2 text-primary" />Thông tin đơn hàng</h5>
            <p><strong>Mã đơn hàng:</strong> {order.order_code}</p>
            <p><strong>Loại đơn hàng:</strong> {getOrderType(order.order_type)}</p>
            <p><strong><FaUser className="me-1 text-muted" />Khách hàng:</strong> {customerName}</p>
            <p><strong><FaPhone className="me-1 text-muted" />Số điện thoại:</strong> {order.contact_phone || 'N/A'}</p>
            <p><strong><FaEnvelope className="me-1 text-muted" />Email:</strong> {order.contact_email || 'N/A'}</p>
            <p><strong>Tổng số món:</strong> {totalQuantity}</p>
            {order.order_type === "dine-in" && (
              <p><strong><FaMapMarkerAlt className="me-1 text-muted" />Số bàn:</strong> {tableInfo}</p>
            )}
            <p><strong><FaRegStickyNote className="me-1 text-muted" />Ghi chú đơn hàng:</strong> {order.notes || 'Không có'}</p>
            <p><strong><FaCalendarAlt className="me-1 text-muted" />Ngày đặt:</strong> {new Date(order.created_at).toLocaleString()}</p>
          </Col>
          <Col md={6} className="ps-md-4 border-start">
            <h5 className="section-title"><FaMoneyBillWave className="me-2 text-primary" />Thông tin hóa đơn & Thanh toán</h5>
            <p><strong>Mã hóa đơn:</strong> {bill.bill_code}</p>
            <p><strong>Tổng phụ:</strong> {formatPriceToVND(bill.sub_total)}</p>
            <p><strong>Giảm giá:</strong> {formatPriceToVND(bill.discount_amount)}</p>
            <p><strong>Phí giao hàng:</strong> {formatPriceToVND(bill.delivery_fee)}</p>
            <p><strong>Tổng tiền hóa đơn:</strong> {formatPriceToVND(bill.final_amount)}</p>
            <p><strong><FaTag className="me-1 text-muted" />Trạng thái hóa đơn:</strong> {bill.status === 'paid' ? 'Đã thanh toán' : bill.status}</p>
            <p><strong><FaCalendarAlt className="me-1 text-muted" />Ngày phát hành:</strong> {new Date(bill.issued_at).toLocaleString()}</p>
            <p><strong><FaHandshake className="me-1 text-muted" />Người phụ trách:</strong> {bill.user?.full_name || 'N/A'}</p>
            <hr/>
            <p><strong><FaMoneyBillWave className="me-1 text-muted" />Phương thức thanh toán:</strong> {payment.payment_method === 'cash' ? 'Tiền mặt' : payment.payment_method}</p>
            <p><strong><FaMoneyBillWave className="me-1 text-muted" />Số tiền đã thanh toán:</strong> {formatPriceToVND(payment.amount_paid)}</p>
            <p><strong><FaClock className="me-1 text-muted" />Thời gian thanh toán:</strong> {new Date(payment.payment_time).toLocaleString()}</p>
            <p><strong><FaBarcode className="me-1 text-muted" />Mã giao dịch:</strong> {payment.transaction_ref || 'N/A'}</p>
            <p><strong><FaRegStickyNote className="me-1 text-muted" />Ghi chú thanh toán:</strong> {payment.notes || 'Không có'}</p>
          </Col>
        </Row>
        <h5 className="section-title mt-4"><FaClipboardList className="me-2 text-primary" />Chi tiết món ăn</h5>
        <Table bordered striped responsive className="mt-3">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên món/Combo</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Tổng cộng</th>
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
                        src={item.menu_item?.image_url ? `${fullUrl}${item.menu_item.image_url}` : dishDefaultImg}
                        alt={item.menu_item?.name || item.combo?.name || ""}
                        className="order-item-img"
                      />
                      <div>
                        <div className="bill-item-name">{item.menu_item?.name || item.combo?.name || 'N/A'}</div>
                        {item.notes && <small className="text-muted">({item.notes})</small>}
                      </div>
                    </div>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{formatPriceToVND(item.unit_price)}</td>
                  <td>{formatPriceToVND(item.unit_price * item.quantity)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">Không có chi tiết món ăn.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </ModalBody>
      <ModalFooter className="border-top-0 pt-0">
        <Button color="secondary" onClick={toggle} className="qnhg-button">Đóng</Button>
      </ModalFooter>
    </Modal>
  );
};

export default BillDetailModal; 