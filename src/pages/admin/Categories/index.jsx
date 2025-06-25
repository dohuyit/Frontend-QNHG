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
} from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import ListCategory from "@components/admin/Categories/ListCategory";
import ListTrashCategory from "@components/admin/Categories/ListTrashCategory";
import ModalCategory from "@components/admin/Categories/ModalCategory";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Categories.scss";
import { getCategories, createCategory, updateCategory, deleteSoftCategory, getCategory } from "@services/admin/categoryService";
import Swal from "sweetalert2";

const CategoryIndex = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    image_url: "",
    is_active: true,
    parent_id: "",
  });
  const [errors, setErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [activeTab, setActiveTab] = useState("list");

  const statusOptions = [
    { value: "all", label: "Tất cả", badgeColor: "secondary" },
    { value: "active", label: "Hoạt động", badgeColor: "success" },
    { value: "inactive", label: "Không hoạt động", badgeColor: "danger" },
  ];

  const fetchCategories = async (page = 1) => {
    setLoadingCategories(true);
    try {
      const params = {
        page,
        per_page: 10,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
      };
      const res = await getCategories(params);
      const items = res.data?.data?.items;
      if (Array.isArray(items)) {
        setCategories(items);
        setMeta({
          current_page: res.data.data.meta.page || 1,
          per_page: res.data.data.meta.perPage || 10,
          total: res.data.data.meta.total || 0,
          last_page: res.data.data.meta.totalPage || 1,
        });
        setCurrentPage(res.data.data.meta.page || 1);
      } else {
        console.error("API response structure is incorrect:", res.data);
        setCategories([]);
        setMeta({
          current_page: 1,
          per_page: 10,
          total: 0,
          last_page: 1,
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error.response || error);
      setCategories([]);
      toast.error("Lỗi khi tải danh sách danh mục!");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (activeTab === "list") {
      fetchCategories(currentPage);
    }
  }, [currentPage, search, status, activeTab]);

  const handleCategoryClick = async (categoryId) => {
    try {
      const res = await getCategory(categoryId);
      const category = res.data.data.category;
      setNewCategory({
        name: category.name || "",
        description: category.description || "",
        image_url: category.image_url || "",
        is_active: !!category.is_active,
        parent_id: category.parent_id ? String(category.parent_id) : "",
      });
      setEditCategoryId(category.id);
      setIsEdit(true);
      setModalOpen(true);
      setErrors({});
    } catch (error) {
      console.error("Error fetching category:", error.response || error);
      toast.error("Không lấy được thông tin danh mục!");
    }
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setCurrentPage(1);
    fetchCategories(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
    fetchCategories(1);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= meta.last_page) {
      setCurrentPage(pageNumber);
    }
  };

  const handleSave = async () => {
    setErrors({});
    const formData = new FormData();
    formData.append("name", newCategory.name || "");
    formData.append("description", newCategory.description || "");
    formData.append("is_active", newCategory.is_active ? "1" : "0");
    if (newCategory.parent_id) {
      formData.append("parent_id", newCategory.parent_id);
    }
    if (newCategory.image instanceof File) {
      formData.append("image_url", newCategory.image);
    }

    try {
      let response;
      if (isEdit) {
        response = await updateCategory(editCategoryId, formData);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        response = await createCategory(formData);
        toast.success("Thêm danh mục thành công!");
      }
      setModalOpen(false);
      resetNewCategory();
      fetchCategories(currentPage);
    } catch (error) {
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        setErrors(apiErrors);
      }
      toast.error(error.response?.data?.message || "Lỗi khi lưu danh mục!");
    }
  };

  const handleDeleteClick = async (categoryId) => {
    const result = await Swal.fire({
      title: "Xóa danh mục?",
      text: "Bạn có chắc chắn muốn xóa danh mục này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteSoftCategory(categoryId);
        toast.success("Xóa danh mục thành công!");
        fetchCategories(currentPage);
      } catch (error) {
        console.error("Error deleting category:", error.response || error);
        toast.error("Lỗi khi xóa danh mục!");
      }
    }
  };

  const resetNewCategory = () => {
    setNewCategory({
      name: "",
      description: "",
      image_url: "",
      is_active: true,
      parent_id: "",
    });
    setErrors({});
    setIsEdit(false);
    setEditCategoryId(null);
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setSearch("");
      setStatus("all");
      setCurrentPage(1);
      if (tab === "list") fetchCategories(1);
    }
  };

  return (
    <div className="page-content">
      <ToastContainer />
      <Breadcrumbs title="Quản Lý Danh Mục" breadcrumbItem={activeTab === "list" ? "Danh sách danh mục" : "Thùng rác"} />

      <Card className="mb-4">
        <CardHeader className="bg-white border-bottom-0">
          <Nav tabs>
            <NavItem>
              <NavLink
                style={{ cursor: "pointer" }}
                className={activeTab === "list" ? "active" : ""}
                onClick={() => toggleTab("list")}
              >
                Danh sách danh mục
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                style={{ cursor: "pointer" }}
                className={activeTab === "trash" ? "active" : ""}
                onClick={() => toggleTab("trash")}
              >
                Thùng rác
              </NavLink>
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
                      <button
                        key={opt.value}
                        onClick={() => handleStatusChange(opt.value)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: "8px 24px",
                          fontWeight: status === opt.value ? 600 : 400,
                          color: status === opt.value ? "#007bff" : "#333",
                          borderBottom: status === opt.value ? "3px solid #007bff" : "3px solid transparent",
                          fontSize: 16,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {opt.label}
                        <Badge
                          color={opt.badgeColor}
                          pill
                          className="ms-2"
                          style={{ fontSize: 13, minWidth: 28 }}
                        >
                          {opt.value === "all" ? meta.total : categories.filter(c => c.is_active === (opt.value === "active")).length}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </Col>
                <Col
                  md={5}
                  sm={12}
                  className="d-flex justify-content-md-end justify-content-start align-items-center gap-2"
                >
                  <Button
                    color="success"
                    onClick={() => {
                      resetNewCategory();
                      setModalOpen(true);
                    }}
                  >
                    <i className="mdi mdi-plus"></i> Thêm mới danh mục
                  </Button>
                </Col>
              </Row>
            </CardHeader>
          </Card>

          <Card className="mb-4">
            <CardBody>
              <Row className="align-items-center g-2">
                <Col md={6} sm={12}>
                  <Input
                    type="search"
                    placeholder="Tìm kiếm danh mục..."
                    value={search}
                    onChange={handleSearchChange}
                  />
                </Col>
              </Row>
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardBody>
              {loadingCategories ? (
                <div className="text-center my-5">
                  <Spinner color="primary" />
                </div>
              ) : (
                <ListCategory
                  paginate={{
                    page: meta.current_page,
                    perPage: meta.per_page,
                    totalPage: meta.last_page,
                  }}
                  data={categories}
                  onDelete={handleDeleteClick}
                  onPageChange={handlePageChange}
                  onEdit={handleCategoryClick}
                />
              )}
            </CardBody>
          </Card>
        </TabPane>

        <TabPane tabId="trash">
          <ListTrashCategory />
        </TabPane>
      </TabContent>

      <ModalCategory
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        categories={categories}
        onSave={handleSave}
        isEdit={isEdit}
        errors={errors}
      />
    </div>
  );
};

export default CategoryIndex;