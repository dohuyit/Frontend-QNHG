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
    Table,
    Badge,
} from "reactstrap";
import { toast } from "react-toastify";
import { MdPrint } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import OrderCard from "./card-order";
import PrintableReceipt from "./printable-receipt";
import {
    updateOrder,
    addOrderItem,
} from "@services/admin/orderService";
import "./grid-order.css";

const OrderGrid = ({
    paginate = {},
    data = [],
    onDelete,
    onPageChange,
    onUpdate,
    menuItems = [],
}) => {
    const [showDelete, setShowDelete] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showView, setShowView] = useState(false);
    const [showAddItem, setShowAddItem] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [addItemForm, setAddItemForm] = useState({});
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [loadingAddItem, setLoadingAddItem] = useState(false);
    const [apiErrors, setApiErrors] = useState({});
    const [printableOrder, setPrintableOrder] = useState(null);

    const currentPage = paginate.page || 1;
    const totalPages = paginate.totalPage || 1;

    const handleDelete = async () => {
        try {
            // Implement delete order logic
            toast.success("Đã xóa đơn hàng thành công");
            if (onDelete) onDelete(selectedItem.id);
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Không thể xóa đơn hàng");
        }
        setShowDelete(false);
        setSelectedItem(null);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const payload = {
                status: newStatus,
            };

            await updateOrder(id, payload);
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
            const payload = {
                order_type: editForm.order_type,
                payment_status: editForm.payment_status,
                notes: editForm.notes,
                status: editForm.status,
                table_id: editForm.table_id || null,
                delivery_address: editForm.delivery_address,
                delivery_contact_name: editForm.delivery_contact_name,
                delivery_contact_phone: editForm.delivery_contact_phone,
            };

            await updateOrder(selectedItem.id, payload);
            toast.success("Đã cập nhật đơn hàng thành công");
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

    const handleAddItem = async () => {
        setLoadingAddItem(true);
        setApiErrors({});
        try {
            const payload = {
                menu_item_id: addItemForm.menu_item_id,
                quantity: Number(addItemForm.quantity),
                special_instructions: addItemForm.special_instructions,
            };

            await addOrderItem(selectedItem.id, payload);
            toast.success("Đã thêm món ăn vào đơn hàng");
            if (onUpdate) onUpdate();
            setShowAddItem(false);
            setAddItemForm({});
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Không thể thêm món ăn");
        } finally {
            setLoadingAddItem(false);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && onPageChange) {
            onPageChange(page);
        }
    };

    const handlePrint = (order) => {
        setPrintableOrder(order);
    };

    const openEditModal = (item) => {
        setSelectedItem(item);
        setApiErrors({});
        setEditForm({
            order_type: item.order_type || "dine-in",
            payment_status: item.payment_status || "unpaid",
            notes: item.notes || "",
            status: item.status || "pending_confirmation",
            table_id: item.table_id || "",
            delivery_address: item.delivery_address || "",
            delivery_contact_name: item.delivery_contact_name || "",
            delivery_contact_phone: item.delivery_contact_phone || "",
        });
        setShowEdit(true);
    };

    const openViewModal = (item) => {
        setSelectedItem(item);
        setShowView(true);
    };

    // const openAddItemModal = (item) => {
    //     setSelectedItem(item);
    //     setAddItemForm({
    //         menu_item_id: "",
    //         quantity: 1,
    //         special_instructions: "",
    //     });
    //     setShowAddItem(true);
    // };

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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusInfo = (status) => {
        const statusConfig = {
            pending_confirmation: { color: "success", text: "Completed" }, // Example: Mapping to 'Completed' as in image
            confirmed: { color: "info", text: "Confirmed" },
            preparing: { color: "primary", text: "Preparing" },
            ready: { color: "success", text: "Ready" },
            delivered: { color: "success", text: "Delivered" },
            cancelled: { color: "danger", text: "Cancelled" },
            completed: { color: "success", text: "Completed" },
        };
        return statusConfig[status] || { color: "secondary", text: status };
    };

    const getOrderTypeInfo = (type) => {
        const typeConfig = {
            'dine-in': "Dine In",
            'takeaway': "Takeaway",
            'delivery': "Delivery",
        };
        return typeConfig[type] || type;
    };

    const getPaymentMethodInfo = (status) => {
        const paymentConfig = {
            unpaid: "Unpaid",
            paid: "Cash", // Example: Mapping 'paid' to 'CASH'
            partially_paid: "Partially Paid",
            refunded: "Refunded"
        };
        return paymentConfig[status] || status;
    }

    return (
        <>
            <PrintableReceipt order={printableOrder} onPrinted={() => setPrintableOrder(null)} />

            {/* Grid Layout */}
            <div className="order-grid">
                {data.length === 0 ? (
                    <Alert color="info" className="text-center">
                        Không có đơn hàng nào
                    </Alert>
                ) : (
                    <Row className="g-4">
                        {data.map((order) => (
                            <Col key={order.id} xs={12} sm={6} md={4} lg={3} xl={3}>
                                <OrderCard
                                    order={order}
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
                    Bạn có chắc chắn muốn xóa đơn hàng{" "}
                    <strong>#{selectedItem?.order_code || selectedItem?.id}</strong> không?
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
                    Chỉnh sửa đơn hàng
                </ModalHeader>
                <ModalBody>
                    {selectedItem && (
                        <Form>
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="order_type">Loại đơn hàng</Label>
                                        <Input
                                            id="order_type"
                                            type="select"
                                            value={editForm.order_type}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    order_type: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="dine-in">Tại bàn</option>
                                            <option value="takeaway">Mang về</option>
                                            <option value="delivery">Giao hàng</option>
                                        </Input>
                                        {getFieldError('order_type')}
                                    </FormGroup>
                                </Col>
                                {editForm.order_type === 'dine-in' && (
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="table_id">Bàn</Label>
                                            <Input
                                                id="table_id"
                                                type="select"
                                                value={editForm.table_id}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, table_id: e.target.value })
                                                }
                                            >
                                                <option value="">Chọn bàn</option>
                                                <option value="1">Bàn 1</option>
                                                <option value="2">Bàn 2</option>
                                                <option value="3">Bàn 3</option>
                                            </Input>
                                            {getFieldError('table_id')}
                                        </FormGroup>
                                    </Col>
                                )}
                                    <Col md={6}>
                                    <FormGroup>
                                        <Label for="payment_statuses">Trạng thái thanh toán</Label>
                                        <Input
                                            id="payment_statuses"
                                            type="select"
                                            value={editForm.payment_status}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, payment_status: e.target.value })
                                            }
                                        >
                                            <option value="unpaid">Chưa thanh toán</option>
                                            <option value="partially_paid">Thanh toán một phần</option>
                                            <option value="paid">Đã thanh toán</option>
                                            <option value="refunded">Đã hoàn tiền</option>
                                        </Input>
                                        {getFieldError('payment_statuses')}
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row >
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="statuses">Trạng thái đơn hàng</Label>
                                        <Input
                                            id="statuses"
                                            type="select"
                                            value={editForm.status}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, status: e.target.value })
                                            }
                                        >
                                            <option value="pending_confirmation">Chờ xác nhận</option>
                                            <option value="confirmed">Đã xác nhận</option>
                                            <option value="preparing">Đang chế biến</option>
                                            <option value="ready">Sẵn sàng</option>
                                            <option value="delivered">Đã giao</option>
                                            <option value="cancelled">Đã hủy</option>
                                            <option value="completed">Hoàn thành</option>
                                        </Input>
                                        {getFieldError('statuses')}
                                    </FormGroup>
                                </Col>
                            </Row>
                            {editForm.order_type === 'delivery' && (
                                <>
                                    <hr />
                                    <h6 className="mb-3">Thông tin giao hàng</h6>
                                    <FormGroup>
                                        <Label for="delivery_address">Địa chỉ giao hàng</Label>
                                        <Input
                                            id="delivery_address"
                                            type="textarea"
                                            rows="2"
                                            value={editForm.delivery_address}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, delivery_address: e.target.value })
                                            }
                                        />
                                        {getFieldError('delivery_address')}
                                    </FormGroup>
                                    <Row>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="delivery_contact_name">Tên người nhận</Label>
                                                <Input
                                                    id="delivery_contact_name"
                                                    value={editForm.delivery_contact_name}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, delivery_contact_name: e.target.value })
                                                    }
                                                />
                                                {getFieldError('delivery_contact_name')}
                                            </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="delivery_contact_phone">SĐT người nhận</Label>
                                                <Input
                                                    id="delivery_contact_phone"
                                                    value={editForm.delivery_contact_phone}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, delivery_contact_phone: e.target.value })
                                                    }
                                                />
                                                {getFieldError('delivery_contact_phone')}
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </>
                            )}
                            <hr />
                            <FormGroup>
                                <Label for="notes">Ghi chú</Label>
                                <Input
                                    id="notes"
                                    type="textarea"
                                    value={editForm.notes}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, notes: e.target.value })
                                    }
                                />
                                {getFieldError('notes')}
                            </FormGroup>
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

            {/* Modal Thêm món ăn */}
            <Modal isOpen={showAddItem} toggle={() => setShowAddItem(false)}>
                <ModalHeader toggle={() => setShowAddItem(false)}>
                    Thêm món ăn vào đơn hàng
                </ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Label for="menu_item_id">Chọn món ăn *</Label>
                            <Input
                                id="menu_item_id"
                                type="select"
                                value={addItemForm.menu_item_id}
                                onChange={(e) =>
                                    setAddItemForm({ ...addItemForm, menu_item_id: e.target.value })
                                }
                                required
                            >
                                <option value="">Chọn món ăn</option>
                                {menuItems.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} - {formatCurrency(item.price)}
                                    </option>
                                ))}
                            </Input>
                        </FormGroup>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="quantity">Số lượng *</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        value={addItemForm.quantity}
                                        onChange={(e) =>
                                            setAddItemForm({ ...addItemForm, quantity: e.target.value })
                                        }
                                        required
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <FormGroup>
                            <Label for="special_instructions">Ghi chú đặc biệt</Label>
                            <Input
                                id="special_instructions"
                                type="textarea"
                                value={addItemForm.special_instructions}
                                onChange={(e) =>
                                    setAddItemForm({ ...addItemForm, special_instructions: e.target.value })
                                }
                            />
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowAddItem(false)}>
                        Hủy
                    </Button>
                    <Button color="primary" onClick={handleAddItem} disabled={loadingAddItem}>
                        {loadingAddItem ? <Spinner size="sm" /> : "Thêm món"}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Modal Xem chi tiết - NEW DESIGN */}
            <Modal isOpen={showView} toggle={() => setShowView(false)} size="xl" centered>
                <ModalHeader toggle={() => setShowView(false)} className="align-items-center">
                    <h5 className="modal-title mb-0">Order Details #{selectedItem?.order_code}</h5>
                    <Button color="light" size="sm" className="ms-auto" onClick={() => handlePrint(selectedItem)}>
                        <MdPrint className="me-1" /> Print Bill
                    </Button>
                </ModalHeader>
                <ModalBody className="bg-light p-4 order-detail-modal">
                    {selectedItem && (
                        <Row>
                            {/* Left Column */}
                            <Col md={6}>
                                <Card className="mb-4 shadow-sm">
                                    <CardBody>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0 fw-bold">Order Information</h6>
                                            <Badge color={getStatusInfo(selectedItem.status).color} pill className="d-flex align-items-center gap-1 px-2 py-1">
                                                <FaCheckCircle />
                                                {getStatusInfo(selectedItem.status).text}
                                            </Badge>
                                        </div>
                                        <div className="info-row"><span>Created:</span><strong>{new Date(selectedItem.order_time || selectedItem.created_at).toLocaleString('en-GB')}</strong></div>
                                        <div className="info-row"><span>Type:</span><strong>{getOrderTypeInfo(selectedItem.order_type)}</strong></div>
                                        <div className="info-row"><span>Payment Method:</span><strong>{getPaymentMethodInfo(selectedItem.payment_status)}</strong></div>
                                        {selectedItem.order_type === 'dine-in' && (
                                            <div className="info-row"><span>Table:</span><Badge color="dark" pill>T{selectedItem.table_id}</Badge></div>
                                        )}
                                    </CardBody>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardBody>
                                        <h6 className="mb-3 fw-bold">Customer Information</h6>
                                        {selectedItem.customer ? (
                                            <>
                                                <p className="mb-1"><strong>{selectedItem.customer.full_name}</strong></p>
                                                <p className="text-muted mb-0">{selectedItem.customer.phone_number}</p>
                                            </>
                                        ) : (
                                            <p className="text-muted mb-0">No customer information</p>
                                        )}
                                        {selectedItem.order_type === 'delivery' && (
                                            <div className="mt-3">
                                                <hr/>
                                                <p className="mb-1"><strong>Address:</strong> {selectedItem.delivery_address}</p>
                                                <p className="mb-1"><strong>Recipient:</strong> {selectedItem.delivery_contact_name}</p>
                                                <p className="mb-0"><strong>Phone:</strong> {selectedItem.delivery_contact_phone}</p>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>

                            {/* Right Column */}
                            <Col md={6}>
                                <Card className="shadow-sm">
                                    <CardBody>
                                        <h6 className="mb-3 fw-bold">Order Items</h6>
                                        <div className="order-items-container">
                                            {selectedItem.items && selectedItem.items.length > 0 ? (
                                                selectedItem.items.map((item, index) => (
                                                    <div key={index} className="order-item">
                                                        <div>
                                                            <p className="mb-0 fw-bold">{item.menu_item_name} <small>({item.quantity}x)</small></p>
                                                            {item.special_instructions && <small className="text-muted fst-italic">+ {item.special_instructions}</small>}
                                                        </div>
                                                        <div className="text-end fw-bold">{formatCurrency(item.total_price)}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-muted">No items in this order.</p>
                                            )}
                                        </div>
                                        <hr />
                                        <div className="summary-row"><span>Subtotal:</span><strong>{formatCurrency(selectedItem.total_amount || 0)}</strong></div>
                                        
                                        {selectedItem.total_amount > selectedItem.final_amount && (
                                            <div className="summary-row discount">
                                                <div>
                                                    <p className="mb-0 fw-bold">Discount Applied</p>
                                                    {/*<small>Code: ...</small>*/}
                                                </div>
                                                <strong className="fw-bold">-{formatCurrency((selectedItem.total_amount || 0) - (selectedItem.final_amount || 0))}</strong>
                                            </div>
                                        )}
                                        
                                        {/* VAT is not available in data, so it's omitted */}
                                        
                                        <hr />
                                        <div className="summary-row total align-items-center">
                                            <span className="fw-bold">Total Amount:</span>
                                            <strong className="fs-4">{formatCurrency(selectedItem.final_amount || 0)}</strong>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </ModalBody>
                 <ModalFooter>
                    <Button color="secondary" onClick={() => setShowView(false)}>
                        Đóng
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default OrderGrid; 