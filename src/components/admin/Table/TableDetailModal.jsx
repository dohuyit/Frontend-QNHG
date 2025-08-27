import React, { useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Badge,
  Alert,
} from "reactstrap";
import "./TableDetailModal.scss";

const TableDetailModal = ({ isOpen, toggle, table, tableAreas = [] }) => {
  useEffect(() => {
    if (isOpen && table) {
      console.log("Chi tiết bàn:", table);
    }
  }, [isOpen, table]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { color: "success", text: "Trống" },
      occupied: { color: "danger", text: "Đang sử dụng" },
      reserved: { color: "warning", text: "Đã đặt" },
      cleaning: { color: "info", text: "Đang dọn dẹp" },
      out_of_service: { color: "secondary", text: "Ngưng phục vụ" },
    };
    const config = statusConfig[status] || {
      color: "secondary",
      text: "Không xác định",
    };
    return <Badge color={config.color}>{config.text}</Badge>;
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A";
    const date = new Date(dateTimeStr);
    return date.toLocaleString("vi-VN");
  };

  const renderOccupiedContent = () => {
    if (!table.order) {
      return (
        <Alert color="warning">
          Bàn này chưa có đơn hàng nào đang hoạt động.
        </Alert>
      );
    }

    const orderData = table.order;

    return (
      <div className="order-details">
        <h5 className="mb-3 text-primary">Thông tin đơn hàng</h5>

        <Row className="mb-3">
          <Col md={6}>
            <div className="mb-2">
              <strong>Mã đơn hàng:</strong>
              <div className="text-muted">#{orderData.id}</div>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-2">
              <strong>Trạng thái:</strong>
              <div className="mt-1">
                <Badge color="danger">Đang xử lý</Badge>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <div className="mb-2">
              <strong>Ngày đặt:</strong>
              <div className="text-muted">
                {formatDateTime(orderData.created_at)}
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-2">
              <strong>Số khách:</strong>
              <div className="text-muted">
                {orderData.number_of_guests || "N/A"} người
              </div>
            </div>
          </Col>
        </Row>

        {/* Thông tin khách hàng */}
        <Row className="mb-3">
          <Col md={12}>
            <div className="mb-2">
              <strong>Thông tin khách hàng:</strong>
              <div className="p-3 bg-light rounded">
                <Row>
                  <Col md={6}>
                    <div className="mb-1">
                      <strong>Tên khách:</strong>
                      <div className="text-muted">
                        {orderData.contact_name ||
                          (orderData.customer &&
                            (orderData.customer.full_name ||
                              orderData.customer.name)) ||
                          "Guest"}
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-1">
                      <strong>Số điện thoại:</strong>
                      <div className="text-muted">
                        {orderData.contact_phone ||
                          (orderData.customer &&
                            (orderData.customer.phone_number ||
                              orderData.customer.phone)) ||
                          "N/A"}
                      </div>
                    </div>
                  </Col>
                </Row>
                {orderData.customer && orderData.customer.email && (
                  <Row>
                    <Col md={6}>
                      <div className="mb-1">
                        <strong>Email:</strong>
                        <div className="text-muted">
                          {orderData.customer.email}
                        </div>
                      </div>
                    </Col>
                  </Row>
                )}
              </div>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <div className="mb-2">
              <strong>Tổng tiền:</strong>
              <div className="text-success fw-bold">
                {orderData.total_amount
                  ? `${orderData.total_amount.toLocaleString("vi-VN")} VNĐ`
                  : "N/A"}
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-2">
              <strong>Phương thức thanh toán:</strong>
              <div className="text-muted">
                {orderData.payment_method === "cash"
                  ? "Tiền mặt"
                  : orderData.payment_method === "card"
                  ? "Thẻ"
                  : orderData.payment_method === "transfer"
                  ? "Chuyển khoản"
                  : "N/A"}
              </div>
            </div>
          </Col>
        </Row>

        {/* Danh sách món ăn */}
        {orderData.order_items && orderData.order_items.length > 0 ? (
          <div className="mb-3">
            <strong>Danh sách món ăn đã đặt:</strong>
            <div className="mt-2 border rounded order-items-list">
              {orderData.order_items.map((item, index) => (
                <div
                  key={index}
                  className="d-flex justify-content-between align-items-center p-3 border-bottom order-item"
                >
                  <div className="flex-grow-1">
                    <div className="fw-bold text-primary">
                      {item.dish_name || item.name}
                    </div>
                    <small className="text-muted">
                      Số lượng: {item.quantity} x{" "}
                      {item.unit_price
                        ? `${item.unit_price.toLocaleString("vi-VN")} VNĐ`
                        : "N/A"}
                    </small>
                    {item.notes && (
                      <div className="mt-1">
                        <small className="text-info">
                          <strong>Ghi chú:</strong> {item.notes}
                        </small>
                      </div>
                    )}
                  </div>
                  <div className="text-end ms-3">
                    <div className="fw-bold text-success">
                      {item.unit_price && item.quantity
                        ? `${(item.unit_price * item.quantity).toLocaleString(
                            "vi-VN"
                          )} VNĐ`
                        : "N/A"}
                    </div>
                    <small className="text-muted">
                      {item.kitchen_status === "pending"
                        ? "Chờ xử lý"
                        : item.kitchen_status === "preparing"
                        ? "Đang chế biến"
                        : item.kitchen_status === "ready"
                        ? "Sẵn sàng"
                        : item.kitchen_status === "served"
                        ? "Đã phục vụ"
                        : "N/A"}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-muted">Chưa có món ăn nào.</div>
        )}

        {orderData.notes && (
          <Row className="mb-3">
            <Col md={12}>
              <div className="mb-2">
                <strong>Ghi chú đơn hàng:</strong>
                <div className="text-muted p-3 bg-light rounded">
                  {orderData.notes}
                </div>
              </div>
            </Col>
          </Row>
        )}
      </div>
    );
  };

  const renderAvailableContent = () => {
    return (
      <div className="available-notice text-center">
        <div className="mb-4 available-icon">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            {/* Ghế trái */}
            <rect x="10" y="48" width="10" height="18" rx="3" fill="#B2DFDB" />
            <rect x="12" y="60" width="6" height="10" rx="2" fill="#4DD0E1" />
            {/* Ghế phải */}
            <rect x="60" y="48" width="10" height="18" rx="3" fill="#B2DFDB" />
            <rect x="62" y="60" width="6" height="10" rx="2" fill="#4DD0E1" />
            {/* Bàn tròn */}
            <ellipse cx="40" cy="50" rx="18" ry="8" fill="#A5D6A7" />
            <ellipse cx="40" cy="48" rx="20" ry="10" fill="#81C784" />
            {/* Chân bàn */}
            <rect x="37" y="58" width="6" height="14" rx="3" fill="#388E3C" />
          </svg>
        </div>
        <h4 className="text-success mb-3">Bàn trống</h4>
        <p className="text-muted">
          Bàn này hiện đang trống và sẵn sàng phục vụ khách hàng.
        </p>
        <p className="text-muted">
          Bạn có thể sử dụng bàn này để xếp khách mới.
        </p>
      </div>
    );
  };

  const renderCleaningContent = () => {
    return (
      <div className="cleaning-notice text-center" style={{ padding: "2rem" }}>
        <div className="mb-4">
          <i
            className="mdi mdi-tools"
            style={{ fontSize: "4rem", color: "#17a2b8" }}
          ></i>
        </div>
        <h4 className="text-info mb-3">Bàn đang dọn dẹp</h4>
        <p className="text-muted">Bàn này hiện đang được dọn dẹp</p>
        <p className="text-muted">Vui lòng chọn bàn khác hoặc quay lại sau.</p>
      </div>
    );
  };

  const renderOutOfServiceContent = () => {
    return (
      <div className="out-of-service-notice text-center">
        <div className="mb-4">
          <i
            className="mdi mdi-alert-circle"
            style={{ fontSize: "4rem", color: "#6c757d" }}
          ></i>
        </div>
        <h4 className="text-secondary mb-3">Bàn tạm ngưng phục vụ</h4>
        <p className="text-muted">
          Bàn này hiện đang tạm ngưng phục vụ do bảo trì hoặc sự cố.
        </p>
        <p className="text-muted">
          Vui lòng liên hệ quản lý để biết thêm thông tin.
        </p>
      </div>
    );
  };

  const renderContent = () => {
    if (!table) return null;

    switch (table.status) {
      case "available":
        return renderAvailableContent();
      case "occupied":
        return renderOccupiedContent();
      case "cleaning":
        return renderCleaningContent();
      case "out_of_service":
        return renderOutOfServiceContent();
      default:
        return null;
    }
  };

  const tableAreaName = (() => {
    if (table?.table_area?.name) return table.table_area.name;
    if (tableAreas.length && table?.table_area_id) {
      const found = tableAreas.find(
        (area) => String(area.id) === String(table.table_area_id)
      );
      if (found) return found.name;
    }
    return "N/A";
  })();

  // Nếu không có table thì không render modal
  if (!table) return null;

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="lg"
      centered
      className="table-detail-modal"
    >
      <ModalHeader toggle={toggle}>
        <div className="d-flex align-items-center">
          <span className="me-2">Chi tiết bàn</span>
          {table && getStatusBadge(table.status)}
        </div>
      </ModalHeader>
      <ModalBody>
        {table && (
          <div className="table-info mb-4">
            <Row>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Mã bàn:</strong>
                  <div className="text-muted">T{table.id}</div>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Số bàn:</strong>
                  <div className="text-muted">{table.table_number}</div>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Khu vực:</strong>
                  <div className="text-muted">{tableAreaName}</div>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Sức chứa:</strong>
                  <div className="text-muted">{table.table_type_label}</div>
                </div>
              </Col>
            </Row>
            {table.description && (
              <Row>
                <Col md={12}>
                  <div className="mb-2">
                    <strong>Mô tả:</strong>
                    <div className="text-muted">{table.description}</div>
                  </div>
                </Col>
              </Row>
            )}
          </div>
        )}

        {renderContent()}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Đóng
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TableDetailModal;
