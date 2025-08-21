import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import CountdownCookingTime from "./CountdownCookingTime";

const STATUS_LABEL = {
  pending: { text: "Chờ xử lý", color: "warning" },
  preparing: { text: "Đang chế biến", color: "info" },
  ready: { text: "Hoàn thành", color: "success" },
  cancelled: { text: "Đã hủy", color: "secondary" },
};

const KanbanCard = ({ order, index, onChangeStatus, onCancel, status }) => {
  const nextStatus =
    status === "pending"
      ? "preparing"
      : status === "preparing"
      ? "ready"
      : null;

  return (
    <Draggable draggableId={order.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          className={`kanban-card mb-3 p-3 rounded shadow-sm${
            order.is_priority ? " border-danger border-2" : ""
          }${snapshot.isDragging ? " is-dragging" : ""}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            background: order.is_priority ? "#fff5f5" : "#fff",
            borderLeft: order.is_priority
              ? "4px solid #dc3545"
              : "1px solid #dee2e6",
            ...provided.draggableProps.style,
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="fw-bold">#{order.order_code}</span>
            <div className="d-flex align-items-center gap-1">
              {order.is_priority && (
                <span className="badge bg-danger" title="Đơn ưu tiên">
                  <i className="mdi mdi-star me-1"></i>Ưu tiên
                </span>
              )}
              <span
                className={`badge bg-${
                  STATUS_LABEL[order.status]?.color || "secondary"
                }`}
              >
                {STATUS_LABEL[order.status]?.text || order.status}
              </span>
            </div>
          </div>
          <div className="mb-1">
            <b>Bàn:</b>{" "}
            {Array.isArray(order.table_numbers) &&
            order.table_numbers.length > 0
              ? order.table_numbers.join(", ")
              : order.table_number
              ? `Bàn ${order.table_number}`
              : "Chưa có bàn"}
          </div>
          <div className="mb-1">
            <b>Món:</b> {order.item_name}{" "}
            <span className="badge bg-light text-dark ms-1">
              x{order.quantity}
            </span>
          </div>
          {order.item_type === "combo" ? (
            <div className="mb-1">
              <span className="badge bg-primary">Món thuộc combo</span>
              {order.combo_name && (
                <span className="badge bg-light text-dark ms-2">
                  {order.combo_name}
                </span>
              )}
            </div>
          ) : order.item_type === "dish" ? (
            <div className="mb-1">
              <span className="badge bg-success">Món lẻ</span>
            </div>
          ) : null}

          {/* Countdown chuyển xuống dưới loại món */}
          {(() => {
            const cookingTime = typeof order.cooking_time === 'number' && order.cooking_time > 0 && typeof order.quantity === 'number' && order.quantity > 0
              ? order.cooking_time * order.quantity
              : 0;
            return (
              <div className="mb-1">
                {order.received_at && cookingTime > 0
                  ? <CountdownCookingTime receivedAt={new Date(new Date(order.received_at).getTime() + 7 * 60 * 60 * 1000).toISOString()} cookingTime={cookingTime} />
                  : <span style={{marginLeft: 8, color: 'gray', fontStyle: 'italic'}}>Không thiết lập thời gian</span>
                }
              </div>
            );
          })()}

          {order.notes && (
            <div className="mb-1 text-muted">
              <i className="mdi mdi-note-text me-1"></i>
              <i>{order.notes}</i>
            </div>
          )}
          <div className="mb-1 text-secondary" style={{ fontSize: 12 }}>
            <i className="mdi mdi-clock me-1"></i>
            {order.created_at
              ? new Date(order.created_at).toLocaleString("vi-VN")
              : "-"}
          </div>
          <div className="d-flex gap-2 mt-2">
            {nextStatus && (
              <button
                className="btn btn-sm btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeStatus(order.id, nextStatus);
                }}
              >
                <i className="mdi mdi-arrow-right me-1"></i>
                Chuyển trạng thái
              </button>
            )}
            {!["preparing", "ready", "cancelled"].includes(order.status) && (
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(order.id);
                }}
              >
                <i className="mdi mdi-close me-1"></i>
                Hủy đơn
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
