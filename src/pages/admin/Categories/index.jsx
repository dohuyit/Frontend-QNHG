import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Spinner,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import ListCategory from "@components/admin/Categories/ListCategory";
import ListTrashCategory from "@components/admin/Categories/ListTrashCategory";
import ModalCategory from "@components/admin/Categories/ModalCategory";
import SearchAndStatusFilterBar from "@components/admin/ui/SearchAndStatusFilterBar";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import "./Categories.scss";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteSoftCategory,
  getCategory,
  countCategory,
} from "@services/admin/categoryService";
import StatusFilterGroup from "@components/admin/ui/StatusFilterGroup";

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

  const [showFilter, setShowFilter] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterParent, setFilterParent] = useState("");

  const [categoryStatusCounts, setCategoryStatusCounts] = useState({
    active: 0,
    inactive: 0,
    all: 0,
  });

  const statusOptions = [
    { value: "all", label: "Tất cả", badgeColor: "secondary" },
    { value: "active", label: "Hoạt động", badgeColor: "success" },
    { value: "inactive", label: "Không hoạt động", badgeColor: "danger" },
  ];

  // ✅ fetch categories với params chuẩn
  const fetchCategories = async (page = 1) => {
    setLoadingCategories(true);
    try {
      const params = {
        page,
        per_page: 10,
        name: search || filterName || undefined,
        is_active: status !== "all" ? status : undefined,
        parent_id: filterParent || undefined,
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
        setCategories([]);
        setMeta({ current_page: 1, per_page: 10, total: 0, last_page: 1 });
      }
    } catch {
      toast.error("Lỗi khi tải danh sách danh mục!");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchCategoryStatusCounts = async () => {
    try {
      const res = await countCategory();
      setCategoryStatusCounts(res.data.data || {});
    } catch {
      setCategoryStatusCounts({ active: 0, inactive: 0, all: 0 });
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (activeTab === "list") {
        fetchCategories(currentPage);
        fetchCategoryStatusCounts();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [currentPage, search, status, activeTab, filterName, filterParent]);

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
    } catch {
      toast.error("Không lấy được thông tin danh mục!");
    }
  };

  const handleStatusChange = (value) => {
    setStatus(value);
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
    if (newCategory.parent_id)
      formData.append("parent_id", newCategory.parent_id);
    if (newCategory.image instanceof File) {
      formData.append("image_url", newCategory.image);
    }

    try {
      if (isEdit) {
        await updateCategory(editCategoryId, formData);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await createCategory(formData);
        toast.success("Thêm danh mục thành công!");
      }
      setModalOpen(false);
      resetNewCategory();
      fetchCategories(currentPage);
    } catch (error) {
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) setErrors(apiErrors);
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
      } catch {
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
      <Breadcrumbs
        title="Quản Lý Danh Mục"
        breadcrumbItem={
          activeTab === "list" ? "Danh sách danh mục" : "Thùng rác"
        }
      />

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

      {/* Offcanvas bộ lọc nâng cao */}
      <Offcanvas
        direction="end"
        isOpen={showFilter}
        toggle={() => setShowFilter(false)}
      >
        <OffcanvasHeader toggle={() => setShowFilter(false)}>
          <span>Bộ lọc nâng cao</span>
          <Button
            color="light"
            size="sm"
            style={{
              position: "absolute",
              right: 48,
              top: 12,
              boxShadow: "none",
              zIndex: 1,
            }}
            onClick={() => {
              setFilterName("");
              setFilterParent("");
              fetchCategories();
            }}
            title="Làm mới bộ lọc"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
        </OffcanvasHeader>
        <OffcanvasBody>
          <Form>
            <FormGroup>
              <Label for="filterName">Tên danh mục</Label>
              <Input
                id="filterName"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Nhập tên danh mục..."
              />
            </FormGroup>
            <FormGroup>
              <Label for="filterParent">Danh mục cha</Label>
              <Input
                id="filterParent"
                value={filterParent}
                onChange={(e) => setFilterParent(e.target.value)}
                placeholder="Nhập danh mục cha..."
              />
            </FormGroup>
          </Form>
        </OffcanvasBody>
      </Offcanvas>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="list">
          <Card className="mb-4">
            <CardHeader className="bg-white border-bottom-0">
              <Row className="align-items-center">
                <Col
                  md={7}
                  sm={12}
                  className="mb-2 mb-md-0 d-flex align-items-center"
                >
                  <StatusFilterGroup
                    options={statusOptions.map((opt) => ({
                      ...opt,
                      label: `${opt.label} (${
                        categoryStatusCounts[opt.value] || 0
                      })`,
                      badgeCount:
                        opt.value === "all"
                          ? (categoryStatusCounts.active || 0) +
                            (categoryStatusCounts.inactive || 0)
                          : categoryStatusCounts[opt.value] || 0,
                    }))}
                    value={status}
                    onChange={handleStatusChange}
                    style={{ gap: "1rem" }}
                  />
                </Col>
                <Col
                  md={5}
                  sm={12}
                  className="d-flex justify-content-md-end justify-content-start gap-2"
                >
                  <Button
                    color="success"
                    onClick={() => {
                      resetNewCategory();
                      setModalOpen(true);
                    }}
                  >
                    <i className="mdi mdi-plus" /> Thêm mới danh mục
                  </Button>
                </Col>
              </Row>
            </CardHeader>
          </Card>

          <Card className="mb-4">
            <CardHeader className="bg-white border-bottom-0">
              <SearchAndStatusFilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Tìm kiếm danh mục..."
                rightContent={
                  <Button
                    color="light"
                    className="border"
                    style={{ minWidth: 140 }}
                    onClick={() => setShowFilter(true)}
                  >
                    <i className="mdi mdi-filter-variant me-1"></i> Lọc nâng cao
                  </Button>
                }
              />
            </CardHeader>
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
