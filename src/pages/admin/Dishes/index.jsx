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
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
} from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import ListDish from "@components/admin/Dishes/ListDish";
import ListTrashDish from "@components/admin/Dishes/ListTrashDish";
import ModalDish from "@components/admin/Dishes/ModalDish";
import DeleteModal from "@components/admin/ui/DeleteModal";
import PaginateUi from "@components/admin/ui/paginateUi";
import SearchAndStatusFilterBar from "@components/admin/ui/SearchAndStatusFilterBar";
import StatusFilterGroup from "@components/admin/ui/StatusFilterGroup";
import { convertTagsToString } from "@helpers/admin/api_helper";
import {
  getDishes,
  createDish,
  updateDish,
  deleteSoftDish,
  getDish,
} from "@services/admin/dishService";
import { getCategories } from "@services/admin/categoryService";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import "./Dishes.scss";

const DishIndex = () => {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingDishes, setLoadingDishes] = useState(true);
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
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [nameFilter, setNameFilter] = useState("");

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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === "list") fetchDishes(currentPage);
  }, [
    currentPage,
    search,
    status,
    categoryFilter,
    activeTab,
    priceFrom,
    priceTo,
    nameFilter,
  ]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setCurrentPage(1);
    fetchDishes(1);
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories({ parent_id: 1 });
      setCategories(res.data.data.items || []);
    } catch {
      toast.error("Lỗi khi tải danh sách danh mục!");
      setCategories([]);
    }
  };

  const fetchDishes = async (page = 1) => {
    setLoadingDishes(true);
    try {
      const params = {
        page,
        per_page: 10,
        name: nameFilter || undefined,
        category_id: categoryFilter || undefined,
        status: status !== "all" ? status : undefined,
        price_from: priceFrom || undefined,
        price_to: priceTo || undefined,
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
    } catch {
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
        v.split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
          .forEach((tag) => formData.append("tags[]", tag));
      } else if (k === "image" && v instanceof File) {
        formData.append("image_url", v);
      } else {
        formData.append(k, v);
      }
    });

    try {
      isEdit
        ? await updateDish(editDishId, formData)
        : await createDish(formData);
      toast.success(
        isEdit ? "Cập nhật món ăn thành công!" : "Thêm món ăn thành công!"
      );
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
    Swal.fire({
      title: "Xóa món ăn?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
    }).then((res) => {
      if (res.isConfirmed) {
        setDeleteDishId(id);
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
    } catch {
      toast.error("Lỗi khi xóa món ăn!");
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
      setStatus("all");
      setCategoryFilter("");
      setCurrentPage(1);
      if (tab === "list") fetchDishes(1);
    }
  };

  return (
    <div className="page-content">
      <Breadcrumbs
        title="Quản Lý Món Ăn"
        breadcrumbItem={activeTab === "list" ? "Danh sách món ăn" : "Thùng rác"}
      />

      <Card className="mb-4">
        <CardHeader className="bg-white border-bottom-0">
          <Nav tabs>
            <NavItem>
              <NavLink
                className={activeTab === "list" ? "active" : ""}
                onClick={() => toggleTab("list")}
              >
                Danh sách món ăn
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
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
                <Col
                  md={7}
                  sm={12}
                  className="mb-2 mb-md-0 d-flex align-items-center"
                >
                  <StatusFilterGroup
                    options={statusOptions.map((opt) => ({
                      ...opt,
                      badgeCount:
                        opt.value === "all"
                          ? meta.total
                          : dishes.filter((d) => d.status === opt.value).length,
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
                      resetNewDish();
                      setModalOpen(true);
                    }}
                  >
                    <i className="mdi mdi-plus" /> Thêm mới món ăn
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
                statusValue={status}
                onStatusChange={handleStatusChange}
                statusOptions={statusOptions}
                searchPlaceholder="Tìm kiếm món ăn..."
                statusPlaceholder="Tất cả trạng thái"
                rightContent={
                  <Button
                    color="light"
                    className="border"
                    style={{ minWidth: 140 }}
                    onClick={() => setShowAdvancedFilter(true)}
                  >
                    <i className="mdi mdi-filter-variant me-1"></i> Lọc nâng cao
                  </Button>
                }
              />
            </CardHeader>
          </Card>

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
                  onPageChange={setCurrentPage}
                  onEdit={handleDishClick}
                />
              )}
            </CardBody>
          </Card>

          <PaginateUi
            currentPage={meta.current_page}
            totalPages={meta.last_page}
            onPageChange={setCurrentPage}
          />
        </TabPane>

        <TabPane tabId="trash">
          <ListTrashDish />
        </TabPane>
      </TabContent>
      <Offcanvas
        direction="end"
        isOpen={showAdvancedFilter}
        toggle={() => setShowAdvancedFilter(false)}
      >
        <OffcanvasHeader toggle={() => setShowAdvancedFilter(false)}>
          Lọc nâng cao
        </OffcanvasHeader>
        <OffcanvasBody>
          <div>
            <h6>Lọc theo giá:</h6>
            <Input
                type="number"
                placeholder="Giá từ..."
                className="mb-2"
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
            />
            <Input
                type="number"
                placeholder="...đến"
                className="mb-3"
                value={priceTo}
                onChange={(e) => setPriceTo(e.target.value)}
            />

            <h6>Lọc theo tên món ăn:</h6>
            <Input
                type="text"
                className="mb-3"
                placeholder="Nhập tên món ăn..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
            />

          </div>
        </OffcanvasBody>

      </Offcanvas>

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
