import React, { useState } from "react";
import {
  Card,
  CardBody,
  Badge,
  Button,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { MdModeEdit, MdVisibility, MdReceipt } from "react-icons/md";
import { FaCheck, FaTimes, FaMoneyBillWave } from "react-icons/fa";

const OrderCard = ({ order, onEdit, onDelete, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_confirmation: { color: "warning", text: "Chờ xác nhận" },
      confirmed: { color: "info", text: "Đã xác nhận" },
      preparing: { color: "primary", text: "Đang chế biến" },
      ready: { color: "success", text: "Sẵn sàng" },
      delivered: { color: "success", text: "Đã giao" },
      cancelled: { color: "danger", text: "Đã hủy" },
      completed: { color: "info", text: "Hoàn thành" },
    };
    return <Badge color={statusConfig[status]?.color || "secondary"}>{statusConfig[status]?.text || "Không xác định"}</Badge>;
  };

  const getOrderTypeBadge = (orderType) => {
    const typeConfig = {
      "dine-in": { color: "primary", text: "Tại bàn" },
      takeaway: { color: "info", text: "Mang về" },
      delivery: { color: "success", text: "Giao hàng" },
    };
    return <Badge color={typeConfig[orderType]?.color || "secondary"} pill>{typeConfig[orderType]?.text || "Không xác định"}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const customerName = order.customer?.full_name || "Khách vãng lai";

  return (
    <>
      <Card className="shadow-sm border-light">
        <CardBody className="p-3">
          <div className="d-flex align-items-center mb-2">
            <div
              className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3"
              style={{ width: 40, height: 40 }}
            >
              <span className="text-primary" style={{ fontSize: 18, fontWeight: 600 }}>
                {customerName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-grow-1">
              <div className="fw-bold text-truncate">{customerName}</div>
              <div className="text-muted small">#{order.order_code || "N/A"}</div>
            </div>
            <div>{getOrderTypeBadge(order.order_type)}</div>
          </div>
          <div className="mb-2">
            <div className="text-muted small mb-1">Tổng tiền</div>
            <div className="fw-bold text-success">{formatCurrency(order.total_amount)}</div>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="text-muted small mb-1">Thời gian</div>
              <div className="fw-bold">
                {new Date(order.created_at).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            <div>{getStatusBadge(order.status)}</div>
          </div>
          <div className="mt-3">
            <Button color="light" size="sm" className="me-2" onClick={() => setIsOpen(true)}>
              <MdVisibility className="me-1" /> Xem
            </Button>
            {onEdit && (
              <Button color="light" size="sm" onClick={() => onEdit(order)}>
                <MdModeEdit className="me-1" /> Sửa
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Modal for Order Details */}
      <Modal isOpen={isOpen} toggle={() => setIsOpen(false)} size="lg">
        <ModalHeader toggle={() => setIsOpen(false)}>Chi tiết đơn hàng #{order.order_code}</ModalHeader>
        <ModalBody>
          <Row>
            <Col md={6}>
              <div><strong>Trạng thái:</strong> {getStatusBadge(order.status)}</div>
              <div><strong>Loại:</strong> {getOrderTypeBadge(order.order_type)}</div>
              <div><strong>Thời gian:</strong> {new Date(order.created_at).toLocaleString("vi-VN")}</div>
              <div><strong>Phương thức thanh toán:</strong> {order.payment_method || "N/A"}</div>
              <div><strong>Bàn:</strong> {order.table_id || "N/A"}</div>
              <div><strong>Số người:</strong> {order.number_of_people || 1}</div>
            </Col>
            <Col md={6}>
              <div><strong>Khách hàng:</strong> {customerName}</div>
              <div><strong>Tổng tiền:</strong> {formatCurrency(order.total_amount)}</div>
              <div><strong>Danh sách món:</strong></div>
              <ul>
                {order.items?.map((item, index) => (
                  <li key={index}>
                    {item.name} - {formatCurrency(item.price)} x {item.quantity}
                  </li>
                )) || <li>Không có món</li>}
              </ul>
              <div><strong>Ghi chú:</strong> {order.notes || "Không có"}</div>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setIsOpen(false)}>Đóng</Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default OrderCard;