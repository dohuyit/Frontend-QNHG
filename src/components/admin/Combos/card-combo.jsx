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
import { FaTrash, FaCheck, FaTimes, FaListUl, FaMoneyBill, FaStickyNote } from "react-icons/fa";

const ComboCard = ({
    combo,
    onEdit,
    onView,
    onDelete,
}) => {
    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { color: "success", text: "Đang bán" },
            inactive: { color: "secondary", text: "Ngừng bán" },
        };
        const config = statusConfig[status] || {
            color: "secondary",
            text: "Không xác định",
        };
        return <Badge color={config.color} className="mb-2">{config.text}</Badge>;
    };

    return (
        <Card className="h-100 combo-card shadow-sm">
            <CardBody className="d-flex flex-column">
                {/* Header với tên combo và mã combo */}
                <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0 text-primary fw-bold">
                            {combo.name || "Combo"}
                        </h6>
                        <small className="text-muted">
                            #{combo.id || "N/A"}
                        </small>
                    </div>
                    {getStatusBadge(combo.status)}
                </div>

                {/* Thông tin chi tiết combo */}
                <div className="flex-grow-1">
                    <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                            <FaMoneyBill className="text-muted me-2" size={14} />
                            <small className="text-muted">Giá:</small>
                        </div>
                        <div className="ms-4">
                            <strong>{combo.price?.toLocaleString() || 0} đ</strong>
                        </div>
                    </div>
                    <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                            <FaListUl className="text-muted me-2" size={14} />
                            <small className="text-muted">Danh sách món:</small>
                        </div>
                        <div className="ms-4">
                            {combo.items && combo.items.length > 0 ? (
                                <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
                                    {combo.items.map(item => (
                                        <li key={item.id}>{item.name} {item.quantity ? `x${item.quantity}` : ''}</li>
                                    ))}
                                </ul>
                            ) : (
                                <span style={{ color: "#bdbdbd", fontStyle: "italic" }}>Chưa có món</span>
                            )}
                        </div>
                    </div>
                    <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                            <FaStickyNote className="me-2" style={{ color: "#ffb300" }} size={16} />
                            <small style={{ color: "#ff9800", fontWeight: 600, fontSize: 15 }}>Mô tả :</small>
                        </div>
                        <div className="ms-4">
                            {combo.description ? (
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
                                    {combo.description}
                                </div>
                            ) : (
                                <span style={{ color: "#bdbdbd", fontStyle: "italic" }}>Không có mô tả</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                {(onView || onEdit || onDelete) && (
                    <div className="mt-auto">
                        <Row className="g-2">
                            {onView && (
                                <Col xs={6}>
                                    <Button
                                        color="info"
                                        size="sm"
                                        className="w-100"
                                        onClick={() => onView(combo)}
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
                                        onClick={() => onEdit(combo)}
                                        title="Chỉnh sửa"
                                    >
                                        <MdModeEdit size={16} />
                                        <span className="ms-1 d-none d-sm-inline">Sửa</span>
                                    </Button>
                                </Col>
                            )}
                            {onDelete && (
                                <Col xs={12}>
                                    <Button
                                        color="danger"
                                        size="sm"
                                        className="w-100"
                                        onClick={() => onDelete(combo)}
                                        title="Xóa"
                                    >
                                        <FaTrash size={16} />
                                        <span className="ms-1 d-none d-sm-inline">Xóa</span>
                                    </Button>
                                </Col>
                            )}
                        </Row>
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default ComboCard; 