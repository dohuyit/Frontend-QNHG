import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
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
} from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import ListDish from "@components/admin/Dishes/ListDish";
import ListTrashDish from "@components/admin/Dishes/ListTrashDish";
import ModalDish from "@components/admin/Dishes/ModalDish";
import DeleteModal from "@components/admin/ui/DeleteModal";
import PaginateUi from "@components/admin/ui/paginateUi";
import CustomerFilterBar from "@components/admin/CustomerFilterBar";
import { convertTagsToString } from "@helpers/admin/api_helper";
import { getDishes, createDish, updateDish, deleteSoftDish, getDish } from "@services/admin/dishService";
import { getCategories } from "@services/admin/categoryService";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import "./Dishes.scss";

const DishIndex = () => {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [meta, setMeta] = useState({ current_page: 1, per_page: 10, total: 0, last_page: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [newDish, setNewDish] = useState({
    category_id: "",
    name: "",
    description: "",
    original_price: "",
    selling_price: "",
    unit: "plate",
    image_url: "",
    tags: "",
    is_featured: false,
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [editDishId, setEditDishId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteDishId, setDeleteDishId] = useState(null);
  const [activeTab, setActiveTab] = useState("list");

  const statusOptions = [
    { value: "all", label: "Tất cả", badgeColor: "secondary" },
    { value: "active", label: "Đang bán", badgeColor: "success" },
    { value: "inactive", label: "Ngưng bán", badgeColor: "danger" },
  ];

  const unitOptions = [
    { value: "bowl", label: "Bát" },
    { value: "plate", label: "Đĩa" },
    { value: "cup", label: "Cốc" },
    { value: "glass", label: "Ly" },
    { value: "large_bowl", label: "Bát lớn" },
    { value: "other", label: "Khác" },
  ];

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { if (activeTab === "list") fetchDishes(currentPage); }, [currentPage, search, status, categoryFilter, activeTab]);
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setCurrentPage(1);
    fetchDishes(1);
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await getCategories();
      setCategories(res.data.data.items || []);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách danh mục!");
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchDishes = async (page = 1) => {
    setLoadingDishes(true);
    try {
      const params = {
        page,
        per_page: 10,
        search: search || undefined,
        category_id: categoryFilter || undefined,
        status: status !== "all" ? status : undefined,
      };
      const res = await getDishes(params);
      const items = res.data?.data?.items;
      if (Array.isArray(items)) {
        setDishes(items);
        setMeta(res.data.data.meta);
        setCurrentPage(res.data.data.meta.page);
      } else {
        setDishes([]);
        setMeta({ current_page: 1, per_page: 10, total: 0, last_page: 1 });
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách món ăn!");
      setDishes([]);
    } finally {
      setLoadingDishes(false);
    }
  };

  const handleDishClick = async (id) => {
    try {
      const res = await getDish(id);
      const d = res.data.data.dish;
      setNewDish({
        category_id: d.category_id || "",
        name: d.name || "",
        description: d.description || "",
        original_price: d.original_price || "",
        selling_price: d.selling_price || "",
        unit: d.unit || "plate",
        image_url: d.image_url || "",
        tags: convertTagsToString(d.tags),
        is_featured: !!d.is_featured,
        status: d.status || "active",
      });
      setEditDishId(id);
      setIsEdit(true);
      setModalOpen(true);
      setErrors({});
    } catch {
      toast.error("Không lấy được thông tin món ăn!");
    }
  };

  const handleSave = async () => {
    setErrors({});
    const formData = new FormData();
    Object.entries(newDish).forEach(([k, v]) => {
      if (k === "tags") {
        v.split(",").map((tag) => tag.trim()).filter(Boolean).forEach((tag) => formData.append("tags[]", tag));
      } else if (k === "image" && v instanceof File) {
        formData.append("image_url", v);
      } else {
        formData.append(k, v);
      }
    });

    try {
      isEdit ? await updateDish(editDishId, formData) : await createDish(formData);
      toast.success(isEdit ? "Cập nhật món ăn thành công!" : "Thêm món ăn thành công!");
      setModalOpen(false);
      resetNewDish();
      fetchDishes(currentPage);
    } catch (e) {
      const apiErrors = e.response?.data?.errors;
      if (apiErrors) setErrors(apiErrors);
      toast.error(e.response?.data?.message || "Lỗi khi lưu món ăn!");
    }
  };

  const handleDeleteClick = (id) => {
    Swal.fire({ title: "Xóa món ăn?", icon: "warning", showCancelButton: true, confirmButtonText: "Xóa" })
        .then((res) => { if (res.isConfirmed) { setDeleteDishId(id); setDeleteModalOpen(true); } });
  };

  const handleDeleteDish = async () => {
    if (!deleteDishId) return;
    try {
      await deleteSoftDish(deleteDishId);
      toast.success("Xóa món ăn thành công!");
      setDeleteModalOpen(false);
      setDeleteDishId(null);
      fetchDishes(currentPage);
    } catch {
      toast.error("Lỗi khi xóa món ăn!");
    }
  };

  const resetNewDish = () => {
    setNewDish({ category_id: "", name: "", description: "", original_price: "", selling_price: "", unit: "plate", image_url: "", tags: "", is_featured: false, status: "active" });
    setErrors({});
    setIsEdit(false);
    setEditDishId(null);
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setSearch("");
      setStatus("all");
      setCategoryFilter("");
      setCurrentPage(1);
      if (tab === "list") fetchDishes(1);
    }
  };

  return (
      <div className="page-content">
        <Breadcrumbs title="Quản Lý Món Ăn" breadcrumbItem={activeTab === "list" ? "Danh sách món ăn" : "Thùng rác"} />

        <Card className="mb-4">
          <CardHeader className="bg-white border-bottom-0">
            <Nav tabs>
              <NavItem>
                <NavLink className={activeTab === "list" ? "active" : ""} onClick={() => toggleTab("list")}>Danh sách món ăn</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className={activeTab === "trash" ? "active" : ""} onClick={() => toggleTab("trash")}>Thùng rác</NavLink>
              </NavItem>
            </Nav>
          </CardHeader>
        </Card>

        <TabContent activeTab={activeTab}>
          <TabPane tabId="list">
            <Card className="mb-4">
              <CardHeader className="bg-white border-bottom-0">
                <Row className="align-items-center">
                  <Col md={7} sm={12} className="mb-2 mb-md-0 d-flex align-items-center">
                    <div style={{ display: "flex" }}>
                      {statusOptions.map((opt) => (
                          <button key={opt.value} onClick={() => handleStatusChange(opt.value)} style={{ background: "none", border: "none", padding: "8px 24px", fontWeight: status === opt.value ? 600 : 400, color: status === opt.value ? "#007bff" : "#333", borderBottom: status === opt.value ? "3px solid #007bff" : "3px solid transparent", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center" }}>
                            {opt.label}
                            <Badge color={opt.badgeColor} pill className="ms-2" style={{ fontSize: 13, minWidth: 28 }}>{opt.value === "all" ? meta.total : dishes.filter(d => d.status === opt.value).length}</Badge>
                          </button>
                      ))}
                    </div>
                  </Col>
                  <Col md={5} sm={12} className="d-flex justify-content-md-end justify-content-start gap-2">
                    <Button color="success" onClick={() => { resetNewDish(); setModalOpen(true); }}>
                      <i className="mdi mdi-plus" /> Thêm mới món ăn
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
            </Card>

            <Card className="mb-4">
              <CardHeader className="bg-white border-bottom-0">
                <CustomerFilterBar
                    searchKeyword={search}
                    onSearchChange={setSearch}
                    selectedStatus={status}
                    onStatusChange={handleStatusChange}
                    statusOptions={statusOptions}
                    showDropdown={true}
                    onOpenAdvancedFilter={() => {}}
                    placeholder="Tìm kiếm món ăn..."
                >
                  <Input type="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="">Tất cả danh mục</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Input>
                </CustomerFilterBar>
              </CardHeader>
            </Card>

            <Card className="mb-4">
              <CardBody>
                {loadingDishes ? <div className="text-center my-5"><Spinner color="primary" /></div> : <ListDish paginate={{ page: meta.current_page, perPage: meta.per_page, totalPage: meta.last_page }} data={dishes} onDelete={handleDeleteClick} onPageChange={setCurrentPage} onEdit={handleDishClick} />}
              </CardBody>
            </Card>

            <PaginateUi currentPage={meta.current_page} totalPages={meta.last_page} onPageChange={setCurrentPage} />
          </TabPane>

          <TabPane tabId="trash">
            <ListTrashDish />
          </TabPane>
        </TabContent>

        <ModalDish modalOpen={modalOpen} setModalOpen={setModalOpen} newDish={newDish} setNewDish={setNewDish} categories={categories} unitOptions={unitOptions} onSave={handleSave} isEdit={isEdit} errors={errors} />
        <DeleteModal show={deleteModalOpen} onDeleteClick={handleDeleteDish} onCloseClick={() => setDeleteModalOpen(false)} />
      </div>
  );
};

export default DishIndex;
