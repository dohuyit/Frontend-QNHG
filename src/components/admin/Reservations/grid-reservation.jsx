import React, { useState } from "react";
import {
    Card,
    CardBody,
    Pagination,
    PaginationItem,
    PaginationLink,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Form,
    FormGroup,
    Label,
    Input,
    Row,
    Col,
    Button,
    Alert,
    Spinner,
} from "reactstrap";
import { toast } from "react-toastify";
import CardReservation from "./card-reservation";
import {
    deleteReservation,
    updateReservation,
} from "@services/admin/reservationService";
import "./grid-reservation.css";

const ReservationGrid = ({
    paginate = {},
    data = [],
    onDelete,
    onPageChange,
    onUpdate,
    tableAreas = [],
}) => {
    const [showDelete, setShowDelete] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showView, setShowView] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [apiErrors, setApiErrors] = useState({});

    const currentPage = paginate.page || 1;
    const totalPages = paginate.totalPage || 1;

    const handleDelete = async () => {
        try {
            await deleteReservation(selectedItem.id);
            toast.success("Đã xóa đơn đặt bàn thành công");
            if (onDelete) onDelete(selectedItem.id);
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Không thể xóa đơn đặt bàn");
        }
        setShowDelete(false);
        setSelectedItem(null);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            // Tìm reservation hiện tại trong data
            const reservation = data.find(item => item.id === id);
            if (!reservation) {
                toast.error("Không tìm thấy đơn đặt bàn");
                return;
            }
            // Xử lý lại các trường cho đúng backend (giống handleEdit)
            let timeValue = reservation.reservation_time || reservation.booking_time || '';
            // Nếu có định dạng 12h thì convert sang 24h
            if (typeof timeValue === 'string' && (timeValue.includes('CH') || timeValue.includes('SA'))) {
                const time12h = timeValue.replace(' CH', '').replace(' SA', '');
                const [hours, minutes] = time12h.split(':');
                let hours24 = parseInt(hours);
                if (timeValue.includes('CH') && hours24 !== 12) {
                    hours24 += 12;
                } else if (timeValue.includes('SA') && hours24 === 12) {
                    hours24 = 0;
                }
                timeValue = `${hours24.toString().padStart(2, '0')}:${minutes}`;
            }
            // Kết hợp ngày và giờ
            const combinedDateTime = `${reservation.reservation_date || reservation.booking_date || ''} ${timeValue}:00`;
            // Tạo payload đúng chuẩn backend
            const payload = {
                customer_id: reservation.customer_id || 1,
                customer_name: reservation.customer_name,
                customer_phone: reservation.customer_phone || reservation.phone_number,
                customer_email: reservation.customer_email || reservation.email,
                reservation_time: combinedDateTime,
                number_of_guests: reservation.number_of_guests,
                table_id: reservation.table_area_id || reservation.table_id || null,
                notes: reservation.notes || reservation.special_requests || '',
                status: newStatus,
                user_id: reservation.user_id || 2,
            };
            await updateReservation(id, payload);
            toast.success("Đã cập nhật trạng thái thành công");
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái");
        }
    };

    const handleEdit = async () => {
        setLoadingEdit(true);
        setApiErrors({});
        try {
            // Convert 12h format to 24h format if needed
            let timeValue = editForm.reservation_time;
            if (timeValue.includes('CH') || timeValue.includes('SA')) {
                // Convert 12h to 24h format
                const time12h = timeValue.replace(' CH', '').replace(' SA', '');
                const [hours, minutes] = time12h.split(':');
                let hours24 = parseInt(hours);

                if (timeValue.includes('CH') && hours24 !== 12) {
                    hours24 += 12;
                } else if (timeValue.includes('SA') && hours24 === 12) {
                    hours24 = 0;
                }

                timeValue = `${hours24.toString().padStart(2, '0')}:${minutes}`;
            }

            // Combine date and time into datetime format
            const combinedDateTime = `${editForm.reservation_date} ${timeValue}:00`;

            const payload = {
                customer_id: selectedItem.customer_id || 1, // Add customer_id
                customer_name: editForm.customer_name,
                customer_phone: editForm.customer_phone,
                customer_email: editForm.customer_email,
                reservation_time: combinedDateTime,
                number_of_guests: editForm.number_of_guests,
                table_id: editForm.table_area_id || null,
                notes: editForm.notes,
                status: editForm.status,
                user_id: selectedItem.user_id || 2, // Add user_id if available
            };

            await updateReservation(selectedItem.id, payload);
            toast.success("Đã cập nhật đơn đặt bàn thành công");
            if (onUpdate) onUpdate();
            setShowEdit(false);
            setSelectedItem(null);
            setEditForm({});
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            if (error.response && error.response.data && error.response.data.errors) {
                const errors = error.response.data.errors;
                const formattedErrors = {};
                for (const key in errors) {
                    formattedErrors[key] = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
                }
                setApiErrors(formattedErrors);
                toast.error("Có lỗi xảy ra trong quá trình cập nhật. Vui lòng kiểm tra lại thông tin.");
            } else {
                toast.error(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
            }
        } finally {
            setLoadingEdit(false);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && onPageChange) {
            onPageChange(page);
        }
    };

    const extractTime = (timeStr) => {
        if (!timeStr) return "";
        // Nếu là ISO string
        if (timeStr.includes("T")) {
            const d = new Date(timeStr);
            return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
        }
        // Nếu là dạng "YYYY-MM-DD HH:mm:ss"
        const match = timeStr.match(/(\d{2}):(\d{2})/);
        if (match) return `${match[1]}:${match[2]}`;
        // Nếu chỉ là "HH:mm" hoặc "HH:mm:ss"
        if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) return timeStr.slice(0, 5);
        return "";
    };

    const openEditModal = (item) => {
        setSelectedItem(item);
        setApiErrors({});
        setEditForm({
            customer_name: item.customer_name || "",
            customer_phone: item.customer_phone || item.phone_number || "",
            customer_email: item.customer_email || item.email || "",
            reservation_date: item.reservation_date || item.booking_date || "",
            reservation_time: extractTime(item.reservation_time || item.booking_time || ""),
            number_of_guests: item.number_of_guests || "",
            table_area_id: item.table_area_id || item.table_id || "",
            notes: item.notes || item.special_requests || "",
            status: item.status || "pending",
        });
        setShowEdit(true);
    };

    const openViewModal = (item) => {
        setSelectedItem(item);
        setShowView(true);
    };

    const handleCardDelete = (item) => {
        setSelectedItem(item);
        setShowDelete(true);
    };

    const getFieldError = (fieldName) => {
        return apiErrors[fieldName] ? (
            <div className="text-danger mt-1" style={{ fontSize: 12 }}>
                {apiErrors[fieldName]}
            </div>
        ) : null;
    };

    return (
        <>
            {/* Grid Layout */}
            <div className="reservation-grid">
                {data.length === 0 ? (
                    <Alert color="info" className="text-center">
                        Không có đơn đặt bàn nào
                    </Alert>
                ) : (
                    <Row className="g-4">
                        {data.map((reservation) => (
                            <Col key={reservation.id} xs={12} sm={6} md={4} lg={3} xl={3}>
                                <CardReservation
                                    reservation={reservation}
                                    onEdit={openEditModal}
                                    onView={openViewModal}
                                    onDelete={handleCardDelete}
                                    onStatusChange={handleStatusChange}
                                />
                            </Col>
                        ))}
                    </Row>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Card className="mt-4">
                    <CardBody className="d-flex justify-content-center">
                        <Pagination aria-label="pagination">
                            <PaginationItem disabled={currentPage === 1}>
                                <PaginationLink first onClick={() => handlePageChange(1)} />
                            </PaginationItem>
                            <PaginationItem disabled={currentPage === 1}>
                                <PaginationLink
                                    previous
                                    onClick={() => handlePageChange(currentPage - 1)}
                                />
                            </PaginationItem>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <PaginationItem active={currentPage === i + 1} key={i}>
                                    <PaginationLink onClick={() => handlePageChange(i + 1)}>
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem disabled={currentPage === totalPages}>
                                <PaginationLink
                                    next
                                    onClick={() => handlePageChange(currentPage + 1)}
                                />
                            </PaginationItem>
                            <PaginationItem disabled={currentPage === totalPages}>
                                <PaginationLink
                                    last
                                    onClick={() => handlePageChange(totalPages)}
                                />
                            </PaginationItem>
                        </Pagination>
                    </CardBody>
                </Card>
            )}

            {/* Modal Xóa */}
            <Modal isOpen={showDelete} toggle={() => setShowDelete(false)}>
                <ModalHeader toggle={() => setShowDelete(false)}>
                    Xác nhận xóa
                </ModalHeader>
                <ModalBody>
                    Bạn có chắc chắn muốn xóa đơn đặt bàn của{" "}
                    <strong>{selectedItem?.customer_name}</strong> không?
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowDelete(false)}>
                        Hủy
                    </Button>
                    <Button color="danger" onClick={handleDelete}>
                        Xóa
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Modal Chỉnh sửa */}
            <Modal isOpen={showEdit} toggle={() => setShowEdit(false)} size="lg">
                <ModalHeader toggle={() => setShowEdit(false)}>
                    Chỉnh sửa đơn đặt bàn
                </ModalHeader>
                <ModalBody>
                    {selectedItem && (
                        <Form>
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="customer_name">Tên khách hàng</Label>
                                        <Input
                                            id="customer_name"
                                            value={editForm.customer_name || selectedItem.customer_name || ''}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    customer_name: e.target.value,
                                                })
                                            }
                                        />
                                        {getFieldError('customer_name')}
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="customer_phone">Số điện thoại</Label>
                                        <Input
                                            id="customer_phone"
                                            value={editForm.customer_phone || selectedItem.customer_phone || selectedItem.phone_number || ''}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, customer_phone: e.target.value })
                                            }
                                        />
                                        {getFieldError('customer_phone')}
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="customer_email">Email</Label>
                                        <Input
                                            id="customer_email"
                                            type="email"
                                            value={editForm.customer_email || selectedItem.customer_email || selectedItem.email || ''}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, customer_email: e.target.value })
                                            }
                                        />
                                        {getFieldError('customer_email')}
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="number_of_guests">Số khách</Label>
                                        <Input
                                            id="number_of_guests"
                                            type="number"
                                            value={editForm.number_of_guests || selectedItem.number_of_guests || ''}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    number_of_guests: e.target.value,
                                                })
                                            }
                                        />
                                        {getFieldError('number_of_guests')}
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="reservation_date">Ngày đặt</Label>
                                        <Input
                                            id="reservation_date"
                                            type="date"
                                            value={
                                                editForm.reservation_date
                                                    ? editForm.reservation_date
                                                    : (
                                                        selectedItem.reservation_date
                                                        || selectedItem.booking_date
                                                        || (selectedItem.reservation_time ? selectedItem.reservation_time.slice(0, 10) : '')
                                                        || ''
                                                    ).slice(0, 10)
                                            }
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, reservation_date: e.target.value })
                                            }
                                        />
                                        {getFieldError('reservation_date')}
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="reservation_time">Giờ đặt</Label>
                                        <Input
                                            id="reservation_time"
                                            type="time"
                                            value={
                                                editForm.reservation_time
                                                    ? editForm.reservation_time
                                                    : (() => {
                                                        // Lấy giờ từ reservation_date (hoặc reservation_time nếu có)
                                                        let dateStr = selectedItem.reservation_date || selectedItem.booking_date || '';
                                                        // Nếu reservation_date có định dạng "YYYY-MM-DD HH:mm:ss"
                                                        if (dateStr && dateStr.includes(' ')) {
                                                            const parts = dateStr.split(' ');
                                                            if (parts[1]) {
                                                                // Lấy phần giờ và phút
                                                                const timeMatch = parts[1].match(/(\d{2}):(\d{2})/);
                                                                if (timeMatch) {
                                                                    return `${timeMatch[1]}:${timeMatch[2]}`;
                                                                }
                                                            }
                                                        }
                                                        // Nếu reservation_time có, lấy giờ từ đó
                                                        let timeStr = selectedItem.reservation_time || '';
                                                        if (timeStr) {
                                                            // Nếu là ISO string
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
                                                        }
                                                        return '';
                                                    })()
                                            }
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, reservation_time: e.target.value })
                                            }
                                        />
                                        {getFieldError('reservation_time')}
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="table_area_id">Khu vực bàn</Label>
                                        <Input
                                            id="table_area_id"
                                            type="select"
                                            value={editForm.table_area_id || selectedItem.table_area_id || ''}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, table_area_id: e.target.value })
                                            }
                                        >
                                            <option value="">Chọn khu vực bàn</option>
                                            {tableAreas && tableAreas.map((area) => (
                                                <option key={area.id} value={area.id}>
                                                    {area.name}
                                                </option>
                                            ))}
                                        </Input>
                                        {getFieldError('table_area_id')}
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="statuses">Trạng thái</Label>
                                        {(() => {
                                            const currentStatus = editForm.status || selectedItem.status || 'pending';
                                            let options = [];
                                            // Nếu đã hủy thì chỉ cho chọn "Đã hủy"
                                            if (currentStatus === "cancelled") {
                                                options = [
                                                    { value: "cancelled", label: "Đã hủy" }
                                                ];
                                            }
                                            // Nếu đang chờ xác nhận thì chỉ cho chọn "Chờ xác nhận", "Đã xác nhận", "Đã hủy"
                                            else if (currentStatus === "pending") {
                                                options = [
                                                    { value: "pending", label: "Chờ xác nhận" },
                                                    { value: "confirmed", label: "Đã xác nhận" },
                                                    { value: "cancelled", label: "Đã hủy" }
                                                ];
                                            }
                                            // Nếu đã xác nhận thì cho chọn "Đã xác nhận", "Hoàn thành", "Đã hủy", "Không đến", "Đã ngồi"
                                            else if (currentStatus === "confirmed") {
                                                options = [
                                                    { value: "confirmed", label: "Đã xác nhận" },
                                                    { value: "completed", label: "Hoàn thành" },
                                                    { value: "cancelled", label: "Đã hủy" },
                                                    { value: "no_show", label: "Không đến" },
                                                    { value: "seated", label: "Đã ngồi" }
                                                ];
                                            }
                                            // Nếu đã ngồi thì chỉ cho chọn "Đã ngồi", "Hoàn thành"
                                            else if (currentStatus === "seated") {
                                                options = [
                                                    { value: "seated", label: "Đã ngồi" },
                                                    { value: "completed", label: "Hoàn thành" }
                                                ];
                                            }
                                            // Nếu hoàn thành, không đến thì chỉ cho giữ nguyên trạng thái
                                            else if (currentStatus === "completed" || currentStatus === "no_show") {
                                                options = [
                                                    { value: currentStatus, label: currentStatus === "completed" ? "Hoàn thành" : "Không đến" }
                                                ];
                                            }
                                            // fallback: cho tất cả
                                            else {
                                                options = [
                                                    { value: "pending", label: "Chờ xác nhận" },
                                                    { value: "confirmed", label: "Đã xác nhận" },
                                                    { value: "cancelled", label: "Đã hủy" },
                                                    { value: "completed", label: "Hoàn thành" },
                                                    { value: "no_show", label: "Không đến" },
                                                    { value: "seated", label: "Đã ngồi" }
                                                ];
                                            }
                                            // Nếu trạng thái là cancelled, completed, no_show thì disable select
                                            const isDisabled = ["cancelled", "completed", "no_show"].includes(currentStatus);
                                            return (
                                                <>
                                                    <Input
                                                        id="statuses"
                                                        type="select"
                                                        value={currentStatus}
                                                        onChange={(e) =>
                                                            setEditForm({ ...editForm, status: e.target.value })
                                                        }
                                                        disabled={isDisabled}
                                                    >
                                                        {options.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </Input>
                                                    {currentStatus === "cancelled" && (
                                                        <div className="text-danger mt-1" style={{ fontSize: 13 }}>
                                                            Đơn đặt bàn đã bị hủy, không thể thay đổi trạng thái khác.
                                                        </div>
                                                    )}
                                                    {currentStatus === "completed" && (
                                                        <div className="text-info mt-1" style={{ fontSize: 13 }}>
                                                            Đơn đặt bàn đã hoàn thành, không thể thay đổi trạng thái khác.
                                                        </div>
                                                    )}
                                                    {currentStatus === "no_show" && (
                                                        <div className="text-warning mt-1" style={{ fontSize: 13 }}>
                                                            Đơn đặt bàn đã chuyển sang trạng thái "Không đến", không thể thay đổi trạng thái khác.
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                        {getFieldError('status')}
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={12}>
                                    <FormGroup>
                                        <Label for="notes">Ghi chú</Label>
                                        <Input
                                            id="notes"
                                            type="textarea"
                                            style={{ minHeight: 120, height: 150, fontSize: 16, padding: "16px", resize: "vertical" }}
                                            value={editForm.notes || selectedItem.notes || selectedItem.special_requests || ''}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, notes: e.target.value })
                                            }
                                        />
                                        {getFieldError('notes')}
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowEdit(false)}>
                        Hủy
                    </Button>
                    <Button color="primary" onClick={handleEdit} disabled={loadingEdit}>
                        {loadingEdit ? <Spinner size="sm" /> : "Cập nhật"}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Modal Xem chi tiết */}
            <Modal isOpen={showView} toggle={() => setShowView(false)} size="lg" centered>
                <ModalHeader toggle={() => setShowView(false)} className="border-0 pb-0">
                    <span className="fw-bold fs-4">Reservation Details</span>
                </ModalHeader>
                <ModalBody className="pt-0">
                    {selectedItem && (
                        <div className="reservation-detail-modal">
                            {/* Header */}
                            <div className="d-flex align-items-center mb-3">
                                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: 48, height: 48, fontSize: 24, fontWeight: 600 }}>
                                    {selectedItem.customer_name?.charAt(0)?.toUpperCase() || "A"}
                                </div>
                                <div className="flex-grow-1">
                                    <div className="fw-bold fs-5 mb-1">{selectedItem.customer_name}</div>
                                    <div className="text-muted" style={{ fontSize: 14 }}>
                                        Đơn đặt bàn #{selectedItem.id || "N/A"}
                                    </div>
                                </div>
                                <div>
                                    {(() => {
                                        const statusMap = {
                                            pending: { color: "warning", text: "Chờ xác nhận" },
                                            confirmed: { color: "success", text: "Đã xác nhận" },
                                            cancelled: { color: "danger", text: "Đã hủy" },
                                            completed: { color: "info", text: "Hoàn thành" },
                                            no_show: { color: "secondary", text: "Không đến" },
                                            seated: { color: "primary", text: "Đã ngồi" },
                                        };
                                        const config = statusMap[selectedItem.status] || { color: "secondary", text: "Không xác định" };
                                        return <span className={`badge bg-${config.color} px-3 py-2`} style={{ fontSize: 14 }}>{config.text}</span>;
                                    })()}
                                </div>
                            </div>

                            {/* Reservation Details */}
                            <div className="mb-4">
                                <div className="fw-semibold mb-2" style={{ fontSize: 16 }}>Reservation Details</div>
                                <Row className="gy-2">
                                    <Col md={4} xs={12} className="d-flex align-items-center">
                                        <span className="me-2 text-primary"><i className="mdi mdi-calendar"></i></span>
                                        <span>
                                            <div className="text-muted" style={{ fontSize: 13 }}>Date</div>
                                            <div className="fw-bold">{selectedItem.booking_date || selectedItem.reservation_date}</div>
                                        </span>
                                    </Col>
                                    <Col md={4} xs={12} className="d-flex align-items-center">
                                        <span className="me-2 text-primary"><i className="mdi mdi-clock-outline"></i></span>
                                        <span>
                                            <div className="text-muted" style={{ fontSize: 13 }}>Time</div>
                                            <div className="fw-bold">{selectedItem.booking_time || selectedItem.reservation_time}</div>
                                        </span>
                                    </Col>
                                    <Col md={4} xs={12} className="d-flex align-items-center">
                                        <span className="me-2 text-primary"><i className="mdi mdi-account-group-outline"></i></span>
                                        <span>
                                            <div className="text-muted" style={{ fontSize: 13 }}>Party Size</div>
                                            <div className="fw-bold">{selectedItem.number_of_guests} guests</div>
                                        </span>
                                    </Col>
                                </Row>
                                {selectedItem.notes || selectedItem.special_requests ? (
                                    <div className="mt-3 d-flex align-items-center">
                                        <span className="me-2 text-primary"><i className="mdi mdi-note-text-outline"></i></span>
                                        <span>
                                            <div className="text-muted" style={{ fontSize: 13 }}>Note</div>
                                            <div>{selectedItem.notes || selectedItem.special_requests}</div>
                                        </span>
                                    </div>
                                ) : null}
                            </div>

                            {/* Customer Information */}
                            <div className="mb-4">
                                <div className="fw-semibold mb-2 text-primary" style={{ fontSize: 16 }}>Customer Information</div>
                                <Row>
                                    <Col md={6} xs={12} className="d-flex align-items-center mb-2">
                                        <span className="me-2 text-secondary"><i className="mdi mdi-phone"></i></span>
                                        <span>
                                            <div className="text-muted" style={{ fontSize: 13 }}>Phone</div>
                                            <div className="fw-bold">{selectedItem.customer_phone || selectedItem.phone_number}</div>
                                        </span>
                                    </Col>
                                    <Col md={6} xs={12} className="d-flex align-items-center mb-2">
                                        <span className="me-2 text-secondary"><i className="mdi mdi-email-outline"></i></span>
                                        <span>
                                            <div className="text-muted" style={{ fontSize: 13 }}>Email</div>
                                            <div className="fw-bold">{selectedItem.customer_email || selectedItem.email}</div>
                                        </span>
                                    </Col>
                                </Row>
                            </div>

                            {/* System Information */}
                            <div className="mb-2">
                                <div className="fw-semibold mb-2 text-dark" style={{ fontSize: 16 }}>System Information</div>
                                <Row>
                                    <Col md={6} xs={12}>
                                        <div className="text-muted" style={{ fontSize: 13 }}>Created</div>
                                        <div>{selectedItem.created_at}</div>
                                    </Col>
                                    <Col md={6} xs={12}>
                                        <div className="text-muted" style={{ fontSize: 13 }}>Last Updated</div>
                                        <div>{selectedItem.updated_at || selectedItem.created_at}</div>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter className="border-0 pt-0">
                    <Button color="secondary" onClick={() => setShowView(false)}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default ReservationGrid; 