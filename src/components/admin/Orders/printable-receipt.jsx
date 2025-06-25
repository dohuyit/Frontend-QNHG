import React, { useEffect } from 'react';
import './printable-receipt.css';

const PrintableReceipt = ({ order, onPrinted }) => {
    useEffect(() => {
        if (order) {
            window.print();
            if (onPrinted) {
                onPrinted();
            }
        }
    }, [order, onPrinted]);

    if (!order) {
        return null;
    }

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getPaymentMethodInfo = (status) => {
        const paymentConfig = {
            unpaid: "Chưa thanh toán",
            paid: "Tiền mặt",
            partially_paid: "Thanh toán một phần",
            refunded: "Đã hoàn tiền"
        };
        return paymentConfig[status] || status;
    };

    const customerName = order.customer?.full_name || "Khách vãng lai";
    const customerPhone = order.customer?.phone_number || "N/A";

    return (
        <div className="receipt-container">
            <div className="receipt-content">
                <div className="receipt-header">
                    <h2>HOÁ ĐƠN THANH TOÁN</h2>
                    <p className="res-name">Nhà Hàng QNHG</p>
                    <p>123 Đường ABC, Phường X, Quận Y, TP. Z</p>
                    <p>Hotline: 0123 456 789</p>
                </div>
                
                <div className="order-details">
                    <p><strong>Mã HĐ:</strong> #{order.order_code}</p>
                    <p><strong>Ngày:</strong> {new Date(order.order_time || order.created_at).toLocaleString('vi-VN')}</p>
                    {order.order_type === 'dine-in' && order.table_id && (
                        <p><strong>Bàn số:</strong> {order.table_id}</p>
                    )}
                </div>

                <div className="customer-details">
                    <p><strong>Khách hàng:</strong> {customerName}</p>
                    <p><strong>SĐT:</strong> {customerPhone}</p>
                </div>

                <div className="receipt-items">
                    <table>
                        <thead>
                            <tr>
                                <th>Tên món</th>
                                <th className="text-center">SL</th>
                                <th className="text-right">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items && order.items.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.menu_item_name}</td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-right">{formatCurrency(item.total_price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="receipt-summary">
                    <div className="summary-row">
                        <span>Tạm tính</span>
                        <span className="text-right">{formatCurrency(order.total_amount || 0)}</span>
                    </div>
                    {order.total_amount > order.final_amount && (
                        <div className="summary-row">
                            <span>Giảm giá</span>
                            <span className="text-right">-{formatCurrency((order.total_amount || 0) - (order.final_amount || 0))}</span>
                        </div>
                    )}
                    <div className="summary-row total">
                        <span><strong>TỔNG CỘNG</strong></span>
                        <span className="text-right"><strong>{formatCurrency(order.final_amount || 0)}</strong></span>
                    </div>
                    <div className="summary-row">
                        <span>Phương thức TT</span>
                        <span className="text-right">{getPaymentMethodInfo(order.payment_status)}</span>
                    </div>
                </div>

                <div className="receipt-footer">
                    <p>Cảm ơn quý khách và hẹn gặp lại!</p>
                </div>
            </div>
        </div>
    );
};

export default PrintableReceipt; 