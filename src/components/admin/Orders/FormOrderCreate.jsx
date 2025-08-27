import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Input,
  Label,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import CustomPaginate from "@components/admin/ui/CustomPaginate";
import { getDishes } from "@services/admin/dishService";
import "./FormOrder.scss";
import { FaEdit, FaShoppingCart } from "react-icons/fa";
import { getTables } from "@services/admin/tableService";
import { getTableAreas } from "@services/admin/tableAreaService";
import { createOrder } from "@services/admin/orderService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dishDefaultImg from "@assets/admin/images/dish/dish-default.webp";
import { formatPriceToVND } from "@helpers/formatPriceToVND";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import CardTable from "../Table/CardTable";
import { getCombos } from "@services/admin/comboService";
import Switch from "react-switch";
import { Tooltip } from "reactstrap";
import { getCategories } from "@services/admin/categoryService";

const FormOrderCreate = () => {
  const [orderItems, setOrderItems] = useState([]);
  const [orderNotes, setOrderNotes] = useState("");
  const [orderMethod, setOrderMethod] = useState("Dine In");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [priority] = useState(false);
  const [selectedTables, setSelectedTables] = useState([]); // [{id, table_number, ...}]
  const [dishes, setDishes] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [meta, setMeta] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPage: 1,
  });
  const fullUrl = `http://localhost:8000/storage/`;

  const [currentPage, setCurrentPage] = useState(1);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editNote, setEditNote] = useState(false);
  const [tempNote, setTempNote] = useState(orderNotes);
  const [tableList, setTableList] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [tableAreas, setTableAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [activeTab, setActiveTab] = useState("dishes");
  const [combos, setCombos] = useState([]);
  const [loadingCombos, setLoadingCombos] = useState(false);
  const [comboSearch, setComboSearch] = useState("");
  const [comboCategoryFilter, setComboCategoryFilter] = useState("");
  const [comboMeta, setComboMeta] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPage: 1,
  });
  const [comboCurrentPage, setComboCurrentPage] = useState(1);
  const [selectedAreaIdFromTables, setSelectedAreaIdFromTables] =
    useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === "dishes") fetchDishes(currentPage);
    if (activeTab === "combos") fetchCombos(comboCurrentPage);
  }, [
    activeTab,
    currentPage,
    search,
    categoryFilter,
    comboCurrentPage,
    comboSearch,
    comboCategoryFilter,
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const params = { parent_id: 1 };
        const res = await getCategories(params);
        const fetchedCategories = res.data?.data?.items || [];
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error.response || error);
        setCategories([]);
        toast.error("Lỗi khi tải danh sách danh mục!");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const fetchDishes = async (page = 1) => {
    setLoadingDishes(true);
    try {
      const params = {
        page,
        per_page: 10,
        name: search || undefined,
        category_id: categoryFilter || undefined,
      };

      const res = await getDishes(params);
      const items = res.data?.data?.items;
      if (Array.isArray(items)) {
        setDishes(items);
        setMeta(res.data.data.meta);
        setCurrentPage(res.data.data.meta.page || 1);
      } else {
        setDishes([]);
        setMeta({
          page: 1,
          perPage: 10,
          total: 0,
          totalPage: 1,
        });
        toast.error("Cấu trúc dữ liệu API không đúng!");
      }
    } catch (error) {
      console.error("Error fetching dishes:", error.response || error);
      setDishes([]);
      setMeta({
        page: 1,
        perPage: 10,
        total: 0,
        totalPage: 1,
      });
      toast.error("Lỗi khi tải danh sách món ăn!");
    } finally {
      setLoadingDishes(false);
    }
  };

  const fetchCombos = async (page = 1) => {
    setLoadingCombos(true);
    try {
      const params = {
        page,
        per_page: 10,
        search: comboSearch || undefined,
        category_id: comboCategoryFilter || undefined,
      };
      const res = await getCombos(params);
      const items = res.data?.data?.items;
      if (Array.isArray(items)) {
        setCombos(items);
        setComboMeta(res.data.data.meta);
        setComboCurrentPage(res.data.data.meta.page || 1);
      } else {
        setCombos([]);
        setComboMeta({ page: 1, perPage: 10, total: 0, totalPage: 1 });
        toast.error("Cấu trúc dữ liệu API combo không đúng!");
      }
    } catch {
      setCombos([]);
      setComboMeta({ page: 1, perPage: 10, total: 0, totalPage: 1 });
      toast.error("Lỗi khi tải danh sách combo!");
    } finally {
      setLoadingCombos(false);
    }
  };

  const addToOrder = (item, isCombo = false) => {
    setOrderItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) =>
        isCombo ? i.combo_id === item.id : i.id === item.id && !i.combo_id
      );
      if (existingIndex !== -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingIndex].quantity += 1;
        return updatedItems;
      } else {
        return [
          ...prevItems,
          {
            ...item,
            quantity: 1,
            price: item.selling_price ?? item.price ?? 0,
            combo_id: isCombo ? item.id : null,
            is_priority: 0,
            kitchen_status: "pending",
          },
        ];
      }
    });
  };

  const updateQuantity = (id, quantity, comboId = null) => {
    setOrderItems((prevItems) => {
      if (quantity <= 0) {
        if (comboId) {
          // Nếu là combo, chỉ xóa combo có combo_id tương ứng
          return prevItems.filter((item) => !(item.combo_id === comboId));
        } else {
          // Nếu là món ăn thường, chỉ xóa món có id tương ứng và không phải là combo
          return prevItems.filter(
            (item) => !(item.id === id && !item.combo_id)
          );
        }
      }
      return prevItems.map((item) =>
        comboId
          ? item.combo_id === comboId
            ? { ...item, quantity }
            : item
          : item.id === id && !item.combo_id
          ? { ...item, quantity }
          : item
      );
    });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
    // Không cần gọi fetchDishes ở đây vì useEffect sẽ tự động gọi khi search hoặc currentPage thay đổi
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
    // Không cần gọi fetchDishes ở đây vì useEffect sẽ tự động gọi khi categoryFilter hoặc currentPage thay đổi
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= meta.totalPage) {
      setCurrentPage(pageNumber);
      // Không cần gọi fetchDishes ở đây vì useEffect sẽ tự động gọi khi currentPage thay đổi
    }
  };

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const vat = 0; // VAT luôn là 0đ
  const total = subtotal;

  const handleEditTables = () => {
    setShowTableModal(true);
    setLoadingTables(true);
    getTableAreas()
      .then((res) => {
        const areas = (res.data?.data?.items || []).filter(
          (area) => area.status === "active"
        );
        setTableAreas(areas);
        setSelectedArea(areas[0]?.id || null);
      })
      .catch(() => {
        setTableAreas([]);
        toast.error("Lỗi khi tải danh sách khu vực bàn!");
      })
      .finally(() => setLoadingTables(false));
  };

  const handleCloseTableModal = () => setShowTableModal(false);

  const handleTableToggle = (tableId) => {
    const clickedTable = tableList.find(
      (t) => String(t.id) === String(tableId)
    );
    if (!clickedTable || clickedTable.status !== "available") {
      toast.error("Chỉ có thể chọn bàn ở trạng thái Trống.");
      return;
    }

    setSelectedTables((prev) => {
      const existingIndex = prev.findIndex(
        (t) => String(t.id) === String(tableId)
      );

      if (
        prev.length > 0 &&
        String(prev[0].table_area_id) !== String(clickedTable.table_area_id)
      ) {
        // If a table from a different area is selected, clear previous selections and select new one
        toast.info("Bạn chỉ có thể chọn bàn trong cùng một khu vực.");
        return [clickedTable];
      }

      if (existingIndex !== -1) {
        // Deselect if already selected
        const updatedTables = prev.filter(
          (t) => String(t.id) !== String(tableId)
        );
        if (updatedTables.length === 0) {
          setSelectedAreaIdFromTables(null); // Clear selected area if no tables are selected
        }
        return updatedTables;
      } else {
        // Select if not selected and within the same area
        setSelectedAreaIdFromTables(String(clickedTable.table_area_id)); // Set selected area
        return [...prev, clickedTable];
      }
    });
  };

  useEffect(() => {
    if (showTableModal && selectedArea) {
      setLoadingTables(true);
      getTables({ table_area_id: selectedArea })
        .then((res) => {
          setTableList(res.data?.data?.items || []);
        })
        .catch(() => {
          setTableList([]);
          toast.error("Lỗi khi tải danh sách bàn!");
        })
        .finally(() => setLoadingTables(false));
    }
  }, [showTableModal, selectedArea]);

  const getOrderType = (method) => {
    if (method === "Dine In") return "dine-in";
    if (method === "Takeaway") return "takeaway";
    if (method === "Delivery") return "delivery";
    return "dine-in";
  };

  const handleCreateOrder = async () => {
    const payload = {
      order_type: getOrderType(orderMethod),
      tables:
        orderMethod === "Dine In"
          ? selectedTables.map((t) => ({ table_id: Number(t.id) }))
          : [],
      reservation_id: null,
      customer_id: null,
      notes: orderNotes || "",
      delivery_address: orderMethod === "Delivery" ? deliveryAddress || "" : "",
      contact_name: contactName || "",
      contact_email: contactEmail || "",
      contact_phone: contactPhone || "",
      priority: priority ? 1 : 0,
      items: orderItems.map((item) => ({
        dish_id: item.combo_id ? null : Number(item.id),
        combo_id: item.combo_id ? Number(item.combo_id) : null,
        quantity: Number(item.quantity),
        unit_price: Number(item.price),
        is_priority: Number(item.is_priority),
      })),
    };

    console.log("Payload gửi lên:", payload);

    try {
      await createOrder(payload);
      toast.success("Tạo đơn hàng thành công!", {
        autoClose: 2000, // Toast hiển thị trong 2 giây
        onClose: () => {
          navigate("/orders/list"); // Chuyển hướng sau khi toast đóng
        },
      });
    } catch (error) {
      console.error("Error creating order:", error.response || error);
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        Object.values(apiErrors).forEach((messages) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else {
            toast.error(messages);
          }
        });
      } else {
        toast.error(error.response?.data?.message || "Lỗi khi tạo đơn hàng!");
      }
    }
  };

  return (
    <div className="page-content">
      <div className="mb-3">
        <Breadcrumbs
          title="Quản lý đơn hàng"
          breadcrumbItem="Tạo đơn hàng mới"
        />
      </div>
      <Row>
        {/* Product Catalog */}
        <Col md={8}>
          {/* Search & Category Filter */}
          <Row className="align-items-center g-2 mb-3">
            <Col>
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={activeTab === "dishes" ? "active" : ""}
                    onClick={() => setActiveTab("dishes")}
                    style={{ cursor: "pointer" }}
                  >
                    Món ăn
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === "combos" ? "active" : ""}
                    onClick={() => setActiveTab("combos")}
                    style={{ cursor: "pointer" }}
                  >
                    Combo
                  </NavLink>
                </NavItem>
              </Nav>
            </Col>
          </Row>

          {activeTab === "dishes" ? (
            <>
              <Row className="align-items-center g-2 mb-3">
                <Col md={8} sm={12}>
                  <div className="input-group">
                    <span className="input-group-text">Search</span>
                    <Input
                      type="search"
                      placeholder="Tìm kiếm món ăn..."
                      value={search}
                      onChange={handleSearchChange}
                    />
                  </div>
                </Col>
                <Col md={4} sm={12}>
                  <Input
                    type="select"
                    value={categoryFilter}
                    onChange={handleCategoryFilterChange}
                    disabled={loadingCategories}
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

              <Row>
                {loadingDishes ? (
                  <div className="text-center my-5">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  dishes.map((dish) => (
                    <Col md={6} key={dish.id} className="mb-4">
                      <Card className="menu-card d-flex flex-row align-items-stretch shadow-sm border-0">
                        <div className="menu-card-img-block">
                          <img
                            src={
                              dish.image_url
                                ? `${fullUrl}${dish.image_url}`
                                : dishDefaultImg
                            }
                            alt={dish.name}
                            className="menu-card-img"
                          />
                        </div>
                        <CardBody className="d-flex flex-column justify-content-center py-2">
                          <div className="menu-card-title mb-1">
                            {dish.name || "Unnamed Dish"}
                          </div>
                          <div className="menu-card-price mb-2">
                            {formatPriceToVND(dish.selling_price || 0)}
                          </div>
                          <Button
                            color="light"
                            size="sm"
                            className="border menu-card-btn"
                            onClick={() => addToOrder(dish)}
                          >
                            <span className="fw-bold">+</span> Thêm
                          </Button>
                        </CardBody>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>
              {/* Pagination */}
              <div className="d-flex justify-content-center mt-3">
                <CustomPaginate
                  currentPage={currentPage}
                  totalPages={meta.totalPage}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          ) : (
            <>
              <Row className="align-items-center g-2 mb-3">
                <Col md={8} sm={12}>
                  <div className="input-group">
                    <span className="input-group-text">Search</span>
                    <Input
                      type="search"
                      placeholder="Tìm kiếm combo..."
                      value={comboSearch}
                      onChange={(e) => {
                        setComboSearch(e.target.value);
                        setComboCurrentPage(1);
                        // Không cần gọi fetchCombos ở đây vì useEffect sẽ tự động gọi khi comboSearch hoặc comboCurrentPage thay đổi
                      }}
                    />
                  </div>
                </Col>
                <Col md={4} sm={12}>
                  <Input
                    type="select"
                    value={comboCategoryFilter}
                    onChange={(e) => {
                      setComboCategoryFilter(e.target.value);
                      setComboCurrentPage(1);
                      // Không cần gọi fetchCombos ở đây vì useEffect sẽ tự động gọi khi comboCategoryFilter hoặc comboCurrentPage thay đổi
                    }}
                    disabled={loadingCategories}
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
              <Row>
                {loadingCombos ? (
                  <div className="text-center my-5">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  combos.map((combo) => (
                    <Col md={6} key={combo.id} className="mb-4">
                      <Card className="menu-card d-flex flex-row align-items-stretch shadow-sm border-0">
                        <div className="menu-card-img-block">
                          <img
                            src={
                              combo.image_url
                                ? `${fullUrl}${combo.image_url}`
                                : dishDefaultImg
                            }
                            alt={combo.name}
                            className="menu-card-img"
                          />
                        </div>
                        <CardBody className="d-flex flex-column justify-content-center py-2">
                          <div className="menu-card-title mb-1">
                            {combo.name || "Unnamed Combo"}
                          </div>
                          <div className="menu-card-price mb-2">
                            {formatPriceToVND(combo.selling_price || 0)}
                          </div>
                          <Button
                            color="light"
                            size="sm"
                            className="border menu-card-btn"
                            onClick={() => addToOrder(combo, true)}
                          >
                            <span className="fw-bold">+</span> Thêm
                          </Button>
                        </CardBody>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>
              <div className="d-flex justify-content-center mt-3">
                <CustomPaginate
                  currentPage={comboCurrentPage}
                  totalPages={comboMeta.totalPage}
                  onPageChange={(pageNumber) => {
                    if (pageNumber > 0 && pageNumber <= comboMeta.totalPage) {
                      setComboCurrentPage(pageNumber);
                      // Không cần gọi fetchCombos ở đây vì useEffect sẽ tự động gọi khi comboCurrentPage thay đổi
                    }
                  }}
                />
              </div>
            </>
          )}
        </Col>

        {/* Order Summary */}
        <Col md={4} className="order-sidebar">
          <div className="order-sidebar-inner">
            <div className="order-sidebar-header mb-3">
              <div className="order-sidebar-title d-flex align-items-center">
                Tạo đơn hàng mới
              </div>
            </div>
            {/* Thông tin khách hàng */}
            <div className="order-sidebar-section mb-3">
              <Label className="order-sidebar-label mb-2">
                Thông tin khách hàng
              </Label>
              <Row className="mb-2">
                <Col md={6}>
                  <Input
                    type="text"
                    placeholder="Tên khách hàng"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </Col>
                <Col md={6}>
                  <Input
                    type="tel"
                    placeholder="Số điện thoại"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={12}>
                  <Input
                    type="email"
                    placeholder="Email liên hệ"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </Col>
              </Row>
              {orderMethod === "Delivery" && (
                <div className="mt-2">
                  <Input
                    type="textarea"
                    placeholder="Địa chỉ giao hàng"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>
              )}
            </div>
            {/* Chọn bàn, ghi chú, hình thức phục vụ */}
            <div className="order-sidebar-section mb-3">
              {/* Order Method */}
              {orderMethod === "Dine In" && (
                <div className="order-table-box d-flex align-items-center justify-content-between py-2 mb-2">
                  <span>
                    {selectedTables.length > 0 ? (
                      selectedTables
                        .map((t) => `Bàn ${t.table_number}`)
                        .join(", ")
                    ) : (
                      <span className="text-muted">Chưa chọn bàn nào</span>
                    )}
                  </span>
                  <Button
                    color="link"
                    size="sm"
                    style={{ color: "#222" }}
                    onClick={handleEditTables}
                    className="p-0 ms-2"
                    title="Edit tables"
                  >
                    <FaEdit size={18} />
                  </Button>
                  {/* Modal chọn bàn */}
                  <Modal
                    isOpen={showTableModal}
                    toggle={handleCloseTableModal}
                    size="xl"
                    style={{ maxWidth: "80vw" }}
                  >
                    <ModalHeader toggle={handleCloseTableModal}>
                      Chọn bàn
                    </ModalHeader>
                    <ModalBody>
                      <div
                        className="table-area-carousel d-flex align-items-center mb-3"
                        style={{ overflowX: "auto" }}
                      >
                        {tableAreas.map((area) => {
                          const isDisabled =
                            selectedAreaIdFromTables &&
                            String(selectedAreaIdFromTables) !==
                              String(area.id);
                          return (
                            <div
                              key={area.id}
                              className={`table-area-item py-2 me-2 rounded ${
                                selectedArea === area.id ? "active" : ""
                              } ${isDisabled ? "disabled-area" : ""}`}
                              style={{
                                background:
                                  selectedArea === area.id
                                    ? "#556ee6"
                                    : "#f4f4f6",
                                color:
                                  selectedArea === area.id ? "#fff" : "#222",
                                cursor: isDisabled ? "not-allowed" : "pointer",
                                opacity: isDisabled ? 0.6 : 1,
                                minWidth: 120,
                                textAlign: "center",
                                fontWeight: 500,
                                border:
                                  selectedArea === area.id
                                    ? "2px solid #556ee6"
                                    : "2px solid transparent",
                                transition: "all 0.2s",
                              }}
                              onClick={
                                isDisabled
                                  ? null
                                  : () => setSelectedArea(area.id)
                              }
                            >
                              {area.name}
                            </div>
                          );
                        })}
                      </div>
                      <div className="table-modal-list-by-status">
                        {loadingTables ? (
                          <div className="text-center w-100 py-4">
                            <Spinner color="primary" />
                          </div>
                        ) : tableList.length === 0 ? (
                          <div className="text-muted text-center w-100">
                            Không có bàn nào trong khu vực này.
                          </div>
                        ) : (
                          [
                            { key: "available", label: "Trống" },
                            { key: "occupied", label: "Đang sử dụng" },
                            { key: "cleaning", label: "Đang dọn dẹp" },
                            { key: "out_of_service", label: "Ngưng phục vụ" },
                          ].map((statusObj) => {
                            const tables = tableList.filter(
                              (t) => t.status === statusObj.key
                            );
                            return (
                              <div
                                className="table-status-row mb-3"
                                key={statusObj.key}
                              >
                                <div
                                  className="table-status-label mb-1"
                                  style={{ fontWeight: 600 }}
                                >
                                  {statusObj.label}
                                </div>
                                <div
                                  className="table-status-cards-row d-flex flex-row flex-nowrap align-items-center"
                                  style={{
                                    gap: 12,
                                    overflowX: "auto",
                                    minHeight: 48,
                                  }}
                                >
                                  {tables.length === 0 ? (
                                    <span
                                      className="text-muted"
                                      style={{ fontSize: "0.97rem" }}
                                    >
                                      Không có bàn
                                    </span>
                                  ) : (
                                    tables.map((table) => {
                                      const isSelected = selectedTables.some(
                                        (t) => String(t.id) === String(table.id)
                                      );
                                      return (
                                        <div
                                          key={table.id}
                                          className={`table-card-wrapper ${
                                            isSelected ? "selected" : ""
                                          } ${
                                            table.status !== "available"
                                              ? "disabled-table"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            handleTableToggle(String(table.id))
                                          }
                                          style={{
                                            margin: 4,
                                            flex: "0 0 auto",
                                            cursor:
                                              table.status !== "available"
                                                ? "not-allowed"
                                                : "pointer",
                                            opacity:
                                              table.status !== "available"
                                                ? 0.6
                                                : 1,
                                          }}
                                        >
                                          <CardTable
                                            tableId={table.id}
                                            tableNumber={table.table_number}
                                            seatCount={
                                              table.table_type === "2_seats"
                                                ? 2
                                                : table.table_type === "4_seats"
                                                ? 4
                                                : table.table_type === "8_seats"
                                                ? 8
                                                : table.capacity || 4
                                            }
                                            status={table.status}
                                            hideMenu={true}
                                          />
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="primary" onClick={handleCloseTableModal}>
                        Xác nhận
                      </Button>
                    </ModalFooter>
                  </Modal>
                </div>
              )}
              {/* Ghi chú */}
              <div className="order-note-area py-2 mb-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="order-sidebar-label">Ghi chú đơn hàng</div>
                  <Button
                    color="link"
                    size="sm"
                    className="p-0 ms-2"
                    style={{ color: "#222" }}
                    onClick={() => setEditNote(!editNote)}
                    title="Edit note"
                  >
                    <FaEdit size={18} />
                  </Button>
                </div>
                {editNote ? (
                  <Input
                    type="textarea"
                    value={tempNote}
                    onChange={(e) => setTempNote(e.target.value)}
                    rows={2}
                    className="order-sidebar-input"
                    onBlur={() => {
                      setOrderNotes(tempNote);
                      setEditNote(false);
                    }}
                    autoFocus
                  />
                ) : (
                  <div className="text-muted small">
                    {orderNotes ? orderNotes : "Chưa có ghi chú"}
                  </div>
                )}
              </div>
              {/* Hình thức phục vụ */}
              <div className="order-method-row py-2 mb-2">
                <Label className="order-sidebar-label mb-1">
                  Hình thức đơn hàng
                </Label>
                <Input
                  type="select"
                  value={orderMethod}
                  onChange={(e) => setOrderMethod(e.target.value)}
                  className="order-method-select"
                  style={{ width: "100%" }}
                >
                  <option value="Dine In">Ăn tại chỗ</option>
                  <option value="Takeaway">Mang đi</option>
                  <option value="Delivery">Giao hàng</option>
                </Input>
              </div>
            </div>
            {/* Danh sách món ăn */}
            <div className="order-items-detail-box mb-3">
              <div
                className="fw-bold mb-3 px-3 d-flex align-items-center justify-content-between"
                style={{ fontSize: "1.1rem" }}
              >
                <span>Chi tiết đơn hàng ({orderItems.length} món)</span>
                <span id="priority-tooltip" style={{ cursor: "pointer" }}>
                  <i className="fa fa-info-circle text-secondary" />
                </span>
                <Tooltip
                  placement="top"
                  isOpen={tooltipOpen}
                  target="priority-tooltip"
                  toggle={() => setTooltipOpen(!tooltipOpen)}
                >
                  Bật để đánh dấu món ăn này là ưu tiên.
                </Tooltip>
              </div>
              <div className="order-items-list">
                {orderItems.length === 0 ? (
                  <div className="text-muted text-center py-4">
                    <FaShoppingCart size={32} className="mb-2 text-secondary" />
                    <div>Chưa có món nào trong đơn hàng.</div>
                  </div>
                ) : (
                  orderItems.map((item) => (
                    <div
                      className="order-item-row d-flex align-items-center"
                      key={item.id}
                      style={{
                        border: item.is_priority
                          ? "2px solid #dc3545"
                          : "1px solid #dee2e6",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "8px",
                        backgroundColor: item.is_priority
                          ? "#fff5f5"
                          : "transparent",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div className="order-item-img-block me-3">
                        <img
                          src={
                            item.image_url
                              ? `${fullUrl}${item.image_url}`
                              : dishDefaultImg
                          }
                          alt={item.name}
                          className="order-item-img"
                        />
                      </div>
                      <div className="flex-grow-1 d-flex align-items-center">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="fw-bold order-item-title ellipsis-1 mb-1">
                            {item.name}
                          </div>
                          <div className="order-item-price-mult text-muted d-flex align-items-center">
                            <span style={{ width: "60%" }}>
                              {formatPriceToVND(item.price)} đ × {item.quantity}
                            </span>
                            <div className="d-flex align-items-center ms-2">
                              <Switch
                                checked={!!item.is_priority}
                                onChange={(checked) => {
                                  setOrderItems((prevItems) =>
                                    prevItems.map((i) =>
                                      i.id === item.id
                                        ? { ...i, is_priority: checked ? 1 : 0 }
                                        : i
                                    )
                                  );
                                }}
                                onColor="#28a745"
                                offColor="#ccc"
                                onHandleColor="#fff"
                                offHandleColor="#fff"
                                handleDiameter={16}
                                uncheckedIcon={false}
                                checkedIcon={false}
                                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                height={20}
                                width={40}
                                className="react-switch"
                                aria-hidden="true"
                                style={{ verticalAlign: "middle" }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2 ms-3">
                          <Button
                            color="light"
                            size="sm"
                            className="border order-item-qty-btn"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            -
                          </Button>
                          <span className="mx-2 order-item-qty">
                            {item.quantity}
                          </span>
                          <Button
                            color="light"
                            size="sm"
                            className="border order-item-qty-btn"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="order-sidebar-totals mb-3">
              <div className="order-totals-row">
                <span className="order-totals-label">Tạm tính</span>
                <span className="order-totals-value">
                  {formatPriceToVND(subtotal)}
                </span>
              </div>
              <div className="order-totals-row">
                <span className="order-totals-label">VAT</span>
                <span className="order-totals-value">
                  {formatPriceToVND(vat)}
                </span>
              </div>
              <div className="order-totals-row order-totals-total">
                <span className="order-totals-label order-totals-label-total">
                  Tổng cộng
                </span>
                <span className="order-totals-value order-totals-value-total">
                  {formatPriceToVND(total)}
                </span>
              </div>
            </div>
            <div>
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleCreateOrder}
              >
                Lưu lại
              </button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default FormOrderCreate;
