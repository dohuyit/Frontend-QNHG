import React from "react";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "preparing", label: "Đang chế biến" },
  { value: "ready", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];
const PRIORITY_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "1", label: "Ưu tiên" },
  { value: "0", label: "Thường" },
];

const FilterBar = ({ filter, onChange, onSearch, onReset }) => (
  <div className="kitchen-filter-bar d-flex align-items-end gap-2 mb-3">
    <div>
      <label>Mã đơn</label>
      <input type="text" className="form-control" name="order_id" value={filter.order_id || ""} onChange={onChange} placeholder="Nhập mã đơn..." />
    </div>
    <div>
      <label>Bàn</label>
      <input type="text" className="form-control" name="table_number" value={filter.table_number || ""} onChange={onChange} placeholder="Nhập số bàn..." />
    </div>
    <div>
      <label>Món ăn</label>
      <input type="text" className="form-control" name="item_name" value={filter.item_name || ""} onChange={onChange} placeholder="Nhập tên món..." />
    </div>
    <div>
      <label>Trạng thái</label>
      <select className="form-control" name="status" value={filter.status || ""} onChange={onChange}>
        {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
    <div>
      <label>Ưu tiên</label>
      <select className="form-control" name="is_priority" value={filter.is_priority || ""} onChange={onChange}>
        {PRIORITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
    <button className="btn btn-primary" onClick={onSearch}>Tìm kiếm</button>
    <button className="btn btn-secondary" onClick={onReset}>Reset</button>
  </div>
);

export default FilterBar; 