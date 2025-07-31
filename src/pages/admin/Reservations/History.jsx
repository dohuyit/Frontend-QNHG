import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, Table, Button, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col
} from "reactstrap";
import { toast } from "react-toastify";
import { getReservations, getReservationDetail, getReservationChangeLogs } from "@services/admin/reservationService";
import ReservationChangeLogModal from "@components/admin/Reservations/ReservationChangeLogModal";

const ReservationHistory = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [filter, setFilter] = useState({
    date: "",
    customer_name: "",
    status: "",
    customer_phone: ""
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await getReservations({ limit: 20 });
      setReservations(res.data.data.items || []);
    } catch {
      toast.error("Không thể tải danh sách đơn đặt bàn");
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id) => {
    setShowDetail(true);
    setDetail(null);
    try {
      const res = await getReservationDetail(id);
      setDetail(res.data.data.reservation);
    } catch {
      toast.error("Không thể tải chi tiết đơn đặt bàn");
      setShowDetail(false);
    }
  };

  const openLogs = async (id) => {
    setShowLogs(true);
    setLogsLoading(true);
    try {
      const res = await getReservationChangeLogs(id);
      setLogs(res.data.data || []);
      } catch {
      toast.error("Không thể tải lịch sử thay đổi");
    } finally {
      setLogsLoading(false);
    }
  };



  const filteredReservations = reservations.filter(item => {
    return (
      (!filter.customer_name || item.customer_name?.toLowerCase().includes(filter.customer_name.toLowerCase())) &&
      (!filter.customer_phone || item.customer_phone?.includes(filter.customer_phone)) &&
      (!filter.status || item.status === filter.status) &&
      (!filter.date || item.reservation_date === filter.date)
    );
  });

  return (
    <div className="page-content">
      <Card className="mb-4">
        <CardHeader className="bg-white border-bottom-0">
          <h4 className="mb-0">Lịch sử đơn đặt bàn</h4>
        </CardHeader>
        <CardBody>
          <Row className="mb-3">
            <Col md={3}>
              <input className="form-control" placeholder="Tên khách hàng" value={filter.customer_name} onChange={e => setFilter(f => ({...f, customer_name: e.target.value}))} />
            </Col>
            <Col md={3}>
              <input className="form-control" placeholder="Số điện thoại" value={filter.customer_phone} onChange={e => setFilter(f => ({...f, customer_phone: e.target.value}))} />
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
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên khách hàng</th>
                  <th>Số điện thoại</th>
                  <th>Ngày đặt</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>{item.customer_name}</td>
                    <td>{item.customer_phone}</td>
                    <td>{item.reservation_date}</td>
                    <td>{item.status}</td>
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

      {/* Modal chi tiết đơn đặt bàn */}
      <Modal isOpen={showDetail} toggle={() => setShowDetail(false)} size="lg">
        <ModalHeader toggle={() => setShowDetail(false)}>Chi tiết đơn đặt bàn</ModalHeader>
        <ModalBody>
          {detail ? (
            <Row>
              <Col md={6}><b>Tên khách hàng:</b> {detail.customer_name}</Col>
              <Col md={6}><b>Số điện thoại:</b> {detail.customer_phone}</Col>
              <Col md={6}><b>Email:</b> {detail.customer_email}</Col>
              <Col md={6}><b>Ngày đặt:</b> {detail.reservation_date}</Col>
              <Col md={6}><b>Giờ đặt:</b> {detail.reservation_time}</Col>
              <Col md={6}><b>Số khách:</b> {detail.number_of_guests}</Col>
              <Col md={6}><b>Bàn:</b> {Array.isArray(detail.table_id) ? detail.table_id.join(", ") : detail.table_id}</Col>
              <Col md={6}><b>Trạng thái:</b> {detail.status}</Col>
              <Col md={12}><b>Ghi chú:</b> {detail.notes}</Col>
            </Row>
          ) : <div className="text-center py-4"><Spinner color="primary" /></div>}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowDetail(false)}>Đóng</Button>
        </ModalFooter>
      </Modal>

      {/* Modal lịch sử thay đổi */}
      <ReservationChangeLogModal
        isOpen={showLogs}
        toggle={() => setShowLogs(false)}
        logs={logs}
        loading={logsLoading}
      />
    </div>
  );
};

export default ReservationHistory; 