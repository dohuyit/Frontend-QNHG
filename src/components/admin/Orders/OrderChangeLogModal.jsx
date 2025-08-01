import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner, Badge, Row, Col, Card, CardBody } from "reactstrap";
import { getOrderChangeLogs, getOrderDetail } from "@services/admin/orderService";
import { getDishes } from '@services/admin/dishService';
import { getCombos } from '@services/admin/comboService';
import { getTables } from '@services/admin/tableService';
import './OrderChangeLogModal.css';

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
    case "UPDATE_CUSTOMER": return "Thay đổi thông tin khách hàng";
    case "CREATE_ORDER": return "Tạo đơn hàng";
    case "UPDATE_ORDER": return "Cập nhật đơn hàng";
    case "DELETE_ORDER": return "Xóa đơn hàng";
    default: return type || "Không xác định";
  }
}

function getTypeColor(type) {
  switch (type) {
    case "UPDATE_STATUS": return "warning";
    case "ADD_ITEM": return "success";
    case "DELETE_ITEM": return "danger";
    case "UPDATE_ITEM": return "info";
    case "UPDATE_TABLES": return "primary";
    case "UPDATE_CUSTOMER": return "secondary";
    case "CREATE_ORDER": return "success";
    default: return "light";
  }
}

function getTypeIcon(type) {
  switch (type) {
    case "UPDATE_STATUS": return "fas fa-sync-alt";
    case "ADD_ITEM": return "fas fa-plus-circle";
    case "DELETE_ITEM": return "fas fa-minus-circle";
    case "UPDATE_ITEM": return "fas fa-edit";
    case "UPDATE_TABLES": return "fas fa-chair";
    case "UPDATE_CUSTOMER": return "fas fa-user-edit";
    case "CREATE_ORDER": return "fas fa-file-plus";
    default: return "fas fa-info-circle";
  }
}

const OrderChangeLogModal = ({ isOpen, toggle, orderId }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dishMap, setDishMap] = useState({});
  const [comboMap, setComboMap] = useState({});
  const [tableMap, setTableMap] = useState({});
  const [orderInfo, setOrderInfo] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    if (!orderId || !isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      setBatches([]); // Fix: đổi từ setLogs thành setBatches
      setOrderInfo(null);

      try {
        // Lấy thông tin đơn hàng
        const orderRes = await getOrderDetail(orderId);
        setOrderInfo(orderRes.data?.data?.order || null);

        // Lấy danh sách món ăn/combo/bàn
        const [dishRes, comboRes, tableRes] = await Promise.all([
          getDishes({ limit: 1000 }),
          getCombos({ limit: 1000 }),
          getTables({ limit: 1000 })
        ]);

        const dishList = dishRes.data?.data?.items || [];
        const comboList = comboRes.data?.data?.items || [];
        const tableList = tableRes.data?.data?.items || [];

        const dishMapTmp = {};
        dishList.forEach(d => {
          dishMapTmp[d.id] = { name: d.name, image: d.image, price: d.price };
        });
        setDishMap(dishMapTmp);

        const comboMapTmp = {};
        comboList.forEach(c => {
          comboMapTmp[c.id] = { name: c.name, image: c.image, price: c.price };
        });
        setComboMap(comboMapTmp);

        const tableMapTmp = {};
        tableList.forEach(t => {
          tableMapTmp[t.id] = { name: t.name, capacity: t.capacity, location: t.location };
        });
        setTableMap(tableMapTmp);

        // Lấy lịch sử thay đổi
        const data = await getOrderChangeLogs(orderId);
        setBatches(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError("Không thể tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, isOpen]);

  // Luôn chọn batch mới nhất khi mở modal hoặc khi batches thay đổi
  useEffect(() => {
    if (batches && batches.length > 0) {
      setSelectedBatch(batches[0]);
    } else {
      setSelectedBatch(null);
    }
  }, [batches]);

  const handleBatchClick = (batch) => {
    setSelectedBatch(batch);
  };

  const getChangeTypes = (log) => {
    const types = [];

    if (log.change_type) {
      types.push({
        type: log.change_type,
        label: getTypeLabel(log.change_type),
        color: getTypeColor(log.change_type),
        icon: getTypeIcon(log.change_type)
      });
    }

    return types;
  };

  const formatDetailValue = (value, type) => {
    if (!value || value === 'null' || value === 'undefined') return 'Không có';

    let obj = value;
    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
      try {
        obj = JSON.parse(value);
      } catch {
        obj = value;
      }
    }

    // Hiển thị chi tiết món ăn với ảnh
    if (obj && typeof obj === 'object' && (obj.dish_id || obj.combo_id)) {
      const itemId = obj.dish_id || obj.combo_id;
      const itemData = obj.dish_id ? dishMap[itemId] : comboMap[itemId];

      return (
        <div className="d-flex align-items-center mb-2">
          {itemData?.image && (
            <img
              src={itemData.image}
              alt={itemData.name}
              className="me-3 item-image"
              style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
            />
          )}
          <div>
            <div className="fw-bold mb-1">{itemData?.name || itemId}</div>
            {obj.quantity && <div className="text-muted small">Số lượng: <span className="text-primary fw-bold">{obj.quantity}</span></div>}
            {itemData?.price && <div className="text-muted small">Giá: <span className="text-success fw-bold">{itemData.price.toLocaleString('vi-VN')}đ</span></div>}
            {obj.notes && <div className="text-muted small">Ghi chú: {obj.notes}</div>}
          </div>
        </div>
      );
    }

    // Hiển thị chi tiết bàn
    if (obj && typeof obj === 'object' && obj.table_id) {
      const tableData = tableMap[obj.table_id];
      return (
        <div className="p-2 bg-light rounded">
          <div className="fw-bold text-primary mb-1">{tableData?.name || `Bàn ${obj.table_id}`}</div>
          {tableData?.capacity && <div className="small text-muted">Sức chứa: {tableData.capacity} người</div>}
          {tableData?.location && <div className="small text-muted">Vị trí: {tableData.location}</div>}
        </div>
      );
    }

    // Hiển thị object thường
    if (obj && typeof obj === 'object') {
      return (
        <div className="bg-light p-2 rounded">
          {Object.entries(obj).map(([k, v]) => (
            <div key={k} className="mb-1 small">
              <span className="fw-bold text-primary">{k}:</span> <span className="text-dark">{String(v)}</span>
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-dark">{String(obj)}</span>;
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="xl"
      centered
      className="order-history-modal"
      style={{ maxWidth: '80%' }}
    >
      <ModalHeader toggle={toggle} className="modal-header-gradient">
        <div className="d-flex align-items-center">
          <i className="fas fa-history me-2"></i>
          <div>
            <h5 className="mb-1 text-white">Lịch sử thay đổi đơn hàng</h5>
            {orderInfo && (
              <div className="text-white-50 small">
                Mã đơn hàng: <strong className="text-white">{orderInfo.order_code}</strong>
              </div>
            )}
          </div>
        </div>
      </ModalHeader>
      <ModalBody className="p-0">
        {loading ? (
          <div className="text-center py-5">
            <Spinner size="lg" className="loading-spinner mb-3" color="primary" />
            <div className="text-muted">{LOADING_TEXT}</div>
          </div>
        ) : error ? (
          <div className="text-danger text-center py-5">
            <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
            <div>{error}</div>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-inbox fa-2x text-muted mb-3"></i>
            <div className="text-muted">{EMPTY_TEXT}</div>
          </div>
        ) : (
          <div className="row g-0" style={{ height: '70vh' }}>
            {/* Cột bên trái: Danh sách batch lịch sử */}
            <div className="col-md-8 border-end" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
              <div className="p-4 h-100" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <div className="d-flex align-items-center mb-3">
                  <h6 className="mb-0 text-primary fw-bold">
                    <i className="fas fa-list-ul me-2"></i>
                    Danh sách thao tác ({batches.length})
                  </h6>
                </div>
                <div className="timeline-container" style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '10px' }}>
                  {batches.map((batch, idx) => {
                    const isSelected = selectedBatch === batch;

                    // Lấy loại thay đổi đặc trưng của batch (ưu tiên loại lớn nhất trong logs)
                    const mainLog = batch.logs?.[0] || {};
                    const changeTypes = mainLog.change_type ? getChangeTypes(mainLog) : [];

                    return (
                      <Card
                        key={batch.batch_id || idx}
                        className={`mb-3 timeline-card cursor-pointer ${isSelected ? 'selected-card' : ''}`}
                        onClick={() => handleBatchClick(batch)}
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: isSelected ? '2px solid #0d6efd' : '1px solid #e9ecef',
                          background: isSelected ? '#f8f9ff' : '#fff',
                          transform: isSelected ? 'translateY(-2px)' : 'none',
                          boxShadow: isSelected ? '0 8px 25px rgba(13,110,253,0.15)' : '0 2px 10px rgba(0,0,0,0.05)'
                        }}
                      >
                        <CardBody className="p-3">
                          <div className="d-flex align-items-start justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              {changeTypes[0] && (
                                <div className="me-3">
                                  <i className={`${changeTypes[0].icon} text-${changeTypes[0].color}`} style={{ fontSize: '18px' }}></i>
                                </div>
                              )}
                              <div>
                                <div className="fw-bold text-dark mb-1">
                                  <i className="fas fa-user text-muted me-2" style={{ fontSize: '12px' }}></i>
                                  {batch.user_name || batch.user_id || 'Hệ thống'}
                                </div>
                                <div className="text-muted small">
                                  <i className="fas fa-clock me-2"></i>
                                  {batch.change_timestamp ? new Date(batch.change_timestamp).toLocaleString('vi-VN') : '-'}
                                </div>
                              </div>
                            </div>
                            <div className="text-end">
                              {batch.logs?.map((log, typeIdx) => (
                                <Badge key={typeIdx} color={getTypeColor(log.change_type)} className="me-1 mb-1">
                                  {getTypeLabel(log.change_type)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {mainLog.description && (
                            <div className="mt-2 p-2 bg-light rounded">
                              <i className="fas fa-info-circle text-info me-2"></i>
                              <span className="text-muted small">{mainLog.description}</span>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Cột bên phải: Chi tiết thay đổi của batch */}
            <div className="col-md-4" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
              <div className="p-4 h-100 detail-panel" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <div className="detail-header mb-3">
                  <h6 className="mb-0 text-primary fw-bold">
                    <i className="fas fa-info-circle me-2"></i>
                    Chi tiết thay đổi
                  </h6>
                </div>
                {selectedBatch ? (
                  <div className="detail-content" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                    <div className="detail-section mb-4">
                      <label className="detail-label">
                        <i className="fas fa-clock text-primary me-2"></i>
                        Thời gian thao tác:
                      </label>
                      <div className="detail-value bg-light p-2 rounded">
                        {selectedBatch.change_timestamp ? new Date(selectedBatch.change_timestamp).toLocaleString('vi-VN') : '-'}
                      </div>
                    </div>
                    <div className="detail-section mb-4">
                      <label className="detail-label">
                        <i className="fas fa-user text-primary me-2"></i>
                        Người thao tác:
                      </label>
                      <div className="detail-value bg-light p-2 rounded">
                        {selectedBatch.user_name || selectedBatch.user_id || '-'}
                      </div>
                    </div>
                    {/* Danh sách các log con trong batch */}
                    <div className="detail-section mb-2">
                      <label className="detail-label">
                        <i className="fas fa-list text-primary me-2"></i>
                        Các thay đổi trong thao tác này:
                      </label>
                      <div>
                        {selectedBatch.logs?.map((log, idx) => (
                          <Card key={idx} className="mb-3 detail-log-card">
                            <CardBody className="p-3">
                              <div className="d-flex align-items-center mb-2">
                                <Badge color={getTypeColor(log.change_type)} className="me-2">
                                  <i className={`${getTypeIcon(log.change_type)} me-1`}></i>
                                  {getTypeLabel(log.change_type)}
                                </Badge>
                                <span className="text-muted small ms-2">
                                  {log.change_timestamp ? new Date(log.change_timestamp).toLocaleString('vi-VN') : '-'}
                                </span>
                              </div>
                              <div className="mb-2 small">
  <span className="fw-bold text-primary">Ảnh:</span>{(() => {
    // Xác định log món ăn
    const isDishLog = log.change_type === 'ADD_ITEM' || log.change_type === 'DELETE_ITEM' || log.change_type === 'UPDATE_ITEM' || (log.field_changed && log.field_changed.includes('item'));
    let itemObj = null;
    if (isDishLog) {
      // Ưu tiên lấy new_value, nếu không có thì lấy old_value
      let val = log.new_value || log.old_value;
      try {
        if (typeof val === 'string') val = JSON.parse(val);
      } catch {}
      itemObj = val;
      let itemData = null;
      if (itemObj && itemObj.dish_id && dishMap[itemObj.dish_id]) itemData = dishMap[itemObj.dish_id];
      if (itemObj && itemObj.combo_id && comboMap[itemObj.combo_id]) itemData = comboMap[itemObj.combo_id];
      if (itemData && itemData.image) {
        return (
          <img src={itemData.image} alt={itemData.name} style={{width:40, height:40, objectFit:'cover', borderRadius:8, marginLeft:8}} />
        );
      }
      return <span className="text-muted ms-2">Không có ảnh</span>;
    } else {
      return <span className="text-muted ms-2">O có ảnh</span>;
    }
  })()}
</div>
                              {log.old_value && (
                                <div className="mb-2">
                                  <span className="fw-bold text-danger">Giá trị cũ:</span>
                                  <div>{formatDetailValue(log.old_value, log.change_type)}</div>
                                </div>
                              )}
                              {log.new_value && (
                                <div className="mb-2">
                                  <span className="fw-bold text-success">Giá trị mới:</span>
                                  <div>{formatDetailValue(log.new_value, log.change_type)}</div>
                                </div>
                              )}
                              {log.description && (
                                <div className="mb-2">
                                  <span className="fw-bold text-info">Mô tả:</span> {log.description}
                                </div>
                              )}
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted mt-5" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <i className="fas fa-hand-pointer fa-2x mb-3"></i>
                    <div>Chọn một thao tác để xem chi tiết</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter className="border-top bg-light">
        <Button color="secondary" onClick={toggle}>
          <i className="fas fa-times me-2"></i>
          Đóng
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default OrderChangeLogModal;