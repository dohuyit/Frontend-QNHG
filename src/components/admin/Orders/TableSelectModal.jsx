import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "reactstrap";
import CardTable from "../Table/CardTable";
import "./TableSelectModal.scss";

const statusList = [
  { key: 'available', label: 'Trống' },
  { key: 'occupied', label: 'Đang sử dụng' },
  { key: 'cleaning', label: 'Đang dọn dẹp' },
  { key: 'out_of_service', label: 'Ngưng phục vụ' },
];

const TableSelectModal = ({
  isOpen,
  onClose,
  tableAreas = [],
  selectedArea,
  onAreaSelect,
  tableList = [],
  selectedTables = [],
  onTableToggle,
  loadingTables = false,
  selectedAreaIdFromTables,
}) => {
  return (
    <Modal isOpen={isOpen} toggle={onClose} size="xl" style={{ maxWidth: '80vw' }}>
      <ModalHeader toggle={onClose}>Chọn bàn</ModalHeader>
      <ModalBody>
        <div className="table-area-carousel d-flex align-items-center mb-3" style={{ overflowX: "auto" }}>
          {tableAreas.map((area) => {
            const isDisabled = selectedAreaIdFromTables && String(selectedAreaIdFromTables) !== String(area.id);
            return (
              <div
                key={area.id}
                className={`table-area-item py-2 me-2 rounded ${selectedArea === area.id ? "active" : ""} ${isDisabled ? "disabled-area" : ""}`}
                style={{
                  background: selectedArea === area.id ? "#556ee6" : "#f4f4f6",
                  color: selectedArea === area.id ? "#fff" : "#222",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  opacity: isDisabled ? 0.6 : 1,
                  minWidth: 120,
                  textAlign: "center",
                  fontWeight: 500,
                  border: selectedArea === area.id ? "2px solid #556ee6" : "2px solid transparent",
                  transition: "all 0.2s",
                }}
                onClick={isDisabled ? null : () => onAreaSelect(area.id)}
              >
                {area.name}
              </div>
            );
          })}
        </div>
        <div className="table-modal-list-by-status">
          {loadingTables ? (
            <div className="text-center w-100 py-4">
              <Spinner color="primary" />
            </div>
          ) : tableList.length === 0 ? (
            <div className="text-muted text-center w-100">
              Không có bàn nào trong khu vực này.
            </div>
          ) : (
            statusList.map(statusObj => {
              const tables = tableList.filter(t => t.status === statusObj.key);
              return (
                <div className="table-status-row mb-3" key={statusObj.key}>
                  <div className="table-status-label mb-1" style={{ fontWeight: 600 }}>{statusObj.label}</div>
                  <div className="table-status-cards-row d-flex flex-row flex-nowrap align-items-center" style={{ gap: 12, overflowX: 'auto', minHeight: 48 }}>
                    {tables.length === 0 ? (
                      <span className="text-muted" style={{fontSize: '0.97rem'}}>Không có bàn</span>
                    ) : (
                      tables.map(table => {
                        const isSelected = selectedTables.some((t) => String(t.id) === String(table.id));
                        return (
                          <div
                            key={table.id}
                            className={`table-card-wrapper ${isSelected ? "selected" : ""} ${table.status !== 'available' ? "disabled-table" : ""}`}
                            onClick={() => onTableToggle(String(table.id))}
                            style={{ margin: 4, flex: '0 0 auto', cursor: table.status !== 'available' ? 'not-allowed' : 'pointer', opacity: table.status !== 'available' ? 0.6 : 1 }}
                          >
                            <CardTable
                              tableId={table.id}
                              tableNumber={table.table_number}
                              seatCount={
                                table.table_type === '2_seats' ? 2 :
                                table.table_type === '4_seats' ? 4 :
                                table.table_type === '8_seats' ? 8 :
                                table.capacity || 4
                              }
                              status={table.status}
                              hideMenu={true}
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={onClose}>
          Xác nhận
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TableSelectModal; 