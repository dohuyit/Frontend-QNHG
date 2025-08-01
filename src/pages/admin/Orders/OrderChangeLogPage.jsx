import React, { useEffect, useState } from "react";
import { Table, Spinner, Input, Row, Col, Button, Badge } from "reactstrap";
import { getOrderChangeLogs } from "@services/admin/orderService";

const getTypeLabel = (type) => {
  switch (type) {
    case "UPDATE_STATUS": return "Thay đổi trạng thái";
    case "UPDATE_FIELD": return "Cập nhật trường";
    case "ADD_ITEM": return "Thêm món";
    case "DELETE_ITEM": return "Xóa món";
    case "UPDATE_ITEM": return "Cập nhật món";
    case "UPDATE_ITEM_STATUS": return "Trạng thái món";
    case "UPDATE_TABLES": return "Cập nhật bàn";
    default: return type;
  }
};

// Hàm parse giá trị món ăn từ JSON
const renderDishValue = (val) => {
  try {
    if (!val) return "Không có";
    const parsed = typeof val === 'string' ? JSON.parse(val) : val;
    if (Array.isArray(parsed)) {
      return parsed.map(item => item.dish_id ? `Món #${item.dish_id}` : '').join(', ') || 'Không có';
    } else if (parsed && parsed.dish_id) {
      return `Món #${parsed.dish_id}`;
    }
    return typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
  } catch  {
    return val;
  }
};

const renderValue = (log, type) => {
  const value = type === 'old' ? log.old_value : log.new_value;
  if (!value || value === 'null') return 'Không có';
  if (["ADD_ITEM","UPDATE_ITEM","DELETE_ITEM"].includes(log.change_type) || log.field_changed === 'item') {
    return renderDishValue(value);
  }
  return value;
};

const OrderChangeLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterField, setFilterField] = useState("");
  const [filterOrderCode, setFilterOrderCode] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getOrderChangeLogs()
      .then(res => {
        let data = res.data.data || res.data;
        if (!Array.isArray(data)) data = [];
        setLogs(data);
      })
      .catch(() => setError("Không thể tải lịch sử thay đổi đơn hàng!"))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = Array.isArray(logs) ? logs.filter(log => {
    let match = true;
    if (search) {
      match = (
        (log.order_code && log.order_code.toLowerCase().includes(search.toLowerCase())) ||
        (log.user_name && log.user_name.toLowerCase().includes(search.toLowerCase())) ||
        (log.description && log.description.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (filterType && log.change_type !== filterType) return false;
    if (filterUser && log.user_name !== filterUser) return false;
    if (filterField && log.field_changed !== filterField) return false;
    if (filterOrderCode && log.order_code !== filterOrderCode) return false;
    if (filterDate && log.change_timestamp && !log.change_timestamp.startsWith(filterDate)) return false;
    return match;
  }) : [];

  return (
    <div className="container-fluid mt-4">
      <Row className="mb-3 align-items-end">
        <Col md={3}>
          <Input
            placeholder="Lọc mã đơn hàng"
            value={filterOrderCode}
            onChange={e => setFilterOrderCode(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Input
            type="select"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="">Tất cả loại thay đổi</option>
            <option value="UPDATE_STATUS">Thay đổi trạng thái</option>
            <option value="UPDATE_FIELD">Cập nhật trường</option>
            <option value="ADD_ITEM">Thêm món</option>
            <option value="DELETE_ITEM">Xóa món</option>
            <option value="UPDATE_ITEM">Cập nhật món</option>
            <option value="UPDATE_ITEM_STATUS">Trạng thái món</option>
            <option value="UPDATE_TABLES">Cập nhật bàn</option>
          </Input>
        </Col>
        <Col md={2}>
          <Input
            placeholder="Người thao tác"
            value={filterUser}
            onChange={e => setFilterUser(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Input
            placeholder="Trường thay đổi"
            value={filterField}
            onChange={e => setFilterField(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
        </Col>
        <Col md={1} className="text-end">
          <Button color="secondary" outline onClick={() => {
            setSearch(""); setFilterType(""); setFilterUser(""); setFilterField(""); setFilterOrderCode(""); setFilterDate("");
          }}>Xóa lọc</Button>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col md={6}><h4 className="fw-bold">Lịch sử thay đổi đơn hàng</h4></Col>
        <Col md={6} className="text-end">
          <Input
            placeholder="Tìm kiếm nhanh..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Col>
      </Row>
      {loading ? (
        <div className="text-center py-4"><Spinner size="sm" /> Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="text-danger text-center py-4">{error}</div>
      ) : (
        <Table bordered responsive hover size="sm">
          <thead>
            <tr>
              <th>Mã đơn</th>
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
            {filteredLogs.length === 0 ? (
              <tr><td colSpan={8} className="text-center">Không có dữ liệu</td></tr>
            ) : filteredLogs.map((log, idx) => (
              <tr key={log.id || idx}>
                <td>{log.order_code || "Không có"}</td>
                <td>{log.change_timestamp ? new Date(log.change_timestamp).toLocaleString("vi-VN") : "-"}</td>
                <td>{log.user_name || log.user_id || "-"}</td>
                <td><Badge color="info">{getTypeLabel(log.change_type)}</Badge></td>
                <td>{log.field_changed || "-"}</td>
                <td style={{ maxWidth: 120, whiteSpace: 'pre-line', wordBreak: 'break-all' }}>{renderValue(log, 'old')}</td>
                <td style={{ maxWidth: 120, whiteSpace: 'pre-line', wordBreak: 'break-all' }}>{renderValue(log, 'new')}</td>
                <td>{log.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default OrderChangeLogPage;
