import React, { useState } from "react";
import { Card, CardBody, Row, Col, Badge, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { FaStar, FaEye, FaTrash, FaEdit, FaPlus, FaPowerOff, FaEllipsisV } from "react-icons/fa";

const fullUrl = "http://localhost:8000/storage/";

const ComboCardGrid = ({ data = [], onDetail, onEdit, onDelete, onAddDish, onToggleStatus }) => {
   
    return (
        <Row className="g-4">
            {data.length === 0 ? (
                <Col xs={12} className="text-center text-muted">
                    Không có combo nào
                </Col>
            ) : (
                data.map((combo) => <ComboCard key={combo.id} combo={combo} onDetail={onDetail} onEdit={onEdit} onDelete={onDelete} onAddDish={onAddDish} onToggleStatus={onToggleStatus} />)
            )}
        </Row>
    );
};

const ComboCard = ({ combo, onDetail, onEdit, onDelete, onAddDish  }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    return (
        <Col xs={12} sm={6} md={4} lg={3} xl={3}>
            <Card className="h-10 shadow-sm position-relative">
                <div style={{ position: "relative", background: "#f8f9fa" }}>
                    {/* Ảnh combo */}
                    <div style={{ width: "100%", height: 150, background: combo.image_url ? undefined : "#eee", display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb", borderTopLeftRadius: 8, borderTopRightRadius: 8, overflow: "hidden" }}>
                        {combo.image_url ? (
                            <img
                                src={`${fullUrl}${combo.image_url}`}
                                alt={combo.name}
                                style={{ width: "100%", height: 180, objectFit: "cover" }}
                                onError={e => { e.target.onerror = null; e.target.src = ""; }}
                            />
                        ) : (
                            <span style={{ fontSize: 32 }}>No Image</span>
                        )}
                    </div>
                    {/* Badge trạng thái */}
                    <Badge
                        color={Number(combo.is_active) === 1 ? "success" : "secondary"}
                        className="d-flex align-items-center"
                        style={{ position: "absolute", top: 12, left: 12, fontSize: 14, borderRadius: 20, padding: "6px 16px", fontWeight: 500, boxShadow: "0 2px 8px #0001" }}
                    >
                        <i className="mdi mdi-check-circle-outline me-1" style={{ fontSize: 12 }}></i>
                        {Number(combo.is_active) === 1 ? "Đang áp dụng" : "Ngừng áp dụng"}
                    </Badge>
                    {/* Badge giảm giá giả lập */}
                    {combo.discount_percent && (
                        <Badge color="warning" style={{ position: "absolute", top: 12, right: 12, fontSize: 14, borderRadius: 16, padding: "6px 14px", fontWeight: 500 }}>
                            -{combo.discount_percent}%
                        </Badge>
                    )}
                </div>
                <CardBody className="d-flex flex-column pt-3 pb-2 px-3">
                    {/* Đánh giá giả lập */}
                    <div className="mb-2 d-flex align-items-center gap-2">
                        <Badge color="dark" pill style={{ fontSize: 13, background: "#222", display: "flex", alignItems: "center" }}>
                            <FaStar style={{ color: "#ffc107", marginRight: 4 }} />
                            {combo.rating || 4.5}
                        </Badge>
                    </div>
                    <h5 className="fw-bold mb-1 text-truncate" style={{ minHeight: 28 }}>{combo.name}</h5>
                    <div className="mb-2 text-truncate" style={{ color: "#666", minHeight: 38, fontSize: 15 }}>
                        {combo.description || "Không có mô tả"}
                    </div>
                    {/* Giá */}
                    <div className="mb-2">
                        {combo.original_total_price && (
                            <span style={{ textDecoration: "line-through", color: "#888", marginRight: 8, fontSize: 13 }}>
                                {Number(combo.original_total_price).toLocaleString()} đ
                            </span>
                        )}
                        <span style={{ color: "#28a745", fontWeight: 700, fontSize: 15 }}>
                            {combo.selling_price ? `${Number(combo.selling_price).toLocaleString()} đ` : "N/A"}
                        </span>
                    </div>
                    {/* Độ phổ biến, số đơn, ngày tạo */}
                    <div className="mb-2 d-flex align-items-center gap-3" style={{ fontSize: 15, color: "#888" }}>
                        <span><i className="mdi mdi-cart-outline"></i> {combo.orders_count || 0} đơn</span>
                        <span><i className="mdi mdi-calendar"></i> {combo.created_at ? new Date(combo.created_at).toLocaleDateString('vi-VN') : ""}</span>
                    </div>
                    {/* Nút chi tiết và menu thao tác */}
                    <div className="mt-auto">
                        <div className="d-flex align-items-center justify-content-between gap-2">
                            <Button
                                color="dark"
                                outline
                                onClick={() => onDetail && onDetail(combo.id)}
                            >
                                <FaEye /> Chi tiết
                            </Button>
                            <Dropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)} direction="down">
                                <DropdownToggle
                                    tag="button"
                                    className="btn btn-light   "
                                    style={{ borderRadius: "50%", width: 36, height: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}
                                    onClick={e => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
                                >
                                    &#8230;
                                </DropdownToggle>
                                <DropdownMenu end style={{ minWidth: 180 }}>
                                    <div className="px-3 py-2 fw-bold text-dark">Thao tác</div>
                                    <DropdownItem onClick={() => onEdit && onEdit(combo.id)}><FaEdit className="me-2" />Chỉnh sửa</DropdownItem>
                                    <DropdownItem onClick={() => {
                                        if (onAddDish) {
                                            onAddDish(combo.id);
                                        }
                                    }}>
                                        <FaPlus className="me-2" />Thêm món ăn
                                    </DropdownItem>
                                
                                    <DropdownItem onClick={() => onDelete && onDelete(combo.id)} className="text-danger"><FaTrash className="me-2" />Xóa tạm thời</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Col>
    );
};

export default ComboCardGrid; 