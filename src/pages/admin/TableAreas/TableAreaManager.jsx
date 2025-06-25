import React, { useEffect, useState } from "react";
import {
    Card, CardBody, CardHeader, Row, Col, Button, Input, Form, FormGroup, Label, Modal, ModalHeader, ModalBody, ModalFooter, Spinner
} from "reactstrap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
    getListTableArea,
    getTableAreaDetail,
    createTableArea,
    updateTableArea,
    deleteTableArea
} from "@services/admin/reservationService";
import { FaPlus, FaEdit, FaTrash, FaTable } from "react-icons/fa";

const colorList = [
    "#ffb300", "#42a5f5", "#66bb6a", "#ab47bc", "#ef5350", "#26c6da", "#ffa726", "#8d6e63"
];

const TableAreaManager = () => {
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add"); // "add" | "edit"
    const [form, setForm] = useState({ name: "", description: "", capacity: "", status: "active" });
    const [selectedId, setSelectedId] = useState(null);
    const [saving, setSaving] = useState(false);

    // Fetch list
    const fetchAreas = async () => {
        setLoading(true);
        try {
            const res = await getListTableArea();
            // Đảm bảo lấy đúng cấu trúc trả về
            // Nếu trả về res.data.data.items thì lấy như vậy, nếu không thì log ra để sửa
            let items = [];
            if (res.data.data && res.data.data.items) {
                items = res.data.data.items;
            } else if (res.data.items) {
                items = res.data.items;
            } else if (Array.isArray(res.data.data)) {
                items = res.data.data;
            } else {
                items = [];
            }
            setAreas(items);
        } catch {
            toast.error("Không thể tải danh sách khu vực bàn!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAreas();
    }, []);

    // Open modal add
    const openAddModal = () => {
        setForm({ name: "", description: "", capacity: "", status: "active" });
        setModalType("add");
        setShowModal(true);
        setSelectedId(null);
    };

    // Open modal edit
    const openEditModal = async (id) => {
        setModalType("edit");
        setSelectedId(id);
        setShowModal(true);
        setSaving(true);
        try {
            const res = await getTableAreaDetail(id);
            const data = res.data.data;
            setForm({
                name: data.name || "",
                description: data.description || "",
                capacity: data.capacity || "",
                status: data.status || "active"
            });
        } catch {
            toast.error("Không thể tải chi tiết khu vực!");
            setShowModal(false);
        } finally {
            setSaving(false);
        }
    };

    // Handle add/edit submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (modalType === "add") {
                await createTableArea(form);
                toast.success("Đã thêm khu vực bàn!");
            } else {
                await updateTableArea(selectedId, form);
                toast.success("Đã cập nhật khu vực bàn!");
            }
            setShowModal(false);
            fetchAreas();
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi thao tác!");
        } finally {
            setSaving(false);
        }
    };

    // Handle delete
    const handleDelete = (id) => {
        Swal.fire({
            title: "Xác nhận xóa?",
            text: "Bạn có chắc chắn muốn xóa khu vực này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteTableArea(id);
                    toast.success("Đã xóa khu vực bàn!");
                    fetchAreas();
                } catch (err) {
                    toast.error(err.response?.data?.message || "Xóa thất bại!");
                }
            }
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { color: "success", text: "Hoạt động" },
            inactive: { color: "danger", text: "Không hoạt động" },
        };
        const config = statusConfig[status] || { color: "secondary", text: "Không xác định" };
        return <span className={`badge bg-${config.color}`}>{config.text}</span>;
    };

    return (
        <div className="page-content">
            <Card className="mb-4 border-0 shadow-sm">
                <CardHeader className="bg-gradient-primary text-white d-flex justify-content-between align-items-center" style={{ background: "linear-gradient(90deg,#42a5f5,#ab47bc)" }}>
                    <span style={{ fontSize: 22, fontWeight: 600 }}><FaTable className="me-2" />Quản lý khu vực bàn</span>
                    <Button color="success" onClick={openAddModal}>
                        <FaPlus className="me-1" /> Thêm khu vực
                    </Button>
                </CardHeader>
                <CardBody>
                    {loading ? (
                        <div className="text-center my-5"><Spinner color="primary" /></div>
                    ) : (
                        <Row className="g-4">
                            {areas.length === 0 ? (
                                <Col xs={12} className="text-center text-muted">Chưa có khu vực nào</Col>
                            ) : (
                                areas.map((area, idx) => (
                                    <Col key={area.id} xs={12} sm={6} md={4} lg={3} xl={3}>
                                        <Card className="h-100 shadow border-0" style={{ background: colorList[idx % colorList.length] + "22" }}>
                                            <CardBody className="d-flex flex-column justify-content-between">
                                                <div>
                                                    <div className="d-flex align-items-center mb-2">
                                                        <FaTable size={22} style={{ color: colorList[idx % colorList.length] }} className="me-2" />
                                                        <span style={{ fontWeight: 700, fontSize: 18, color: colorList[idx % colorList.length] }}>{area.name}</span>
                                                    </div>
                                                    <div style={{ color: "#555", fontSize: 15, minHeight: 40 }}>{area.description || <span className="text-muted">(Không mô tả)</span>}</div>
                                                    <div className="mt-2">
                                                        <span className="me-2"><b>Sức chứa:</b> {area.capacity || 0} người</span>
                                                        {getStatusBadge(area.status)}
                                                    </div>
                                                </div>
                                                <div className="d-flex gap-2 mt-3">
                                                    <Button color="primary" size="sm" onClick={() => openEditModal(area.id)}>
                                                        <FaEdit /> Sửa
                                                    </Button>
                                                    <Button color="danger" size="sm" onClick={() => handleDelete(area.id)}>
                                                        <FaTrash /> Xóa
                                                    </Button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                ))
                            )}
                        </Row>
                    )}
                </CardBody>
            </Card>

            {/* Modal Thêm/Sửa */}
            <Modal isOpen={showModal} toggle={() => setShowModal(false)}>
                <ModalHeader toggle={() => setShowModal(false)}>
                    {modalType === "add" ? "Thêm khu vực bàn" : "Cập nhật khu vực bàn"}
                </ModalHeader>
                <Form onSubmit={handleSubmit}>
                    <ModalBody>
                        <FormGroup>
                            <Label for="areaName">Tên khu vực <span className="text-danger">*</span></Label>
                            <Input
                                id="areaName"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                                maxLength={100}
                                placeholder="Nhập tên khu vực..."
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="areaDesc">Mô tả</Label>
                            <Input
                                id="areaDesc"
                                type="textarea"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                maxLength={255}
                                placeholder="Nhập mô tả (tùy chọn)"
                            />
                        </FormGroup>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="areaCapacity">Sức chứa *</Label>
                                    <Input
                                        id="areaCapacity"
                                        type="number"
                                        value={form.capacity}
                                        onChange={e => setForm({ ...form, capacity: e.target.value })}
                                        required
                                        min={1}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="areaStatus">Trạng thái</Label>
                                    <Input
                                        id="areaStatus"
                                        type="select"
                                        value={form.status}
                                        onChange={e => setForm({ ...form, status: e.target.value })}
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
                        <Button color="primary" type="submit" disabled={saving}>
                            {saving ? <Spinner size="sm" /> : (modalType === "add" ? "Thêm" : "Cập nhật")}
                        </Button>
                    </ModalFooter>
                </Form>
            </Modal>
        </div>
    );
};

export default TableAreaManager; 