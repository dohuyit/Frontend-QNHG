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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Dishes.scss";
import { getDishes, createDish, updateDish, deleteSoftDish, getDish } from "@services/admin/dishService";
import { getCategories } from "@services/admin/categoryService";
import DeleteModal from "@components/admin/ui/DeleteModal";
import Swal from "sweetalert2";

const DishIndex = () => {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });
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

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await getCategories();
      setCategories(res.data.data.items || []);
    } catch (error) {
      console.error("Error fetching categories:", error.response || error);
      setCategories([]);
      toast.error("Lỗi khi tải danh sách danh mục!");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchDishes = async (page = 1) => {
    setLoadingDishes(true);
    try {
      const params = {
        page,
        per_page: 10, // Fixed per_page to match initial meta
        search: search || undefined,
        category_id: categoryFilter || undefined,
      };

      if (status !== "all") {
        params.status = status;
      }

      const res = await getDishes(params);
      const items = res.data?.data?.items;
      if (Array.isArray(items)) {
        setDishes(items);
        setMeta({
          current_page: res.data.data.meta.page || 1,
          per_page: res.data.data.meta.perPage || 10,
          total: res.data.data.meta.total || 0,
          last_page: res.data.data.meta.totalPage || 1,
        });
        setCurrentPage(res.data.data.meta.page || 1); 
      } else {
        console.error("API response structure is incorrect:", res.data);
        setDishes([]);
        setMeta({
          current_page: 1,
          per_page: 10,
          total: 0,
          last_page: 1,
        });
      }
    } catch (error) {
      console.error("Error fetching dishes:", error.response || error);
      setDishes([]);
      setMeta({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
      });
      toast.error("Lỗi khi tải danh sách món ăn!");
    } finally {
      setLoadingDishes(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === "list") {
      fetchDishes(currentPage);
    }
  }, [currentPage, search, status, categoryFilter, activeTab]);

  const handleDishClick = async (dishId) => {
    try {
      const res = await getDish(dishId);
      const dish = res.data.data.dish;
      setNewDish({
        category_id: dish.category_id ? String(dish.category_id) : "",
        name: dish.name || "",
        description: dish.description || "",
        original_price: dish.original_price !== null ? dish.original_price.toString() : "",
        selling_price: dish.selling_price !== null ? dish.selling_price.toString() : "",
        unit: dish.unit || "plate",
        image_url: dish.image_url || "",
        tags: dish.tags ? dish.tags.join(", ") : "",
        is_featured: !!dish.is_featured,
        status: dish.status || "active",
      });
      setEditDishId(dish.id);
      setIsEdit(true);
      setModalOpen(true);
      setErrors({});
    } catch (error) {
      console.error("Error fetching dish:", error.response || error);
      toast.error("Không lấy được thông tin món ăn!");
    }
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setCurrentPage(1); // Reset to first page on status change
    fetchDishes(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page on search
    fetchDishes(1);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on category filter change
    fetchDishes(1);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= meta.last_page) {
      setCurrentPage(pageNumber);
    }
  };

  const handleSave = async () => {
    setErrors({});
    const formData = new FormData();
    formData.append("name", newDish.name || "");
    formData.append("category_id", newDish.category_id || "");
    formData.append("original_price", newDish.original_price || "");
    formData.append("selling_price", newDish.selling_price || "");
    formData.append("unit", newDish.unit || "plate");
    formData.append("description", newDish.description || "");
    formData.append("status", newDish.status || "active");
    formData.append("is_featured", newDish.is_featured ? "1" : "0");

    const tagsArray = newDish.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    if (tagsArray.length > 0) {
      tagsArray.forEach((tag) => formData.append("tags[]", tag));
    }

    if (newDish.image instanceof File) {
      formData.append("image_url", newDish.image);
    }

    try {
      let response;
      if (isEdit) {
        response = await updateDish(editDishId, formData);
        if (response) {
          toast.success("Cập nhật món ăn thành công!");
        } 
      } else {
        response = await createDish(formData);
        if (response) {
          toast.success("Thêm món ăn thành công!");
        } 
      }
      setModalOpen(false);
      resetNewDish();
      fetchDishes(currentPage);
    } catch (error) {
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        setErrors(apiErrors);
      }
      toast.error(error.response?.data?.message || "Lỗi khi lưu món ăn!");
    }
  };

  const handleDeleteClick = (dishId) => {
    Swal.fire({
      title: "Xóa món ăn?",
      text: "Bạn có chắc chắn muốn xóa món ăn này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        setDeleteDishId(dishId);
        setDeleteModalOpen(true);
      }
    });
  };

  const handleDeleteDish = async () => {
    if (!deleteDishId) return;
    try {
      await deleteSoftDish(deleteDishId);
      toast.success("Xóa món ăn thành công!");
      setDeleteModalOpen(false);
      setDeleteDishId(null);
      fetchDishes(currentPage);
    } catch (error) {
      toast.error("Lỗi khi xóa món ăn!");
      setDeleteModalOpen(false);
      setDeleteDishId(null);
    }
  };

  const handleFeatureToggle = async (dishId, newStatus) => {
    try {
      await updateDish(dishId, { is_featured: newStatus });
      setDishes(dishes.map((d) =>
        d.id === dishId ? { ...d, is_featured: newStatus } : d
      ));
      toast.success("Cập nhật trạng thái nổi bật thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra, không thể cập nhật!");
    }
  };

  const resetNewDish = () => {
    setNewDish({
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
    setErrors({});
    setIsEdit(false);
    setEditDishId(null);
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setSearch("");
      setCategoryFilter("");
      setStatus("all");
      setCurrentPage(1);
      if (tab === "list") fetchDishes(1);
    }
  };

  return (
    <div className="page-content">
      <ToastContainer />
      <Breadcrumbs title="Quản Lý Món Ăn" breadcrumbItem={activeTab === "list" ? "Danh sách món ăn" : "Thùng rác"} />

      {/* Nav Tabs for List and Trash */}
      <Card className="mb-4">
        <CardHeader className="bg-white border-bottom-0">
          <Nav tabs>
            <NavItem>
              <NavLink
                style={{ cursor: "pointer" }}
                className={activeTab === "list" ? "active" : ""}
                onClick={() => toggleTab("list")}
              >
                Danh sách món ăn
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
          {/* Status Filter Tabs */}
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
                          {opt.value === "all" ? meta.total : dishes.filter(d => d.status === opt.value).length}
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
                      resetNewDish();
                      setModalOpen(true);
                    }}
                  >
                    <i className="mdi mdi-plus"></i> Thêm mới món ăn
                  </Button>
                </Col>
              </Row>
            </CardHeader>
          </Card>

          {/* Search & Category Filter */}
          <Card className="mb-4">
            <CardBody>
              <Row className="align-items-center g-2">
                <Col md={6} sm={12}>
                  <Input
                    type="search"
                    placeholder="Tìm kiếm món ăn..."
                    value={search}
                    onChange={handleSearchChange}
                  />
                </Col>
                <Col md={6} sm={12}>
                  <Input
                    type="select"
                    value={categoryFilter}
                    onChange={handleCategoryFilterChange}
                    disabled={loadingCategories || categories.length === 0}
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Input>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Dish List */}
          <Card className="mb-4">
            <CardBody>
              {loadingDishes ? (
                <div className="text-center my-5">
                  <Spinner color="primary" />
                </div>
              ) : (
                <ListDish
                  paginate={{
                    page: meta.current_page, 
                    perPage: meta.per_page,
                    totalPage: meta.last_page,
                  }}
                  data={dishes}
                  onDelete={handleDeleteClick}
                  onPageChange={handlePageChange}
                  onEdit={handleDishClick}
                  onFeatureToggle={handleFeatureToggle}
                />
              )}
            </CardBody>
          </Card>
        </TabPane>

        <TabPane tabId="trash">
          <ListTrashDish />
        </TabPane>
      </TabContent>

      <ModalDish
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        newDish={newDish}
        setNewDish={setNewDish}
        categories={categories}
        unitOptions={unitOptions}
        onSave={handleSave}
        isEdit={isEdit}
        errors={errors}
      />

      <DeleteModal
        show={deleteModalOpen}
        onDeleteClick={handleDeleteDish}
        onCloseClick={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default DishIndex;