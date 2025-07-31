import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner, Table, Badge } from "reactstrap";
import { getOrderChangeLogs }  from "@services/admin/orderService";
import { getDishes } from '@services/admin/dishService';
import { getCombos } from '@services/admin/comboService';

const LOADING_TEXT = "Đang tải lịch sử thay đổi...";
const EMPTY_TEXT = "Chưa có lịch sử thay đổi cho đơn hàng này.";

function getTypeLabel(type) {
  switch (type) {
    case "UPDATE_STATUS": return "Thay đổi trạng thái";
    case "UPDATE_FIELD": return "Cập nhật trường";
    case "ADD_ITEM": return "Thêm món";
    case "DELETE_ITEM": return "Xóa món";
    case "UPDATE_ITEM": return "Cập nhật món";
    case "UPDATE_ITEM_STATUS": return "Trạng thái món";
    case "UPDATE_TABLES": return "Cập nhật bàn";
    case "CREATE_ORDER": return "Tạo đơn hàng";
    case "UPDATE_ORDER": return "Cập nhật đơn hàng";
    case "DELETE_ORDER": return "Xóa đơn hàng";
    default: return type || "Không xác định";
  }
}

const OrderChangeLogModal = ({ isOpen, toggle, orderId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dishMap, setDishMap] = useState({});
  const [comboMap, setComboMap] = useState({});

  useEffect(() => {
    if (!orderId || !isOpen) return;
    // Lấy danh sách món ăn/combo khi mở modal
    const fetchDishesAndCombos = async () => {
      try {
        const [dishRes, comboRes] = await Promise.all([
          getDishes({ limit: 1000 }),
          getCombos({ limit: 1000 })
        ]);
        const dishList = dishRes.data?.data?.items || [];
        const comboList = comboRes.data?.data?.items || [];
        const dishMapTmp = {};
        dishList.forEach(d => { dishMapTmp[d.id] = d.name; });
        setDishMap(dishMapTmp);
        const comboMapTmp = {};
        comboList.forEach(c => { comboMapTmp[c.id] = c.name; });
        setComboMap(comboMapTmp);
      } catch {}
    };
    fetchDishesAndCombos();
    
    const fetchLogs = async () => {
      setLoading(true);
      setError("");
      setLogs([]);
      
      try {
        const data = await getOrderChangeLogs(orderId);
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching order change logs:', err);
        setError("Không thể tải lịch sử thay đổi!");
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, [orderId, isOpen]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" centered>
      <ModalHeader toggle={toggle}>Lịch sử thay đổi đơn hàng</ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="text-center py-4"><Spinner size="sm" /> {LOADING_TEXT}</div>
        ) : error ? (
          <div className="text-danger text-center py-4">{error}</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-4">{EMPTY_TEXT}</div>
        ) : (
          <Table bordered responsive hover size="sm">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người thao tác</th>
                <th>Loại thay đổi</th>
                <th>Giá trị cũ</th>
                <th>Giá trị mới</th>
                <th>Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => {
                const formatValue = (value, isOldValue = false) => {
                  // Nếu là giá trị cũ và không có thì trả về 'Không có'
                  if (isOldValue && (!value || value === 'null' || value === 'undefined' || value === '-')) return 'Không có';
                  if (!isOldValue && (!value || value === 'null' || value === 'undefined')) return "-";
                  let obj = value;
                  // Nếu là string JSON, parse ra object
                  if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                    try {
                      obj = JSON.parse(value);
                    } catch {
                      obj = value;
                    }
                  }
                  // Nếu là object món ăn
                  if (obj && typeof obj === 'object' && (obj.dish_id || obj.combo_id)) {
                    let tenMon = '';
                    if (obj.dish_id && typeof obj.dish_id === 'object' && obj.dish_id.name) tenMon = obj.dish_id.name;
                    else if (obj.combo_id && typeof obj.combo_id === 'object' && obj.combo_id.name) tenMon = obj.combo_id.name;
                    else if (obj.dish_id && dishMap[obj.dish_id]) tenMon = dishMap[obj.dish_id];
                    else if (obj.combo_id && comboMap[obj.combo_id]) tenMon = comboMap[obj.combo_id];
                    else tenMon = obj.dish_id || obj.combo_id || '';
                    return (
                      <span>
                        <b>{tenMon}</b>
                        {obj.quantity !== undefined && ` x${obj.quantity}`}<br/>
                        {obj.notes && <span>Ghi chú: {obj.notes}</span>}
                      </span>
                    );
                  }
                  // Nếu là object thường, hiển thị key: value dạng danh sách
                  if (obj && typeof obj === 'object') {
                    return (
                      <ul style={{paddingLeft: 16, marginBottom: 0}}>
                        {Object.entries(obj).map(([k, v]) => (
                          <li key={k}><b>{k}:</b> {String(v)}</li>
                        ))}
                      </ul>
                    );
                  }
                  return String(obj);
                };
                
                return (
                  <tr key={log.id || idx}>
                    <td>{log.change_timestamp ? new Date(log.change_timestamp).toLocaleString("vi-VN") : "-"}</td>
                    <td>{log.user_name || log.user_id || "-"}</td>
                    <td><Badge color="info">{getTypeLabel(log.change_type)}</Badge></td>
                    <td style={{ maxWidth: 150, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.85em' }}>
                      {formatValue(log.old_value, true)}
                    </td>
                    <td style={{ maxWidth: 150, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.85em' }}>
                      {formatValue(log.new_value)}
                    </td>
                    <td style={{ maxWidth: 200, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {log.description || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>Đóng</Button>
      </ModalFooter>
    </Modal>
  );
};

export default OrderChangeLogModal;
