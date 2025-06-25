import React from "react";
import {
    Card,
    CardBody,
    Badge,
    Button,
    Row,
    Col,
} from "reactstrap";
import { MdModeEdit, MdVisibility } from "react-icons/md";
import { FaTrash, FaCheck, FaTimes, FaUsers, FaCalendarAlt, FaClock, FaStickyNote } from "react-icons/fa";
import { confirmReservation } from '@services/admin/reservationService';
import { toast } from 'react-toastify';

const ReservationCard = ({
    reservation,
    onEdit,
    onView,
    onDelete,
    onStatusChange,
    onTimeChange,
}) => {
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: "warning", text: "Chờ xác nhận" },
            confirmed: { color: "success", text: "Đã xác nhận" },
            cancelled: { color: "danger", text: "Đã hủy" },
            completed: { color: "info", text: "Hoàn thành" },
            no_show: { color: "secondary", text: "Không đến" },
            seated: { color: "primary", text: "Đã ngồi" },
        };
        const config = statusConfig[status] || {
            color: "secondary",
            text: "Không xác định",
        };
        return <Badge color={config.color} className="mb-2">{config.text}</Badge>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };





    return (
        <Card className="h-100 reservation-card shadow-sm">
            <CardBody className="d-flex flex-column">
                {/* Header với tên khách và mã đặt bàn */}
                <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0 text-primary fw-bold">
                            {reservation.customer_name || "Khách"}
                        </h6>
                        <small className="text-muted">
                            #{reservation.id || "N/A"}
                        </small>
                    </div>
                    {getStatusBadge(reservation.status)}
                </div>

                {/* Thông tin chi tiết */}
                <div className="flex-grow-1">
                    {/* Hàm tiện ích tách ngày và giờ từ reservation_time */}
                    {/*
                        Hàm extractDate, extractTime, formatDate, formatTime nên được đặt ở đầu file hoặc file utils.
                        Ở đây sử dụng trực tiếp cho hiển thị ngày/giờ đặt.
                    */}
                    <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                            <FaCalendarAlt className="text-muted me-2" size={14} />
                            <small className="text-muted">Ngày đặt:</small>
                        </div>
                        <div className="ms-4">
                            <strong>
                                {formatDate(reservation.reservation_time)}
                            </strong>
                        </div>
                    </div>

                    <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                            <FaClock className="text-muted me-2" size={14} />
                            <small className="text-muted">Giờ đặt:</small>
                        </div>
                        <div className="ms-4">
                            {reservation.status === "pending" && onTimeChange ? (
                                <input
                                    type="time"
                                    value={
                                        (() => {
                                            let timeStr = reservation.reservation_time;
                                            if (!timeStr) return "";
                                            if (timeStr.includes("T")) {
                                                const d = new Date(timeStr);
                                                return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
                                            }
                                            const match = timeStr.match(/(\\d{2}):(\\d{2})/);
                                            if (match) return `${match[1]}:${match[2]}`;
                                            if (/^\\d{2}:\\d{2}(:\\d{2})?$/.test(timeStr)) return timeStr.slice(0, 5);
                                            return "";
                                        })()
                                    }
                                    onChange={e => onTimeChange(reservation.id, e.target.value)}
                                    style={{ fontSize: 16, padding: "2px 8px" }}
                                />
                            ) : (
                                <strong>
                                    {
                                        // Hiển thị chỉ phần giờ và phút, không kèm ngày
                                        (() => {
                                            if (!reservation.reservation_time) return "N/A";
                                            // Nếu là dạng "2025-06-20 17:13:00" hoặc ISO string
                                            let timeStr = reservation.reservation_time;
                                            // Nếu có ký tự "T" (ISO), chuyển sang dạng "HH:mm"
                                            if (timeStr.includes("T")) {
                                                const d = new Date(timeStr);
                                                return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
                                            }
                                            // Nếu là dạng "YYYY-MM-DD HH:mm:ss"
                                            const match = timeStr.match(/(\d{2}):(\d{2})/);
                                            if (match) {
                                                return `${match[1]}:${match[2]}`;
                                            }
                                            // Nếu chỉ là "HH:mm" hoặc "HH:mm:ss"
                                            if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
                                                return timeStr.slice(0, 5);
                                            }
                                            return timeStr;
                                        })()
                                    }
                                </strong>
                            )}
                        </div>
                    </div>

                    <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                            <FaUsers className="text-muted me-2" size={14} />
                            <small className="text-muted">Số khách:</small>
                        </div>
                        <div className="ms-4">
                            <strong>{reservation.number_of_guests || "N/A"} người</strong>
                        </div>
                    </div>

                    <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                            <FaStickyNote className="me-2" style={{ color: "#ffb300" }} size={16} />
                            <small style={{ color: "#ff9800", fontWeight: 600, fontSize: 15 }}>Ghi chú :</small>
                        </div>
                        <div className="ms-4">
                            {(reservation.notes || reservation.special_requests) ? (
                                <div
                                    style={{
                                        background: "linear-gradient(90deg, #fffde4 0%, #ffe9c7 100%)",
                                        borderLeft: "5px solid #ffb300",
                                        borderRadius: 8,
                                        padding: "10px 14px",
                                        color: "#5d4037",
                                        fontSize: 16,
                                        fontWeight: 500,
                                        boxShadow: "0 2px 8px rgba(255,193,7,0.08)",
                                        minHeight: 40,
                                        whiteSpace: "pre-line"
                                    }}
                                >
                                    {reservation.notes || reservation.special_requests}
                                </div>
                            ) : (
                                <span style={{ color: "#bdbdbd", fontStyle: "italic" }}>Không có ghi chú</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action buttons - chỉ hiển thị nếu có props */}
                {(onView || onEdit || onDelete || onStatusChange) && (
                    <div className="mt-auto">
                        <Row className="g-2">
                            {onView && (
                                <Col xs={6}>
                                    <Button
                                        color="info"
                                        size="sm"
                                        className="w-100"
                                        onClick={() => onView(reservation)}
                                        title="Xem chi tiết"
                                    >
                                        <MdVisibility size={16} />
                                        <span className="ms-1 d-none d-sm-inline">Xem</span>
                                    </Button>
                                </Col>
                            )}
                            {onEdit && (
                                <Col xs={6}>
                                    <Button
                                        color="primary"
                                        size="sm"
                                        className="w-100"
                                        onClick={() => onEdit(reservation)}
                                        title="Chỉnh sửa"
                                    >
                                        <MdModeEdit size={16} />
                                        <span className="ms-1 d-none d-sm-inline">Sửa</span>
                                    </Button>
                                </Col>
                            )}
                        </Row>

                        {reservation.status === "pending" && onStatusChange && onDelete && (
                            <Row className="g-2 mt-2">
                                <Col xs={6}>
                                    <Button
                                        color="success"
                                        size="sm"
                                        className="w-100"
                                        onClick={async () => {
                                            try {
                                                await confirmReservation(reservation.id);
                                                toast.success("Đã xác nhận đơn đặt bàn!");
                                                if (onStatusChange) onStatusChange(reservation.id, "confirmed");
                                            } catch {
                                                toast.error("Xác nhận thất bại!");
                                            }
                                        }}
                                        title="Xác nhận"
                                    >
                                        <FaCheck size={14} />
                                        <span className="ms-1 d-none d-sm-inline">Xác nhận</span>
                                    </Button>
                                </Col>
                                <Col xs={6}>
                                    <Button
                                        color="danger"
                                        size="sm"
                                        className="w-100"
                                        onClick={() => onDelete(reservation)}
                                        title="Xóa"
                                    >
                                        <FaTrash size={14} />
                                        <span className="ms-1 d-none d-sm-inline">Xóa</span>
                                    </Button>
                                </Col>
                            </Row>
                        )}
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default ReservationCard; 