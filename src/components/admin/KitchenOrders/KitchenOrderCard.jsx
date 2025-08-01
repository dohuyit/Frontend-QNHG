import React from "react";

const STATUS_FLOW = {
    pending: "preparing",
    preparing: "ready",
    ready: null,
    cancelled: null,
};

const KitchenOrderCard = ({ order, onChangeStatus, onCancel, status }) => {
    const nextStatus = STATUS_FLOW[status];
    return (
        <div className="kitchen-order-card">
            <div><b>Mã đơn:</b> #{order.id} - <b>Bàn:</b> {order.table_number || "-"}</div>
            <div><b>Khách:</b> {order.customer || "Khách lẻ"}</div>
            <div><b>Thời gian nhận:</b> {order.received_at}</div>
            <div>
                <b>Món:</b>
                <ul>
                    {order.items?.map((item, idx) => (
                        <li key={idx}>{item.item_name} x{item.quantity} {item.notes && <span>({item.notes})</span>}</li>
                    ))}
                </ul>
            </div>
            {nextStatus && (
                <button onClick={() => onChangeStatus(order.id, nextStatus)} className="btn btn-primary btn-sm">Chuyển trạng thái</button>
            )}
            {!["preparing", "ready", "cancelled"].includes(status) && (
                <button onClick={() => onCancel(order.id)} className="btn btn-danger btn-sm ml-2">Hủy đơn</button>
            )}
        </div>
    );
};

export default KitchenOrderCard; 