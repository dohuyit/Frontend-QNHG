import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Table,
  Badge,
  Spinner,
} from "reactstrap";

const statusColor = {
  pending: "warning",
  confirmed: "success",
  cancelled: "danger",
  completed: "info",
};

const fieldLabels = {
  // Khách hàng
  customer_id: "Khách hàng",
  customer_name: "Tên khách hàng",
  customer_phone: "Số điện thoại",
  customer_email: "Email",
  // Thời gian đặt
  reservation_date: "Ngày đặt",
  reservation_time: "Giờ đặt",
  confirmed_at: "Thời điểm xác nhận",
  cancelled_at: "Thời điểm hủy",
  completed_at: "Thời điểm hoàn thành",
  // Thông tin khác
  number_of_guests: "Số khách",
  table_id: "Bàn",
  notes: "Ghi chú",
  status: "Trạng thái",
  user_id: "Người phụ trách",
};

export default function ReservationChangeLogModal({
  isOpen, toggle, logs, loading, userMap = {}
}) {
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl">
      <ModalHeader toggle={toggle}>Lịch sử thay đổi đơn đặt bàn</ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        ) : logs && logs.length > 0 ? (
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người thao tác</th>
                <th>Loại thay đổi</th>
                <th>Trường</th>
                <th>Giá trị cũ</th>
                <th>Giá trị mới</th>
                <th>Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    {new Date(log.change_timestamp).toLocaleString("vi-VN")}
                  </td>
                  <td>{log.user_name || userMap[log.user_id] || log.user_id}</td>
                  <td>
                    <Badge color="info">{log.change_type}</Badge>
                  </td>
                  <td>{fieldLabels[log.field_changed] || log.field_changed}</td>
                  <td>
                    {log.field_changed === "status" ? (
                      <Badge color={statusColor[log.old_value] || "secondary"}>
                        {log.old_value}
                      </Badge>
                    ) : (
                      log.old_value
                    )}
                  </td>
                  <td>
                    {log.field_changed === "status" ? (
                      <Badge color={statusColor[log.new_value] || "secondary"}>
                        {log.new_value}
                      </Badge>
                    ) : (
                      log.new_value
                    )}
                  </td>
                  <td>{log.description}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-center text-muted py-4">
            Chưa có lịch sử thay đổi
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}
