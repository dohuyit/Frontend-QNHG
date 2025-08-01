import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Table, Button, Spinner, Row, Col, Input, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { getOrders, getOrderDetail } from "@services/admin/orderService";
import OrderChangeLogModal from "@components/admin/Orders/OrderChangeLogModal";
import styles from './OrderHistoryPage.module.css';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [filter, setFilter] = useState({
    order_code: "",
    user_name: "",
    status: "",
    date: ""
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrders({ limit: 20 });
      setOrders(res.data.data.items || []);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id) => {
    setShowDetail(true);
    setDetail(null);
    try {
      const res = await getOrderDetail(id);
      setDetail(res.data.data.order);
    } catch {
      setShowDetail(false);
    }
  };

  const openLogs = (id) => {
    setSelectedOrderId(id);
    setShowLogs(true);
  };

  const filteredOrders = orders.filter(item => {
    return (
      (!filter.order_code || item.order_code?.toLowerCase().includes(filter.order_code.toLowerCase())) &&
      (!filter.user_name || item.user_name?.toLowerCase().includes(filter.user_name.toLowerCase())) &&
      (!filter.status || item.status === filter.status) &&
      (!filter.date || (item.order_time && item.order_time.startsWith(filter.date)))
    );
  });

  function getStatusLabel(status) {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  }
  function getStatusColor(status) {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  }

  return (
    <div className={styles['order-history-page']}>
      <Card className={`mb-4 ${styles['order-card']}`}>
        <CardHeader className={styles['order-header']}>
          <h4 className="mb-0">Lịch sử đơn hàng</h4>
        </CardHeader>
        <CardBody>
          <Row className="mb-3">
            <Col md={3}>
              <input className="form-control" placeholder="Mã đơn hàng" value={filter.order_code} onChange={e => setFilter(f => ({...f, order_code: e.target.value}))} />
            </Col>
            <Col md={3}>
              <input className="form-control" placeholder="Người thao tác" value={filter.user_name} onChange={e => setFilter(f => ({...f, user_name: e.target.value}))} />
            </Col>
            <Col md={3}>
              <input className="form-control" type="date" value={filter.date} onChange={e => setFilter(f => ({...f, date: e.target.value}))} />
            </Col>
            <Col md={3}>
              <select className="form-control" value={filter.status} onChange={e => setFilter(f => ({...f, status: e.target.value}))}>
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </Col>
          </Row>
          {loading ? (
            <div className="text-center py-5"><Spinner color="primary" /></div>
          ) : (
            <Table bordered hover responsive className={styles['order-table']}>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Người thao tác</th>
                  <th>Thời gian tạo</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((item) => (
                  <tr key={item.id}>
                    <td>{item.order_code}</td>
                    <td>{item.user_name}</td>
                    <td>{item.order_time ? new Date(item.order_time).toLocaleString('vi-VN') : '-'}</td>
                    <td>
                      <span className={`badge bg-${getStatusColor(item.status)}`}>{getStatusLabel(item.status)}</span>
                    </td>
                    <td>
                      <Button color="info" size="sm" onClick={() => openDetail(item.id)} className="me-2">Chi tiết</Button>
                      <Button color="secondary" size="sm" onClick={() => openLogs(item.id)}>Lịch sử thay đổi</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Modal chi tiết đơn hàng */}
      <Modal isOpen={showDetail} toggle={() => setShowDetail(false)} size="lg" className={styles['order-modal']}>
        <ModalHeader toggle={() => setShowDetail(false)} className={styles['order-modal-header']}>Chi tiết đơn hàng</ModalHeader>
        <ModalBody className={styles['order-modal-body']}>
          {detail ? (
            <Row className="mb-2">
              <Col md={6}><span className={styles['order-detail-label']}>Mã đơn:</span> <span className={styles['order-detail-value']}>{detail.order_code}</span></Col>
              <Col md={6}><span className={styles['order-detail-label']}>Khách hàng:</span> <span className={styles['order-detail-value']}>{detail.contact_name}</span></Col>
              <Col md={6}><span className={styles['order-detail-label']}>Thời gian tạo:</span> <span className={styles['order-detail-value']}>{detail.order_time ? new Date(detail.order_time).toLocaleString('vi-VN') : '-'}</span></Col>
              <Col md={6}><span className={styles['order-detail-label']}>Trạng thái:</span> <span className={`badge bg-${getStatusColor(detail.status)}`}>{getStatusLabel(detail.status)}</span></Col>
              <Col md={12}><span className={styles['order-detail-label']}>Ghi chú:</span> <span className={styles['order-detail-value']}>{detail.notes}</span></Col>
            </Row>
          ) : <div className="text-center py-4"><Spinner color="primary" /></div>}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowDetail(false)}>Đóng</Button>
        </ModalFooter>
      </Modal>

      {/* Modal lịch sử thay đổi */}
      <OrderChangeLogModal
        isOpen={showLogs}
        toggle={() => setShowLogs(false)}
        orderId={selectedOrderId}
      />
    </div>
  );
};

export default OrderHistoryPage;
