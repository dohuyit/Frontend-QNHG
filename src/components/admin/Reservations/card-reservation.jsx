import React from "react";
import {
    Card,
    CardBody,
    Button,
    Row,
    Col,
    Input,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from "reactstrap";
import { MdModeEdit, MdVisibility, MdMoreVert, MdTableRestaurant } from "react-icons/md";
import { FaTrash, FaCheck, FaTimes, FaUsers, FaCalendarAlt, FaClock, FaStickyNote, FaChair } from "react-icons/fa";
import Badge from "../ui/Badge";
import TableSelectModal from "../Orders/TableSelectModal";
import { getTables } from "@services/admin/tableService";
import { getTableAreas } from "@services/admin/tableAreaService";

const ReservationCard = ({
    reservation,
    onEdit,
    onView,
    onTimeChange,
    onStatusChangeLocal,
}) => {
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const toggleDropdown = () => setDropdownOpen((prev) => !prev);

    // State cho modal chọn bàn
    const [showTableModal, setShowTableModal] = React.useState(false);
    const [tableAreas, setTableAreas] = React.useState([]);
    const [selectedArea, setSelectedArea] = React.useState(null);
    const [tableList, setTableList] = React.useState([]);
    const [loadingTables, setLoadingTables] = React.useState(false);
    const [selectedTables, setSelectedTables] = React.useState([]);
    const [selectedAreaIdFromTables, setSelectedAreaIdFromTables] = React.useState(null);

    // Hàm mở modal chọn bàn
    const handleOpenTableModal = async () => {
        setShowTableModal(true);
        setLoadingTables(true);
        try {
            const res = await getTableAreas();
            const areas = (res.data?.data?.items || []).filter((area) => area.status === "active");
            setTableAreas(areas);
            setSelectedArea(areas[0]?.id || null);
        } catch {
            setTableAreas([]);
        } finally {
            setLoadingTables(false);
        }
    };

    // Lấy danh sách bàn khi chọn khu vực
    React.useEffect(() => {
        if (showTableModal && selectedArea) {
            setLoadingTables(true);
            getTables({ table_area_id: selectedArea })
                .then((res) => {
                    setTableList(res.data?.data?.items || []);
                })
                .catch(() => {
                    setTableList([]);
                })
                .finally(() => setLoadingTables(false));
        }
    }, [showTableModal, selectedArea]);

    // Hàm chọn bàn
    const handleTableToggle = (tableId) => {
        const clickedTable = tableList.find((t) => String(t.id) === String(tableId));
        if (!clickedTable || clickedTable.status !== 'available') return;
        setSelectedTables((prev) => {
            const existingIndex = prev.findIndex((t) => String(t.id) === String(tableId));
            if (prev.length > 0 && String(prev[0].table_area_id) !== String(clickedTable.table_area_id)) {
                return [clickedTable];
            }
            if (existingIndex !== -1) {
                const updatedTables = prev.filter((t) => String(t.id) !== String(tableId));
                if (updatedTables.length === 0) setSelectedAreaIdFromTables(null);
                return updatedTables;
            } else {
                setSelectedAreaIdFromTables(String(clickedTable.table_area_id));
                return [...prev, clickedTable];
            }
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { type: "warning", text: "Chờ xác nhận" }, // vàng
            confirmed: { type: "primary", text: "Đã xác nhận" }, // xanh dương
            completed: { type: "success", text: "Hoàn thành" }, // xanh lá
            cancelled: { type: "danger", text: "Đã hủy" }, // đỏ
        };
        const config = statusConfig[status] || {
            type: "secondary",
            text: "Không xác định",
        };
        return <Badge type={config.type} className="mb-2">{config.text}</Badge>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <Card className="h-100 reservation-card shadow-sm">
            <CardBody className="d-flex flex-column">
                {/* Header với tên khách và trạng thái trên cùng một hàng */}
                <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 className="mb-0 fw-bold text-dark">
                            {reservation.customer_name || "Khách"}
                        </h6>
                        {getStatusBadge(reservation.status)}
                    </div>
                    <div className="d-flex align-items-center">
                        <small className="text-muted fs-6">
                            {reservation.customer_phone || reservation.phone_number || "Không có SĐT"}
                        </small>
                    </div>
                </div>

                {/* Thông tin chi tiết */}
                <div className="flex-grow-1">
                    <Row className="mb-3">
                        {/* Ngày đặt */}
                        <Col md={6} className="mb-3">
                            <div className="d-flex align-items-center mb-2">
                                <FaCalendarAlt className="text-muted me-2" size={14} />
                                <small className="text-muted">Ngày đặt:</small>
                            </div>
                            <div className="ms-4">
                                <strong>
                                    {formatDate(reservation.reservation_date || reservation.booking_date)}
                                </strong>
                            </div>
                        </Col>
                        {/* Giờ đặt */}
                        <Col md={6} className="mb-3">
                            <div className="d-flex align-items-center mb-2">
                                <FaClock className="text-muted me-2" size={14} />
                                <small className="text-muted">Giờ đặt:</small>
                            </div>
                            <div className="ms-4">
                                {reservation.status === "pending" && onTimeChange ? (
                                    <input
                                        type="time"
                                        value={(() => {
                                            let timeStr = reservation.reservation_time;
                                            if (!timeStr) return "";
                                            if (timeStr.includes("T")) {
                                                const d = new Date(timeStr);
                                                return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
                                            }
                                            const match = timeStr.match(/(\d{2}):(\d{2})/);
                                            if (match) return `${match[1]}:${match[2]}`;
                                            if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) return timeStr.slice(0, 5);
                                            return "";
                                        })()}
                                        onChange={e => onTimeChange(reservation.id, e.target.value)}
                                        style={{ fontSize: 16, padding: "2px 8px" }}
                                    />
                                ) : (
                                    <strong>
                                        {(() => {
                                            if (!reservation.reservation_time) return "N/A";
                                            let timeStr = reservation.reservation_time;
                                            if (timeStr.includes("T")) {
                                                const d = new Date(timeStr);
                                                return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
                                            }
                                            const match = timeStr.match(/(\d{2}):(\d{2})/);
                                            if (match) {
                                                return `${match[1]}:${match[2]}`;
                                            }
                                            if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
                                                return timeStr.slice(0, 5);
                                            }
                                            return timeStr;
                                        })()}
                                    </strong>
                                )}
                            </div>
                        </Col>
                        {/* Số khách */}
                        <Col md={6} className="mb-3">
                            <div className="d-flex align-items-center mb-2">
                                <FaUsers className="text-muted me-2" size={14} />
                                <small className="text-muted">Số khách:</small>
                            </div>
                            <div className="ms-4">
                                <strong>{reservation.number_of_guests || "N/A"} người</strong>
                            </div>
                        </Col>
                        {/* Số bàn */}
                        <Col md={6} className="mb-3">
                            <div className="d-flex align-items-center mb-2">
                                <FaChair className="text-muted me-2" size={16} />
                                <small className="text-muted">Số bàn:</small>
                            </div>
                            <div className="ms-4">
                                <strong>{reservation.table_number || reservation.table_id || "Không có"}</strong>
                            </div>
                        </Col>
                    </Row>
                    {/* Ghi chú */}
                    <Row>
                        <Col md={12} className="mb-3">
                            <div className="d-flex align-items-center mb-2">
                                <FaStickyNote className="me-2" style={{ color: "#ffb300" }} size={16} />
                                <small style={{ color: "#ff9800", fontWeight: 600, fontSize: 15 }}>Ghi chú :</small>
                            </div>
                            <div>
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
                        </Col>
                    </Row>
                </div>

                {/* Action buttons */}
                <div className="mt-auto">
                    <Row className="g-2 align-items-center">
                        <Col xs={10}>
                            {reservation.status === "pending" && (
                                <button
                                    className="btn btn-success w-100"
                                    onClick={() => {
                                        if (onEdit) {
                                            const reservationWithConfirmedStatus = {
                                                ...reservation,
                                                status: "confirmed",
                                                originalStatus: reservation.status
                                            };
                                            onEdit(reservationWithConfirmedStatus);
                                            if (onStatusChangeLocal) {
                                                onStatusChangeLocal(reservation.id, "confirmed");
                                            }
                                        }

                                    }}
                                    title="Xác nhận"
                                >
                                    <FaCheck size={14} />
                                    <span className="ms-1">Xác nhận</span>
                                </button>
                            )}
                        </Col>
                        <Col xs={2} className="d-flex justify-content-end">
                            <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} direction="down">
                                <DropdownToggle
                                    tag="button"
                                    className="btn btn-light border"
                                    style={{ padding: 6, borderRadius: 8 }}
                                >
                                    <MdMoreVert size={22} />
                                </DropdownToggle>
                                <DropdownMenu end>
                                    <DropdownItem onClick={() => onView && onView(reservation)}>
                                        <MdVisibility size={16} className="me-2" /> Xem chi tiết
                                    </DropdownItem>
                                    <DropdownItem onClick={() => onEdit && onEdit(reservation)}>
                                        <MdModeEdit size={16} className="me-2" /> Chỉnh sửa
                                    </DropdownItem>
                                    <DropdownItem onClick={handleOpenTableModal}>
                                        <MdTableRestaurant size={16} className="me-2" /> Chọn bàn
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </Col>
                    </Row>
                </div>
            </CardBody>
            <TableSelectModal
                isOpen={showTableModal}
                onClose={() => setShowTableModal(false)}
                tableAreas={tableAreas}
                selectedArea={selectedArea}
                onAreaSelect={setSelectedArea}
                tableList={tableList}
                selectedTables={selectedTables}
                onTableToggle={handleTableToggle}
                loadingTables={loadingTables}
                selectedAreaIdFromTables={selectedAreaIdFromTables}
            />
        </Card>
    );
};

export default ReservationCard; 