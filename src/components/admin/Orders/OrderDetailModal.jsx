import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Card,
  CardBody,
  Badge
} from "reactstrap";
import { MdPrint, MdModeEdit } from "react-icons/md";
import "./OrderDetailModal.scss";
import { formatPriceToVND } from "@helpers/formatPriceToVND";

const getStatusInfo = (status) => {
  const statusConfig = {
    pending: { color: "warning", text: "Chờ xác nhận" },
    confirmed: { color: "info", text: "Đã xác nhận" },
    preparing: { color: "primary", text: "Đang chuẩn bị" },
    ready: { color: "success", text: "Sẵn sàng" },
    served: { color: "success", text: "Đã phục vụ" },
    delivered: { color: "success", text: "Đã giao" },
    cancelled: { color: "danger", text: "Đã hủy" },
    completed: { color: "success", text: "Hoàn tất" },
  };
  return statusConfig[status] || { color: "secondary", text: status };
};

const getOrderTypeInfo = (type) => {
  const typeConfig = {
    "dine-in": "Tại bàn",
    takeaway: "Mang về",
    delivery: "Giao hàng",
  };
  return typeConfig[type] || type;
};

const OrderDetailModal = ({ isOpen, toggle, order }) => {
  if (!order) return null;
  const customerName = order.contact_name || "Không có thông tin";
  const customerPhone = order.contact_phone || "-";
  const orderTime = order.order_time || order.created_at;
  const items = order.items || [];
  const totalQuantity = items.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);
  const subtotal = items.reduce((sum, item) => sum + (Number(item.unit_price || item.price) * Number(item.quantity)), 0);
  const vat = order.vat || 0;
  const total = order.final_amount || order.total_amount || subtotal;
  const tableNames = Array.isArray(order.tables) && order.tables.length > 0
    ? order.tables.map(t => t.table_number ? `${t.table_number}` : (t.id ? `${t.id}` : "")).join(", ")
    : (order.table_id ? `${order.table_id}` : "-");

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered className="order-detail-modal">
      <ModalHeader toggle={toggle} className="order-detail-modal-header p-3">
        <h4 className="modal-title mb-0 fw-bold">Chi tiết đơn hàng #{order.order_code}</h4>
      </ModalHeader>
      <ModalBody className="order-detail-modal-body p-0">
        <Row className="g-0">
          <Col md={6} className="order-info-col p-3 border-end">
            <Card className="order-info-card border-0 p-0">
              <CardBody className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Thông tin đơn hàng</h6>
                  <Badge color={getStatusInfo(order.status).color} pill className={`bg-${getStatusInfo(order.status).color} text-dark`}>
                    {getStatusInfo(order.status).text}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between mb-2"><span className="text-muted">Ngày tạo:</span><span>{orderTime ? new Date(orderTime).toLocaleString("vi-VN") : "-"}</span></div>
                <div className="d-flex justify-content-between mb-2"><span className="text-muted">Loại đơn:</span><span>{getOrderTypeInfo(order.order_type)}</span></div>
                <div className="d-flex justify-content-between mb-2"><span className="text-muted">Bàn:</span><span>{tableNames}</span></div>
                <div className="d-flex justify-content-between mb-2"><span className="text-muted">Số người:</span><span>{order.number_of_people || 1}</span></div>
                <div className="d-flex justify-content-between mb-2"><span className="text-muted">Ghi chú:</span><span>{order.notes || "Không có ghi chú"}</span></div>
                <hr className="my-3" />
                <h6 className="fw-bold mb-2">Thông tin khách hàng</h6>
                <div className="d-flex justify-content-between mb-2"><span className="text-muted">Tên:</span><span>{customerName}</span></div>
                <div className="d-flex justify-content-between mb-2"><span className="text-muted">Số điện thoại:</span><span>{customerPhone}</span></div>
                {order.order_type === 'delivery' && (
                  <>
                    <div className="d-flex justify-content-between mb-2"><span className="text-muted">Địa chỉ giao hàng:</span><span>{order.delivery_address || "-"}</span></div>
                    <div className="d-flex justify-content-between mb-2"><span className="text-muted">Người nhận:</span><span>{order.contact_name || "-"}</span></div>
                    <div className="d-flex justify-content-between mb-2"><span className="text-muted">SĐT người nhận:</span><span>{order.contact_phone || "-"}</span></div>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
          <Col md={6} className="order-items-col p-3">
            <Card className="order-items-card border-0 p-0">
              <CardBody className="p-3">
                <h6 className="fw-bold mb-3">Món đã gọi ({totalQuantity})</h6>
                {items.length > 0 ? items.map((item, idx) => (
                  <div key={idx} className="order-item-row d-flex justify-content-between">
                    <span>{item.name || item.dish_id?.name || item.menu_item_name}</span>
                    <span className="order-detail-price-lg">{formatPriceToVND(item.unit_price || item.price)} x {item.quantity}</span>
                  </div>
                )) : <div className="no-items">Không có món nào trong đơn.</div>}
                <hr className="my-3" />
                <div className="order-detail-row d-flex justify-content-between mb-3 order-detail-price-lg"><span>Tạm tính:</span><span>{formatPriceToVND(subtotal)}</span></div>
                <div className="order-detail-row d-flex justify-content-between mb-3 order-detail-price-lg"><span>VAT:</span><span>{formatPriceToVND(vat)}</span></div>
                <div className="order-detail-total d-flex justify-content-between fw-bold"><span>Tổng cộng:</span><span>{formatPriceToVND(total)}</span></div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter className="order-detail-modal-footer p-3">
        <Button color="secondary" onClick={toggle}>Đóng</Button>
      </ModalFooter>
    </Modal>
  );
};

export default OrderDetailModal;