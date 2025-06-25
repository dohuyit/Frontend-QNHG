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
import CardCombo from "./card-combo";
import {
    softDeleteCombo,
    updateCombo
} from "@services/admin/comboService";
import "./grid-combo.css";

const ComboGrid = ({
    paginate = {},
    data = [],
    onDelete,
    onPageChange,
    onUpdate,
    dishList = [],
}) => {
    const [showDelete, setShowDelete] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [apiErrors, setApiErrors] = useState({});

    const currentPage = paginate.page || 1;
    const totalPages = paginate.totalPage || 1;

    // Hàm xóa combo
    const handleDelete = async () => {
        try {
            await softDeleteCombo(selectedItem.id);
            toast.success("Đã xóa combo thành công");
            if (onDelete) onDelete(selectedItem.id);
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Không thể xóa combo");
        }
        setShowDelete(false);
        setSelectedItem(null);
    };

    // Hàm cập nhật combo
    const handleEdit = async () => {
        setLoadingEdit(true);
        setApiErrors({});
        try {
            const payload = {
                name: editForm.name,
                price: editForm.price,
                status: editForm.status,
                description: editForm.description,
                items: editForm.items, // danh sách món trong combo
            };
            await updateCombo(selectedItem.id, payload);
            toast.success("Đã cập nhật combo thành công");
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

    // Hàm mở modal chỉnh sửa
    const openEditModal = (item) => {
        setSelectedItem(item);
        setApiErrors({});
        setEditForm({
            name: item.name || "",
            price: item.price || 0,
            status: item.status || "active",
            description: item.description || "",
            items: item.items || [],
        });
        setShowEdit(true);
    };

    // Hàm xóa từ card
    const handleCardDelete = (item) => {
        setSelectedItem(item);
        setShowDelete(true);
    };

    // Hàm lấy lỗi trường
    const getFieldError = (fieldName) => {
        return apiErrors[fieldName] ? (
            <div className="text-danger mt-1" style={{ fontSize: 12 }}>
                {apiErrors[fieldName]}
            </div>
        ) : null;
    };

    // Hàm chuyển trang
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && onPageChange) {
            onPageChange(page);
        }
    };

    return (
        <>
            {/* Grid Layout */}
            <div className="combo-grid">
                {data.length === 0 ? (
                    <Alert color="info" className="text-center">
                        Không có combo nào
                    </Alert>
                ) : (
                    <Row className="g-4">
                        {data.map((combo) => (
                            <Col key={combo.id} xs={12} sm={6} md={4} lg={3} xl={3}>
                                <CardCombo
                                    combo={combo}
                                    onEdit={openEditModal}
                                    onDelete={handleCardDelete}
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
                    Bạn có chắc chắn muốn xóa combo <strong>{selectedItem?.name}</strong> không?
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
                    Chỉnh sửa combo
                </ModalHeader>
                <ModalBody>
                    {selectedItem && (
                        <Form>
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="name">Tên combo</Label>
                                        <Input
                                            id="name"
                                            value={editForm.name || ''}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    name: e.target.value,
                                                })
                                            }
                                        />
                                        {getFieldError('name')}
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="price">Giá combo</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={editForm.price || 0}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, price: e.target.value })
                                            }
                                        />
                                        {getFieldError('price')}
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={12}>
                                    <FormGroup>
                                        <Label for="description">Mô tả</Label>
                                        <Input
                                            id="description"
                                            type="textarea"
                                            value={editForm.description || ''}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, description: e.target.value })
                                            }
                                        />
                                        {getFieldError('description')}
                                    </FormGroup>
                                </Col>
                            </Row>
                            {/* Thêm phần chọn món cho combo */}
                            <Row>
                                <Col md={12}>
                                    <FormGroup>
                                        <Label for="items">Danh sách món trong combo</Label>
                                        <Input
                                            id="items"
                                            type="select"
                                            multiple
                                            value={editForm.items?.map(i => i.id) || []}
                                            onChange={(e) => {
                                                const selectedOptions = Array.from(e.target.selectedOptions).map(opt => parseInt(opt.value));
                                                const selectedDishes = dishList.filter(d => selectedOptions.includes(d.id));
                                                setEditForm({ ...editForm, items: selectedDishes });
                                            }}
                                        >
                                            {dishList.map(dish => (
                                                <option key={dish.id} value={dish.id}>{dish.name}</option>
                                            ))}
                                        </Input>
                                        {getFieldError('items')}
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
                        {loadingEdit ? <Spinner size="sm" /> : "Lưu"}
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default ComboGrid; 