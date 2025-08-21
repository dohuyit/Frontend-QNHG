import React, { useEffect, useState } from "react";

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
            <div><b>Mã đơn:</b> #{order.id} - <b>Bàn:</b> {Array.isArray(order.table_numbers) && order.table_numbers.length > 0 ? order.table_numbers.join(', ') : 'Chưa có bàn'}</div>
            <div><b>Khách:</b> {order.customer || "Khách lẻ"}</div>
            <div><b>Thời gian nhận:</b> {order.received_at}</div>
            <div>
                <b>Thời gian còn lại:</b>{' '}
                {(() => {
                    // Tính tổng thời gian chế biến (phút)
                    const totalCookingTime = Array.isArray(order.items)
                        ? order.items.reduce((sum, item) => {
                            if (typeof item.cooking_time === 'number' && item.cooking_time > 0 && typeof item.quantity === 'number' && item.quantity > 0) {
                                return sum + (item.cooking_time * item.quantity);
                            }
                            return sum;
                        }, 0)
                        : 0;
                    if (order.received_at && totalCookingTime > 0) {
                        console.log('[DEBUG] CountdownCookingTime props:', { receivedAt: order.received_at, cookingTime: totalCookingTime });
                        return <>
                            <CountdownCookingTime receivedAt={new Date(new Date(order.received_at).getTime() + 7 * 60 * 60 * 1000).toISOString()} cookingTime={totalCookingTime} />
                            <span style={{marginLeft: 8, color: 'gray', fontSize: 12}}>[Debug: {order.received_at} | Tổng phút: {totalCookingTime}]</span>
                        </>;
                    }
                    return <span style={{marginLeft: 8, color: 'gray', fontStyle: 'italic'}}>Không thiết lập thời gian</span>;
                })()}
            </div>
            <div>
                <b>Món:</b>
                <ul>
                    {order.items?.map((item, idx) => {
                        console.log('KitchenOrder item:', item, 'cooking_time:', item.cooking_time);
                        return (
                            <li key={idx}>
                                {item.item_name} x{item.quantity} {item.notes && <span>({item.notes})</span>}
                                {item.received_at && (typeof item.cooking_time === 'number' && item.cooking_time >= 0) ? (
                                    <CountdownCookingTime receivedAt={item.received_at} cookingTime={item.cooking_time} />
                                ) : (
                                    <span style={{marginLeft: 8, color: 'gray', fontStyle: 'italic'}}>Không thiết lập thời gian</span>
                                )}
                            </li>
                        )
                    })}
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

function CountdownCookingTime({ receivedAt, cookingTime }) {
    const [remaining, setRemaining] = useState(0);

    useEffect(() => {
        function calcRemaining() {
            if (!receivedAt || !cookingTime) return 0;
            const start = new Date(receivedAt).getTime();
            const now = new Date().getTime();
            const totalMs = cookingTime * 60 * 1000;
            const remainMs = start + totalMs - now;
            return Math.max(0, Math.floor(remainMs / 1000));
        }
        setRemaining(calcRemaining());
        const timer = setInterval(() => {
            setRemaining(calcRemaining());
        }, 1000);
        return () => clearInterval(timer);
    }, [receivedAt, cookingTime]);

    if (!cookingTime || !receivedAt) return null;
    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;
    return (
        <span style={{marginLeft: 8, color: remaining === 0 ? 'red' : 'green', fontWeight: 500}}>
            [Còn lại: {min}:{sec.toString().padStart(2, '0')} phút]
        </span>
    );
}

export default KitchenOrderCard; 