import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Row,
  Col,
} from "reactstrap";
import { MdVisibility, MdModeEdit, MdDelete } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { FiClock } from "react-icons/fi";
import { BsBoxSeam } from "react-icons/bs";
import "./card-order.css";
import OrderDetailModal from "./OrderDetailModal";
import PaymentModal from "./PaymentModal";
import Badge from "../ui/Badge";
import { toast } from "react-toastify";
import { BASE_URL } from "@services/admin/orderService";
import BillDetailModal from "./BillDetailModal";

const OrderCard = ({ order, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBillDetailModal, setShowBillDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "warning", text: "Chờ xác nhận" },
      confirmed: { color: "info", text: "Đã xác nhận" },
      preparing: { color: "primary", text: "Đang chuẩn bị" },
      ready: { color: "success", text: "Sẵn sàng" },
      delivered: { color: "success", text: "Đã giao" },
      cancelled: { color: "danger", text: "Đã hủy" },
      completed: { color: "success", text: "Đã hoàn thành" },
    };
    const config =
      statusConfig[status] || { color: "secondary", text: "Không xác định" };

    return (
      <Badge type={config.color} pill>
        {status === "completed" && <FaCheck size={10} className="me-1" />}
        {config.text}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const handleViewBill = async (orderId) => {
    console.log("Viewing bill for order ID:", orderId);
    try {
      setShowBillDetailModal(true);
    } catch (error) {
      console.error("Error fetching bill details:", error.response || error);
      toast.error("Lỗi khi tải chi tiết hóa đơn.");
    }
  };

  // Hiển thị tên người đặt ưu tiên contact_name, sau đó đến customer.full_name, cuối cùng là Guest
  const customerName = order.contact_name || order.customer?.full_name || "Guest";

  // Đếm tổng số lượng items (tổng quantity)
  const totalQuantity = Array.isArray(order.items)
    ? order.items.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0)
    : 0;

  return (
    <>
      <Card className="order-card h-100 shadow-sm border-0">
        <CardBody className="p-3 d-flex flex-column">
          {/* Top section */}
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="mb-0 fw-bold">{customerName}</h6>
              <small className="text-muted">{`#${
                order.order_code || "N/A"
              }`}</small>
            </div>
            {getStatusBadge(order.status)}
          </div>

          <hr className="my-3" />

          {/* Middle section */}
          <Row className="text-center">
            <Col xs="6" className="border-end">
              <BsBoxSeam size={22} className="text-muted mb-1" />
              <p className="text-muted small mb-0" style={{ lineHeight: "1.2" }}>
                Items
              </p>
              <p className="fw-bold fs-5 mb-0">{totalQuantity}</p>
            </Col>
            <Col xs="6">
              <FiClock size={22} className="text-muted mb-1" />
              <p className="text-muted small mb-0" style={{ lineHeight: "1.2" }}>
                Time
              </p>
              <p className="fw-bold mb-0">
                {new Date(order.created_at).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
              <p className="text-muted small mb-0">
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  month: "numeric",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </Col>
          </Row>

          <div className="mt-auto pt-3">
            {/* Bottom section */}
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0 text-muted">Total Amount</h6>
              <h5 className="mb-0 order-card-total-amount fw-bold">
                {formatCurrency(order.total_amount)}
              </h5>
            </div>

            <div className="d-flex mt-3 gap-2">
              {order.status === 'completed' ? (
                <Button
                  color="primary"
                  className="w-100 border"
                  onClick={() => handleViewBill(order.id)}
                >
                  <MdVisibility className="me-1" /> Xem Bill
                </Button>
              ) : (
                <Button
                  color="light"
                  className="w-100 border"
                  onClick={() => setIsOpen(true)}
                >
                  <MdVisibility className="me-1" /> Xem chi tiết
                </Button>
              )}

              {onEdit && order.status !== 'completed' && order.status !== 'cancelled' && (
                <Button
                  color="warning"
                  className="w-100 border"
                  onClick={() => onEdit(order)}
                >
                  <MdModeEdit className="me-1" /> Sửa
                </Button>
              )}
              {order.status === 'completed' && onDelete && (
                <Button
                  color="danger"
                  className="w-100 border"
                  onClick={() => onDelete(order)}
                >
                  <MdDelete className="me-1" /> Xóa
                </Button>
              )}
            </div>
            {/* Nút thanh toán nếu trạng thái là ready */}
            {/* {order.status === 'ready' && (
              <Button color="success" className="w-100 mt-2" onClick={() => setShowPaymentModal(true)}>
                Thanh toán
              </Button>
            )} */}
          </div>
        </CardBody>
      </Card>

      {/* Modal xem chi tiết đơn hàng */}
      <OrderDetailModal isOpen={isOpen} toggle={() => setIsOpen(false)} order={order} />

      {/* Modal xem chi tiết Bill */}
      {showBillDetailModal && (
        <BillDetailModal
          isOpen={showBillDetailModal}
          toggle={() => setShowBillDetailModal(false)}
          orderId={order.id}
          fullUrl={BASE_URL}
        />
      )}

      {/* Modal thanh toán */}
      <PaymentModal
        isOpen={showPaymentModal}
        toggle={() => setShowPaymentModal(false)}
        orderId={order.id}
        orderItems={order.items}
        total={order.total_amount}
      />
    </>
  );
};

export default OrderCard;