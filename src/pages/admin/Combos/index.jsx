import React, { useState, useEffect } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Row,
    Col,
    Spinner,
    Input,
    Button,
    Badge,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Modal,
} from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import ListTrashCombo from "@components/admin/Combos/ListTrashCombo";
import ModalCombo from "@components/admin/Combos/ModalCombo";
import { toast } from "react-toastify";
import { getCombos, softDeleteCombo, getComboDetail } from "@services/admin/comboService";
import { getDishes } from "@services/admin/dishService";
import Swal from "sweetalert2";
import ComboCardGrid from "@components/admin/Combos/ComboCardGrid";
import ModalAddDishToCombo from "@components/admin/Combos/ModalAddDishToCombo";
import "react-toastify/dist/ReactToastify.css";

const statusOptions = [
    { value: "all", label: "Tất cả", badgeColor: "secondary" },
    { value: 1, label: "Đang bán", badgeColor: "success" },
    { value: 0, label: "Ngưng áp dụng", badgeColor: "danger" },
];

const ComboIndex = () => {
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [meta, setMeta] = useState({ page: 1, perPage: 8, total: 0, totalPage: 1 });
    const [modalOpen, setModalOpen] = useState(false);
    const [newCombo, setNewCombo] = useState({
        name: "",
        selling_price: "",
        status: "active",
        description: "",
        items: [],
        image_url: "",
    });
    const [errors, setErrors] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [, setEditComboId] = useState(null);
    const [activeTab, setActiveTab] = useState("list");
    const [dishList] = useState([]);
    const [selectedCombo, setSelectedCombo] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showAddDishModal, setShowAddDishModal] = useState(false);
    const [currentComboId, setCurrentComboId] = useState(null);

    const fetchCombos = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                per_page: 8,
                search: search || undefined,
                ...(status !== "all" && { is_active: status }),
            };
            const res = await getCombos(params);
            const items = res.data?.data?.items;
            if (Array.isArray(items)) {
                setCombos(items);
                setMeta({
                    page: res.data.data.meta.page || 1,
                    perPage: 8,
                    total: res.data.data.meta.total || 0,
                    totalPage: res.data.data.meta.totalPage || 1,
                });
            } else {
                setCombos([]);
                setMeta({ page: 1, perPage: 8, total: 0, totalPage: 1 });
            }
        } catch {
            setCombos([]);
            setMeta({ page: 1, perPage: 8, total: 0, totalPage: 1 });
            toast.error("Lỗi khi tải danh sách combo!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "list") fetchCombos(meta.page);
    }, [meta.page, search, status, activeTab]);

    const handleStatusChange = (value) => {
        setStatus(value);
        setMeta((prev) => ({ ...prev, page: 1 }));
        fetchCombos(1);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setMeta((prev) => ({ ...prev, page: 1 }));
        fetchCombos(1);
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= meta.totalPage) {
            setMeta((prev) => ({ ...prev, page: pageNumber }));
        }
    };

    const resetNewCombo = () => {
        setNewCombo({
            name: "",
            selling_price: "",
            status: "active",
            description: "",
            items: [],
            image_url: "",
        });
        setErrors({});
        setIsEdit(false);
        setEditComboId(null);
    };

    const handleEditCombo = async (comboId) => {
        try {
            const res = await getComboDetail(comboId);
            const combo = res.data.data.combo;
            const items = res.data.data.items || [];
            const dishRes = await getDishes();
            const dishList = dishRes.data.data.items || [];
            const mappedItems = items.map((item) => {
                const dish = dishList.find((d) => Number(d.id) === Number(item.dish_id));
                return {
                    ...item,
                    id: Number(item.dish_id),
                    dish_id: Number(item.dish_id),
                    dish_name: item.dish_name || (dish ? dish.name : ""),
                    selling_price: dish ? dish.selling_price : 0,
                    category: dish ? dish.category : null,
                    image_url: dish ? dish.image_url : "",
                    quantity: item.quantity || 1,
                };
            });
            setNewCombo({
                id: combo.id,
                name: combo.name || "",
                selling_price: combo.selling_price || "",
                status: combo.is_active === 1 ? "active" : "inactive",
                description: combo.description || "",
                items: mappedItems,
                image_url: combo.image_url || "",
            });
            setEditComboId(combo.id);
            setIsEdit(true);
            setModalOpen(true);
        } catch {
            toast.error("Không lấy được thông tin combo!");
        }
    };

    const handleDeleteClick = (comboId) => {
        Swal.fire({
            title: "Xóa combo?",
            text: "Bạn có chắc chắn muốn xóa combo này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
        }).then((result) => {
            if (result.isConfirmed) handleDeleteCombo(comboId);
        });
    };

    const handleDeleteCombo = async (comboId) => {
        try {
            await softDeleteCombo(comboId);
            toast.success("Xóa combo thành công!");
            fetchCombos(meta.page);
        } catch {
            toast.error("Lỗi khi xóa combo!");
        }
    };

    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
            setSearch("");
            setStatus("all");
            setMeta((prev) => ({ ...prev, page: 1 }));
            if (tab === "list") fetchCombos(1);
        }
    };

    const handleAddDish = (comboId) => {
        setCurrentComboId(comboId);
        setShowAddDishModal(true);
    };

    const handleShowDetailCombo = async (comboId) => {
        try {
            const res = await getComboDetail(comboId);
            setSelectedCombo({
                ...res.data.data.combo,
                items: res.data.data.items,
            });
            setShowDetailModal(true);
        } catch {
            toast.error("Không lấy được thông tin combo!");
        }
    };

    const reloadComboDetail = async (comboId) => {
        try {
            const res = await getComboDetail(comboId);
            setSelectedCombo({
                ...res.data.data.combo,
                items: res.data.data.items,
            });
        } catch {
            toast.error("Không lấy được thông tin combo!");
        }
    };

    return (
        <div className="page-content">
            <Breadcrumbs title="Quản Lý Combo" breadcrumbItem={activeTab === "list" ? "Danh sách combo" : "Thùng rác"} />

            <Card className="mb-4">
                <CardHeader className="bg-white border-bottom-0">
                    <Nav tabs>
                        <NavItem>
                            <NavLink className={activeTab === "list" ? "active" : ""} onClick={() => toggleTab("list")}>
                                Danh sách combo
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className={activeTab === "trash" ? "active" : ""} onClick={() => toggleTab("trash")}>
                                Thùng rác
                            </NavLink>
                        </NavItem>
                    </Nav>
                </CardHeader>
            </Card>

            <TabContent activeTab={activeTab}>
                <TabPane tabId="list">
                    <Card className="mb-4">
                        <CardBody>
                            <Row className="align-items-center g-2">
                                <Col md={6} sm={12}>
                                    <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search" />
                    </span>
                                        <Input
                                            type="search"
                                            placeholder="Tìm kiếm combo..."
                                            value={search}
                                            onChange={handleSearchChange}
                                        />
                                    </div>
                                </Col>

                                <Col md={3} sm={6}>
                                    <Input type="select" value={status} onChange={(e) => handleStatusChange(e.target.value)}>
                                        <option value="all">Tất cả trạng thái</option>
                                        <option value={1}>Đang bán</option>
                                        <option value={0}>Ngưng áp dụng</option>
                                    </Input>
                                </Col>

                                <Col md={3} sm={6} className="d-flex justify-content-end">
                                    <Button color="success" onClick={() => { resetNewCombo(); setModalOpen(true); }}>
                                        <i className="mdi mdi-plus" /> Thêm combo mới
                                    </Button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            {loading ? (
                                <div className="text-center my-5">
                                    <Spinner color="primary" />
                                </div>
                            ) : (
                                <>
                                    <ComboCardGrid
                                        data={combos}
                                        onDetail={handleShowDetailCombo}
                                        onEdit={handleEditCombo}
                                        onDelete={handleDeleteClick}
                                        onAddDish={handleAddDish}
                                    />
                                    <ModalAddDishToCombo
                                        isOpen={showAddDishModal}
                                        onClose={() => setShowAddDishModal(false)}
                                        comboId={currentComboId}
                                        onSuccess={() => {
                                            setShowAddDishModal(false);
                                            if (currentComboId) reloadComboDetail(currentComboId);
                                        }}
                                    />
                                    {meta.totalPage > 1 && (
                                        <div className="d-flex justify-content-end mt-4">
                                            <nav>
                                                <ul className="pagination">
                                                    <li className={`page-item${meta.page === 1 ? " disabled" : ""}`}>
                                                        <button className="page-link" onClick={() => handlePageChange(meta.page - 1)}>«</button>
                                                    </li>
                                                    {Array.from({ length: meta.totalPage }, (_, i) => (
                                                        <li key={i + 1} className={`page-item${meta.page === i + 1 ? " active" : ""}`}>
                                                            <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                                                        </li>
                                                    ))}
                                                    <li className={`page-item${meta.page === meta.totalPage ? " disabled" : ""}`}>
                                                        <button className="page-link" onClick={() => handlePageChange(meta.page + 1)}>»</button>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardBody>
                    </Card>
                </TabPane>

                <TabPane tabId="trash">
                    <ListTrashCombo />
                </TabPane>
            </TabContent>

            <ModalCombo
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
                combo={newCombo}
                setCombo={setNewCombo}
                dishList={dishList}
                onSave={fetchCombos}
                isEdit={isEdit}
                errors={errors}
            />

            <Modal isOpen={showDetailModal} toggle={() => setShowDetailModal(false)} size="xl" centered>
                {/* Nội dung modal chi tiết combo giữ nguyên như bạn đã có */}
            </Modal>
        </div>
    );
};

export default ComboIndex;
