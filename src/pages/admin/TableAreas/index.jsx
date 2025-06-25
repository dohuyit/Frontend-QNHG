import React, { useState, useEffect } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Table,
    Button,
    Row,
    Col,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Form,
    FormGroup,
    Label,
    Input,
    Badge,
    Spinner,
} from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import { getTableAreas, createReservation } from "@services/admin/reservationService";
import Swal from "sweetalert2";

const TableAreaIndex = () => {
    const [areaData, setAreaData] = useState({ items: [], meta: {} });
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        capacity: "",
        status: "active",
    });
    const [loadingCreate, setLoadingCreate] = useState(false);

    const fetchTableAreas = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getTableAreas({ page });
            console.log("API SUCCESS:", res.data);
            setAreaData({
                items: res.data.data.items,
                meta: res.data.data.meta,
            });
        } catch (error) {
            console.error("API ERROR:", error);
            Swal.fire({
                title: "Lỗi!",
                text: "Không thể tải danh sách khu vực bàn",
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTableAreas();
    }, []);

    const handleCreate = async () => {
        setLoadingCreate(true);
        try {
            const payload = {
                customer_name: formData.name,
                customer_phone: formData.phone_number,
                customer_email: formData.email,
                reservation_time: formData.booking_date && formData.booking_time
                    ? `${formData.booking_date} ${formData.booking_time}`
                    : null,
                number_of_guests: Number(formData.capacity),
                table_id: formData.table_area_id ? Number(formData.table_area_id) : null,
                notes: formData.special_requests,
            };
            await createReservation(payload);
            Swal.fire({
                title: "Thành công!",
                text: "Đã tạo đơn đặt bàn thành công",
                icon: "success",
                confirmButtonText: "OK",
            });
            setShowCreate(false);
            setFormData({
                name: "",
                description: "",
                capacity: "",
                status: "active",
            });
            fetchTableAreas();
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                Swal.fire({
                    title: "Lỗi!",
                    text: "Có lỗi xảy ra khi tạo đơn. Vui lòng kiểm tra lại thông tin.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            } else {
                Swal.fire({
                    title: "Lỗi!",
                    text: error.response?.data?.message || "Không thể tạo đơn đặt bàn",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } finally {
            setLoadingCreate(false);
        }
    };

    const handleEdit = async () => {
        try {
            // Giả lập API call - thay thế bằng API thực tế
            Swal.fire({
                title: "Thành công!",
                text: "Đã cập nhật khu vực bàn thành công",
                icon: "success",
                confirmButtonText: "OK",
            });
            setShowEdit(false);
            setFormData({
                name: "",
                description: "",
                capacity: "",
                status: "active",
            });
            fetchTableAreas();
        } catch (error) { // eslint-disable-line no-unused-vars
            Swal.fire({
                title: "Lỗi!",
                text: "Không thể cập nhật khu vực bàn",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            const result = await Swal.fire({
                title: "Xác nhận xóa",
                text: "Bạn có chắc chắn muốn xóa khu vực bàn này không?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Xóa",
                cancelButtonText: "Hủy",
            });

            if (result.isConfirmed) {
                // Giả lập API call - thay thế bằng API thực tế
                Swal.fire({
                    title: "Thành công!",
                    text: "Đã xóa khu vực bàn thành công",
                    icon: "success",
                    confirmButtonText: "OK",
                });
                setAreaData((prev) => ({
                    ...prev,
                    items: prev.items.filter((area) => area.id !== id),
                }));
            }
        } catch (error) { // eslint-disable-line no-unused-vars
            Swal.fire({
                title: "Lỗi!",
                text: "Không thể xóa khu vực bàn",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    const openEditModal = (area) => {
        setFormData({
            name: area.name || "",
            description: area.description || "",
            capacity: area.capacity || "",
            status: area.status || "active",
        });
        setShowEdit(true);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { color: "success", text: "Hoạt động" },
            inactive: { color: "danger", text: "Không hoạt động" },
        };
        const config = statusConfig[status] || { color: "secondary", text: "Không xác định" };
        return <Badge color={config.color}>{config.text}</Badge>;
    };

    return (
        <div className="page-content">
            <Breadcrumbs
                title="Danh sách khu vực bàn"
                breadcrumbItem="Quản lí khu vực bàn"
            />

            <Card>
                <CardHeader className="bg-white border-bottom-0">
                    <Row className="align-items-center">
                        <Col md="6" sm="12">
                            <h4 className="mb-0">Khu vực bàn</h4>
                        </Col>
                        <Col md="6" sm="12" className="text-end">
                            <Button
                                color="success"
                                onClick={() => setShowCreate(true)}
                            >
                                <i className="mdi mdi-plus me-1"></i>
                                Thêm khu vực bàn
                            </Button>
                        </Col>
                    </Row>
                </CardHeader>
                <CardBody>
                    {loading ? (
                        <div className="text-center my-5">
                            <Spinner color="primary" />
                        </div>
                    ) : (
                        <Table bordered responsive hover className="mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: 60 }}>#</th>
                                    <th>Tên khu vực</th>
                                    <th>Mô tả</th>
                                    <th>Sức chứa</th>
                                    <th>Trạng thái</th>
                                    <th style={{ width: 150 }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {areaData.items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted">
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                ) : (
                                    areaData.items.map((area, idx) => (
                                        <tr key={area.id}>
                                            <td>{idx + 1}</td>
                                            <td>{area.name}</td>
                                            <td>{area.description || "Không có mô tả"}</td>
                                            <td>{area.capacity} người</td>
                                            <td>{getStatusBadge(area.status)}</td>
                                            <td>
                                                <div className="btn-group" role="group">
                                                    <Button
                                                        color="primary"
                                                        size="sm"
                                                        onClick={() => openEditModal(area)}
                                                        title="Chỉnh sửa"
                                                    >
                                                        <i className="mdi mdi-pencil"></i>
                                                    </Button>
                                                    <Button
                                                        color="danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(area.id)}
                                                        title="Xóa"
                                                    >
                                                        <i className="mdi mdi-delete"></i>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    )}
                </CardBody>
            </Card>

            {/* Modal Tạo khu vực bàn */}
            <Modal isOpen={showCreate} toggle={() => setShowCreate(false)}>
                <ModalHeader toggle={() => setShowCreate(false)}>
                    Thêm khu vực bàn mới
                </ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Label for="name">Tên khu vực *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="description">Mô tả</Label>
                            <Input
                                id="description"
                                type="textarea"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </FormGroup>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="capacity">Sức chứa *</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                        required
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="statuses">Trạng thái</Label>
                                    <Input
                                        id="statuses"
                                        type="select"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowCreate(false)}>
                        Hủy
                    </Button>
                    <Button
                        color="primary"
                        onClick={handleCreate}
                        disabled={loadingCreate || !formData.name || !formData.capacity}
                    >
                        {loadingCreate ? <Spinner size="sm" /> : "Thêm khu vực bàn"}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Modal Chỉnh sửa khu vực bàn */}
            <Modal isOpen={showEdit} toggle={() => setShowEdit(false)}>
                <ModalHeader toggle={() => setShowEdit(false)}>
                    Chỉnh sửa khu vực bàn
                </ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Label for="edit_name">Tên khu vực *</Label>
                            <Input
                                id="edit_name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="edit_description">Mô tả</Label>
                            <Input
                                id="edit_description"
                                type="textarea"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </FormGroup>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="edit_capacity">Sức chứa *</Label>
                                    <Input
                                        id="edit_capacity"
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                        required
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="edit_status">Trạng thái</Label>
                                    <Input
                                        id="edit_status"
                                        type="select"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowEdit(false)}>
                        Hủy
                    </Button>
                    <Button
                        color="primary"
                        onClick={handleEdit}
                        disabled={!formData.name || !formData.capacity}
                    >
                        Cập nhật
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default TableAreaIndex; 