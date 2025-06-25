import React, { useState, useEffect } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    ButtonGroup,
    Button,
    Row,
    Col,
    Input,
    Offcanvas,
    OffcanvasHeader,
    OffcanvasBody,
    Form,
    FormGroup,
    Label,
    Badge,
    Spinner,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
} from "reactstrap";
import { MdSearch, MdFilterList, MdDelete, MdRestore } from "react-icons/md";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import GridReservation from "@components/admin/Reservations/grid-reservation";
import { 
    getReservations, 
    getTableAreas, 
    createReservation,
    getTrashedReservations,
    restoreReservation,
    forceDeleteReservation
} from "@services/admin/reservationService";
import Swal from "sweetalert2";

// Danh sách trạng thái đơn đặt bàn, khi bấm vào sẽ lọc theo trạng thái đó
const bookingStatusOptions = [
    { label: "Tất cả", value: "all", badgeColor: "secondary" },
    { label: "Chờ xác nhận", value: "pending", badgeColor: "warning" },
    { label: "Đã xác nhận", value: "confirmed", badgeColor: "success" },
    { label: "Hoàn thành", value: "completed", badgeColor: "info" },
    { label: "Đã hủy", value: "cancelled", badgeColor: "danger" },
    { label: "Không đến", value: "no_show", badgeColor: "secondary" },
    { label: "Đã ngồi", value: "seated", badgeColor: "primary" },
];

// Component hiển thị các nút trạng thái để lọc
const BookingStatusFilter = ({ currentStatus, onChange }) => (
    <div className="mb-3 d-flex flex-wrap gap-2">
        {bookingStatusOptions.map((option) => (
            <Button
                key={option.value}
                color={currentStatus === option.value ? option.badgeColor : "light"}
                outline={currentStatus !== option.value}
                onClick={() => onChange(option.value)}
                size="sm"
            >
                {option.label}
            </Button>
        ))}
    </div>
);

const TableBookingIndex = () => {
    const [bookingData, setBookingData] = useState({ items: [], meta: {} });
    const [trashedData, setTrashedData] = useState({ items: [], meta: {} });
    const [areaData, setAreaData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("1");
    const [view, setView] = useState("list");
    const [showFilter, setShowFilter] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [createForm, setCreateForm] = useState({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        booking_date: "",
        booking_time: "",
        number_of_guests: "",
        table_id: "",
        notes: "",
        special_requests: ""
    });

    // Lọc dữ liệu theo search và filter
    const filteredData = bookingData.items.filter((reservation) => {
        const matchesSearch = reservation.customer_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
            reservation.customer_phone?.includes(searchTerm) ||
            reservation.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "all" || reservation.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const fetchReservations = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getReservations({ page });
            console.log("API SUCCESS:", res.data);
            setBookingData({
                items: res.data.data.items,
                meta: res.data.data.meta,
            });
        } catch (error) {
            console.error("API ERROR:", error);
            Swal.fire({
                title: "Lỗi!",
                text: "Không thể tải danh sách đơn đặt bàn",
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchTrashedReservations = async (page = 1) => {
        try {
            const res = await getTrashedReservations({ page });
            console.log("TRASHED API SUCCESS:", res.data);
            setTrashedData({
                items: res.data.data.items,
                meta: res.data.data.meta,
            });
        } catch (error) {
            console.error("TRASHED API ERROR:", error);
            Swal.fire({
                title: "Lỗi!",
                text: "Không thể tải danh sách đơn đặt bàn đã xóa",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    const fetchTableAreas = async () => {
        try {
            const res = await getTableAreas();
            setAreaData(res.data.data.items || []);
        } catch (error) {
            console.error("API ERROR:", error);
        }
    };

    useEffect(() => {
        fetchReservations();
        fetchTableAreas();
    }, []);

    useEffect(() => {
        if (activeTab === "2") {
            fetchTrashedReservations();
        }
    }, [activeTab]);

    const handleDelete = async (id) => {
        try {
            setBookingData((prev) => ({
                ...prev,
                items: prev.items.filter((booking) => booking.id !== id),
            }));
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const handleRestore = async (id) => {
        try {
            await restoreReservation(id);
            Swal.fire({
                title: "Thành công!",
                text: "Đã khôi phục đơn đặt bàn thành công",
                icon: "success",
                confirmButtonText: "OK",
            });
            fetchTrashedReservations();
            fetchReservations(); // Refresh main list
        } catch (error) {
            console.error("Restore failed:", error);
            Swal.fire({
                title: "Lỗi!",
                text: "Không thể khôi phục đơn đặt bàn",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    const handleForceDelete = async (id) => {
        const result = await Swal.fire({
            title: "Xác nhận xóa vĩnh viễn",
            text: "Bạn có chắc chắn muốn xóa vĩnh viễn đơn đặt bàn này? Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa vĩnh viễn",
            cancelButtonText: "Hủy"
        });

        if (result.isConfirmed) {
            try {
                await forceDeleteReservation(id);
                Swal.fire({
                    title: "Thành công!",
                    text: "Đã xóa vĩnh viễn đơn đặt bàn",
                    icon: "success",
                    confirmButtonText: "OK",
                });
                fetchTrashedReservations();
            } catch (error) {
                console.error("Force delete failed:", error);
                Swal.fire({
                    title: "Lỗi!",
                    text: "Không thể xóa vĩnh viễn đơn đặt bàn",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        }
    };

    const handleCreate = async () => {
        try {
            if (!createForm.customer_name || !createForm.customer_phone) {
                Swal.fire({
                    title: "Lỗi!",
                    text: "Vui lòng điền đầy đủ thông tin bắt buộc (tên và số điện thoại)",
                    icon: "error",
                    confirmButtonText: "OK",
                });
                return;
            }
            // Kiểm tra chọn bàn
            if (!createForm.table_id || createForm.table_id === "" || Number(createForm.table_id) === 0) {
                Swal.fire({
                    title: "Lỗi!",
                    text: "Vui lòng chọn khu vực bàn.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
                return;
            }
            // Kiểm tra ngày giờ
            if (!createForm.booking_date || !createForm.booking_time) {
                Swal.fire({
                    title: "Lỗi!",
                    text: "Vui lòng chọn ngày và giờ đặt.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
                return;
            }
            const payload = {
                customer_id: 1,
                user_id: 2,
                customer_name: createForm.customer_name,
                customer_phone: createForm.customer_phone,
                customer_email: createForm.customer_email,
                reservation_time: `${createForm.booking_date} ${createForm.booking_time}:00`,
                number_of_guests: Number(createForm.number_of_guests),
                table_id: Number(createForm.table_id),
                notes: createForm.notes,
                special_requests: createForm.special_requests,
                status: "pending"
            };
            await createReservation(payload);
            Swal.fire({
                title: "Thành công!",
                text: "Đã tạo đơn đặt bàn thành công",
                icon: "success",
                confirmButtonText: "OK",
            });
            setShowCreate(false);
            setCreateForm({
                customer_name: "",
                customer_phone: "",
                customer_email: "",
                booking_date: "",
                booking_time: "",
                number_of_guests: "",
                table_id: "",
                notes: "",
                special_requests: ""
            });
            fetchReservations();
        } catch (error) {
            console.error("Error creating reservation:", error);
            Swal.fire({
                title: "Lỗi!",
                text: error.response?.data?.message || error.message || "Không thể tạo đơn đặt bàn",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    const handleUpdate = () => {
        fetchReservations();
    };

    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    return (
        <div className="page-content">
            <Breadcrumbs
                title="Danh sách đơn đặt bàn"
                breadcrumbItem="Quản lí đơn đặt bàn"
            />

            {/* Tabs */}
            <Card className="mb-4">
                <CardHeader className="bg-white border-bottom-0">
                    <Nav tabs>
                        <NavItem>
                            <NavLink
                                className={activeTab === "1" ? "active" : ""}
                                onClick={() => toggleTab("1")}
                            >
                                Đơn đặt bàn ({bookingData.items.length})
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={activeTab === "2" ? "active" : ""}
                                onClick={() => toggleTab("2")}
                            >
                                Thùng rác ({trashedData.items.length})
                            </NavLink>
                        </NavItem>
                    </Nav>
                </CardHeader>
            </Card>

            <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                    {/* Bộ lọc trạng thái và view switch */}
                    <Card className="mb-4">
                        <CardHeader className="bg-white border-bottom-0">
                            <Row className="align-items-center">
                                <Col
                                    md="7"
                                    sm="12"
                                    className="mb-2 mb-md-0 d-flex align-items-center"
                                >
                                    <div style={{ display: "flex" }}>
                                        {bookingStatusOptions.map((opt) => (
                                            <button
                                                key={opt.value}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    padding: "8px 24px",
                                                    fontWeight: 400,
                                                    color: "#333",
                                                    borderBottom: statusFilter === opt.value ? `3px solid #${opt.badgeColor}` : "3px solid transparent",
                                                    fontSize: 16,
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                                onClick={() => setStatusFilter(opt.value)}
                                            >
                                                {opt.label}
                                                <Badge
                                                    color={opt.badgeColor}
                                                    pill
                                                    className="ms-2"
                                                    style={{ fontSize: 13, minWidth: 28 }}
                                                >
                                                    {filteredData.filter(item =>
                                                        opt.value === "all" ? true : item.status === opt.value
                                                    ).length}
                                                </Badge>
                                            </button>
                                        ))}
                                    </div>
                                </Col>

                                <Col
                                    md="5"
                                    sm="12"
                                    className="d-flex justify-content-md-end justify-content-start align-items-center gap-2"
                                >
                                    <Button
                                        color="success"
                                        onClick={() => setShowCreate(true)}
                                        className="me-2"
                                    >
                                        <i className="mdi mdi-plus me-1"></i>
                                        Tạo đơn đặt bàn
                                    </Button>
                                    <ButtonGroup>
                                        
                                        <Button
                                            color={view === "grid" ? "primary" : "light"}
                                            onClick={() => setView("grid")}
                                            title="Dạng card"
                                        >
                                            <i className="mdi mdi-view-grid-outline"></i>
                                        </Button>
                                    </ButtonGroup>
                                </Col>
                            </Row>
                        </CardHeader>
                    </Card>

                    {/* Khối tìm kiếm và lọc nâng cao */}
                    <Card className="mb-4">
                        <CardBody>
                            <Row className="align-items-center">
                                <Col md={4}>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <MdSearch />
                                        </span>
                                        <Input
                                            type="text"
                                            placeholder="Tìm kiếm theo tên, SĐT, email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <MdFilterList />
                                        </span>
                                        <Input
                                            type="select"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="all">Tất cả trạng thái</option>
                                            <option value="pending">Chờ xác nhận</option>
                                            <option value="confirmed">Đã xác nhận</option>
                                            <option value="completed">Hoàn thành</option>
                                            <option value="cancelled">Đã hủy</option>
                                            <option value="no_show">Không đến</option>
                                            <option value="seated">Đã ngồi</option>
                                        </Input>
                                    </div>
                                </Col>
                                <Col md={5} className="d-flex justify-content-md-end justify-content-start">
                                    <Button
                                        color="light"
                                        className="border"
                                        style={{ minWidth: 140 }}
                                        onClick={() => setShowFilter(true)}
                                    >
                                        <i className="mdi mdi-filter-variant me-1"></i> Lọc nâng cao
                                    </Button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>

                    {/* Danh sách hoặc lưới đơn đặt bàn */}
                    {loading ? (
                        <div className="text-center my-5">
                            <Spinner color="primary" />
                        </div>
                    ) : (
                        <GridReservation
                            data={filteredData}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                        />
                    )}
                </TabPane>

                <TabPane tabId="2">
                    {/* Thùng rác */}
                    <Card className="mb-4">
                        <CardHeader className="bg-white border-bottom-0">
                            <Row className="align-items-center">
                                <Col>
                                    <h5 className="mb-0 text-danger">
                                        <MdDelete className="me-2" />
                                        Thùng rác - Đơn đặt bàn đã xóa
                                    </h5>
                                </Col>
                            </Row>
                        </CardHeader>
                    </Card>

                    {trashedData.items.length === 0 ? (
                        <Card>
                            <CardBody className="text-center py-5">
                                <MdDelete size={48} className="text-muted mb-3" />
                                <h5 className="text-muted">Thùng rác trống</h5>
                                <p className="text-muted">Không có đơn đặt bàn nào đã bị xóa</p>
                            </CardBody>
                        </Card>
                    ) : (
                        <Card>
                            <CardBody>
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Tên khách hàng</th>
                                                <th>Số điện thoại</th>
                                                <th>Ngày đặt</th>
                                                <th>Số khách</th>
                                                <th>Ngày xóa</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trashedData.items.map((item) => (
                                                <tr key={item.id}>
                                                    <td>#{item.id}</td>
                                                    <td>{item.customer_name}</td>
                                                    <td>{item.customer_phone || item.phone_number}</td>
                                                    <td>{item.reservation_date ? new Date(item.reservation_date).toLocaleDateString('vi-VN') : ''}</td>
                                                    <td>{item.number_of_guests} người</td>
                                                    <td>{new Date(item.deleted_at).toLocaleDateString('vi-VN')}</td>
                                                    <td>
                                                        <ButtonGroup size="sm">
                                                            <Button
                                                                color="success"
                                                                onClick={() => handleRestore(item.id)}
                                                                title="Khôi phục"
                                                            >
                                                                <MdRestore size={16} />
                                                            </Button>
                                                            <Button
                                                                color="danger"
                                                                onClick={() => handleForceDelete(item.id)}
                                                                title="Xóa vĩnh viễn"
                                                            >
                                                                <MdDelete size={16} />
                                                            </Button>
                                                        </ButtonGroup>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </TabPane>
            </TabContent>

            {/* Offcanvas bộ lọc */}
            <Offcanvas
                direction="end"
                isOpen={showFilter}
                toggle={() => setShowFilter(false)}
            >
                <OffcanvasHeader toggle={() => setShowFilter(false)}>
                    Bộ lọc nâng cao
                </OffcanvasHeader>
                <OffcanvasBody>
                    <Form>
                        <FormGroup>
                            <Label for="filterCustomerName">Tên khách hàng</Label>
                            <Input
                                id="filterCustomerName"
                                placeholder="Nhập tên khách hàng..."
                                disabled
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="filterPhone">Số điện thoại</Label>
                            <Input
                                id="filterPhone"
                                placeholder="Nhập số điện thoại..."
                                disabled
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="filterDate">Ngày đặt</Label>
                            <Input
                                id="filterDate"
                                type="date"
                                disabled
                            />
                        </FormGroup>
                        <Button color="primary" className="mt-3" block disabled>
                            Áp dụng lọc
                        </Button>
                    </Form>
                </OffcanvasBody>
            </Offcanvas>

            {/* Modal Tạo đơn đặt bàn */}
            <Modal isOpen={showCreate} toggle={() => setShowCreate(false)} size="lg">
                <ModalHeader toggle={() => setShowCreate(false)}>
                    Tạo đơn đặt bàn mới
                </ModalHeader>
                <ModalBody>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="customer_name">Tên khách hàng *</Label>
                                    <Input
                                        id="customer_name"
                                        value={createForm.customer_name}
                                        onChange={e => setCreateForm({ ...createForm, customer_name: e.target.value })}
                                        required
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="customer_phone">Số điện thoại *</Label>
                                    <Input
                                        id="customer_phone"
                                        value={createForm.customer_phone}
                                        onChange={e => setCreateForm({ ...createForm, customer_phone: e.target.value })}
                                        required
                                    />
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
                                        value={createForm.customer_email}
                                        onChange={e => setCreateForm({ ...createForm, customer_email: e.target.value })}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="number_of_guests">Số khách *</Label>
                                    <Input
                                        id="number_of_guests"
                                        type="number"
                                        value={createForm.number_of_guests}
                                        onChange={e => setCreateForm({ ...createForm, number_of_guests: e.target.value })}
                                        required
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="booking_date">Ngày đặt *</Label>
                                    <Input
                                        id="booking_date"
                                        type="date"
                                        value={createForm.booking_date}
                                        onChange={e => setCreateForm({ ...createForm, booking_date: e.target.value })}
                                        required
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="booking_time">Giờ đặt *</Label>
                                    <Input
                                        id="booking_time"
                                        type="time"
                                        value={createForm.booking_time}
                                        onChange={e => setCreateForm({ ...createForm, booking_time: e.target.value })}
                                        required
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="table_id">Khu vực bàn</Label>
                                    <Input
                                        id="table_id"
                                        type="select"
                                        value={createForm.table_id}
                                        onChange={e => setCreateForm({ ...createForm, table_id: e.target.value })}
                                    >
                                        <option value="">Chọn khu vực</option>
                                        {areaData.map((area) => (
                                            <option key={area.id} value={area.id}>
                                                {area.name}
                                            </option>
                                        ))}
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                        <FormGroup>
                            <Label for="special_requests">Yêu cầu đặc biệt</Label>
                            <Input
                                id="special_requests"
                                type="textarea"
                                value={createForm.special_requests}
                                onChange={e => setCreateForm({ ...createForm, special_requests: e.target.value })}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="notes">Ghi chú</Label>
                            <Input
                                id="notes"
                                type="textarea"
                                value={createForm.notes}
                                onChange={e => setCreateForm({ ...createForm, notes: e.target.value })}
                            />
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowCreate(false)}>
                        Hủy
                    </Button>
                    <Button
                        color="primary"
                        onClick={handleCreate}
                    >
                        Tạo đơn đặt bàn
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default TableBookingIndex; 