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
  Pagination,
  PaginationItem,
  PaginationLink,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import { getDishes } from "@services/admin/dishService";
import { getTables, getTableStatus } from "@services/admin/tableService";
import { getTableAreas } from "@services/admin/tableAreaService";
import { getOrderDetail, updateOrder, paymentOrder } from "@services/admin/orderService";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEdit, FaShoppingCart } from "react-icons/fa";
import "./FormOrder.scss";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dishDefaultImg from "@assets/admin/images/dish/dish-default.webp";
import { formatPriceToVND } from "@helpers/formatPriceToVND";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import CardTable from "../Table/CardTable";
import { getCombos } from "@services/admin/comboService";
import { Wallet, CreditCard, Scan } from 'lucide-react';
import PaymentModal from "./PaymentModal";

const kitchenStatusBadge = {
  pending: { label: "Chờ bếp", color: "#007bff", bg: "#e3f0ff" },
  preparing: { label: "Đang chuẩn bị", color: "#ffc107", bg: "#fff8e1" },
  ready: { label: "Sẵn sàng", color: "#28a745", bg: "#e6f9ed" },
  cancelled: { label: "Đã hủy", color: "#dc3545", bg: "#fdeaea" },
};

const FormOrderUpdate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderDetail?.id;

  const [orderItems, setOrderItems] = useState([]);
  const [orderNotes, setOrderNotes] = useState("");
  const [orderMethod, setOrderMethod] = useState("Dine In");
  const [orderStatus, setOrderStatus] = useState("pending");
  const [selectedTables, setSelectedTables] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editNote, setEditNote] = useState(false);
  const [tempNote, setTempNote] = useState("");
  const [loadingTables, setLoadingTables] = useState(false);
  const [tableAreas, setTableAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const fullUrl = `http://localhost:8000/storage/`;
  const [activeTab, setActiveTab] = useState("dishes");
  const [combos, setCombos] = useState([]);
  const [loadingCombos, setLoadingCombos] = useState(false);
  const [comboSearch, setComboSearch] = useState("");
  const [comboCategoryFilter, setComboCategoryFilter] = useState("");
  const [comboMeta, setComboMeta] = useState({ current_page: 1, per_page: 10, total: 0, last_page: 1 });
  const [comboCurrentPage, setComboCurrentPage] = useState(1);
  const [removedItems, setRemovedItems] = useState([]);
  const [orderDataState, setOrderDataState] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [tempSelectedTables, setTempSelectedTables] = useState([]);
  const [modalTableList, setModalTableList] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [activeTableId, setActiveTableId] = useState(null); // New state to track the actively selected table

  const statusOptionsMap = {
    "Dine In": [
      { value: "pending", label: "Chờ xác nhận" },
      { value: "confirmed", label: "Đã xác nhận" },
      { value: "preparing", label: "Đang chuẩn bị" },
      { value: "ready", label: "Sẵn sàng" },
      { value: "completed", label: "Hoàn tất" },
      { value: "cancelled", label: "Đã hủy" },
    ],
    Takeaway: [
      { value: "pending", label: "Chờ xác nhận" },
      { value: "confirmed", label: "Đã xác nhận" },
      { value: "preparing", label: "Đang chuẩn bị" },
      { value: "ready", label: "Sẵn sàng" },
      { value: "completed", label: "Hoàn tất" },
      { value: "cancelled", label: "Đã hủy" },
    ],
    Delivery: [
      { value: "pending", label: "Chờ xác nhận" },
      { value: "confirmed", label: "Đã xác nhận" },
      { value: "preparing", label: "Đang chuẩn bị" },
      { value: "ready", label: "Sẵn sàng" },
      { value: "delivering", label: "Đang giao hàng" },
      { value: "completed", label: "Hoàn tất" },
      { value: "cancelled", label: "Đã hủy" },
    ],
  };

  useEffect(() => {
    if (orderId) {
      setLoadingOrder(true);
      getOrderDetail(orderId)
        .then(async (res) => {
          const orderData = res.data.data.order;
          setOrderDataState(orderData);
          setOrderItems(
            orderData.items.map((item) => {
              if (item.combo_id) {
                return {
                  ...item,
                  order_item_id: item.id,
                  id: item.combo_id.id,
                  name: item.combo_id.combo_name || 'Combo không tên',
                  price: item.unit_price || item.price,
                  image_url: item.image_url,
                  combo_id: item.combo_id.id,
                };
              } else {
                return {
                  ...item,
                  order_item_id: item.id,
                  id: item.dish_id?.id || item.id,
                  name: item.dish_id?.name || item.name,
                  price: item.unit_price || item.price,
                  image_url: item.dish_id?.image_url || item.image_url,
                  combo_id: null,
                };
              }
            }) || []
          );
          setOrderNotes(orderData.notes || "");
          setOrderMethod(
            orderData.order_type === "dine-in"
              ? "Dine In"
              : orderData.order_type === "takeaway"
              ? "Takeaway"
              : "Delivery"
          );
          setOrderStatus(orderData.status || "pending");
          setTempNote(orderData.notes || "");
          setDeliveryAddress(orderData.delivery_address || "");
          setContactName(orderData.contact_name || "");
          setContactEmail(orderData.contact_email || "");
          setContactPhone(orderData.contact_phone || "");
          
          if (Array.isArray(orderData.tables) && orderData.tables.length > 0) {
            console.log("Order tables:", orderData.tables);
            const areaId = orderData.tables[0]?.table_area_id;
            if (areaId) {
              setSelectedArea(areaId);
              setLoadingTables(true);
              try {
                const tablesRes = await getTables({
                  table_area_id: areaId,
                });
                const fetchedTables = tablesRes.data?.data?.items || [];
                const mergedTables = [
                  ...orderData.tables,
                  ...fetchedTables.filter(
                    (t) => !orderData.tables.some((ot) => ot.id === t.id)
                  ),
                ];
                console.log("Merged tables:", mergedTables);
                setSelectedTables(mergedTables);
              } catch (e) {
                console.log("Using original tables:", orderData.tables);
                setSelectedTables(orderData.tables);
                console.error("Error loading tables:", e);
              } finally {
                setLoadingTables(false);
              }
            } else {
              console.log("No area ID, using original tables:", orderData.tables);
              setSelectedTables(orderData.tables);
            }
          } else {
            console.log("No tables in order");
            setSelectedTables([]);
          }
        })
        .catch(() => {
          console.error("Error fetching order details");
          toast.error("Lỗi khi tải chi tiết đơn hàng!");
        })
        .finally(() => setLoadingOrder(false));
    }
  }, [orderId]);

  useEffect(() => {
    if (activeTab === "dishes") fetchDishes(currentPage);
    if (activeTab === "combos") fetchCombos(comboCurrentPage);
  }, [activeTab, currentPage, search, categoryFilter, comboCurrentPage, comboSearch, comboCategoryFilter]);

  const fetchDishes = async (page = 1) => {
    setLoadingDishes(true);
    try {
      const params = {
        page,
        per_page: 10,
        search: search || undefined,
        category_id: categoryFilter || undefined,
      };
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
        setDishes([]);
        setMeta({
          current_page: 1,
          per_page: 10,
          total: 0,
          last_page: 1,
        });
        toast.error("Cấu trúc dữ liệu API không đúng!");
      }
    } catch (error) {
      console.error("Error fetching dishes:", error.response || error);
      setDishes([]);
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
        setComboMeta({
          current_page: res.data.data.meta.page || 1,
          per_page: res.data.data.meta.perPage || 10,
          total: res.data.data.meta.total || 0,
          last_page: res.data.data.meta.totalPage || 1,
        });
        setComboCurrentPage(res.data.data.meta.page || 1);
      } else {
        setCombos([]);
        setComboMeta({ current_page: 1, per_page: 10, total: 0, last_page: 1 });
        toast.error("Cấu trúc dữ liệu API combo không đúng!");
      }
    } catch {
      setCombos([]);
      setComboMeta({ current_page: 1, per_page: 10, total: 0, last_page: 1 });
      toast.error("Lỗi khi tải danh sách combo!");
    } finally {
      setLoadingCombos(false);
    }
  };

  const addToOrder = (item, isCombo = false) => {
    setOrderItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) =>
        isCombo ? i.combo_id === item.id : (i.dish_id?.id || i.id) === item.id && !i.combo_id
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
          },
        ];
      }
    });
  };

  const updateQuantity = (id, quantity, comboId = null) => {
    setOrderItems((prevItems) => {
      if (quantity <= 0) {
        const removed = prevItems.find((item) =>
          comboId ? item.combo_id === comboId : (item.dish_id?.id || item.id) === id && !item.combo_id
        );
        if (removed) {
          setRemovedItems((prev) => [
            ...prev.filter((i) => i.order_item_id !== removed.order_item_id),
            { ...removed, quantity: 0 }
          ]);
        }
        return prevItems.filter((item) =>
          comboId ? item.combo_id !== comboId : (item.dish_id?.id || item.id) !== id && !item.combo_id
        );
      }
      return prevItems.map((item) =>
        comboId
          ? item.combo_id === comboId
            ? { ...item, quantity }
            : item
          : (item.dish_id?.id || item.id) === id && !item.combo_id
          ? { ...item, quantity }
          : item
      );
    });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
    fetchDishes(1);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
    fetchDishes(1);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= meta.last_page) {
      setCurrentPage(pageNumber);
    }
  };

  const handleEditTables = () => {
    console.log("Opening modal, selectedTables:", selectedTables);
    
    setTempSelectedTables([...selectedTables]);
    setShowTableModal(true);
    setLoadingTables(true);
    
    getTableAreas()
      .then((res) => {
        const areas = res.data?.data?.items || [];
        const allAreas = [{ id: "selected", name: "Đã chọn" }, ...areas];
        setTableAreas(allAreas);
        setSelectedArea("selected");
        setLoadingTables(false);
      })
      .catch(() => {
        setTableAreas([{ id: "selected", name: "Đã chọn" }]);
        setSelectedArea("selected");
        toast.error("Lỗi khi tải danh sách khu vực bàn!");
        setLoadingTables(false);
      })
      .finally(() => {
        if (selectedTables.length > 0) {
          const firstSelectedTable = selectedTables[0];
          setActiveTableId(firstSelectedTable.id);
          getTableStatus(firstSelectedTable.table_number)
            .then((res) => {
              const tableData = res.data?.data?.table;
              if (tableData && Array.isArray(tableData.tables)) {
                setModalTableList(tableData.tables);
              } else {
                setModalTableList([...selectedTables]);
                toast.error("Không tìm thấy bàn trong khu vực này!");
              }
            })
            .catch(() => {
              setModalTableList([...selectedTables]);
              toast.error("Lỗi khi tải danh sách bàn!");
            })
            .finally(() => setLoadingTables(false));
        } else {
          setModalTableList([]);
          setLoadingTables(false);
        }
      });
  };

  const handleCloseTableModal = () => {
    setShowTableModal(false);
    setTempSelectedTables([]);
    setModalTableList([]);
    setActiveTableId(null);
  };

  const handleTableToggle = (tableId) => {
    console.log("handleTableToggle called with tableId:", tableId);
    const clickedTable = modalTableList.find((t) => String(t.id) === String(tableId));
    if (!clickedTable) {
      toast.error("Không tìm thấy bàn.");
      return;
    }

    const isSelected = tempSelectedTables.some((t) => String(t.id) === String(tableId));

    if (isSelected) {
      setTempSelectedTables((prev) => prev.filter((t) => String(t.id) !== String(tableId)));
      if (String(tableId) === String(activeTableId)) {
        setActiveTableId(null);
        setSelectedArea("selected");
      }
    } else {
      const isOriginalTable = selectedTables.some((t) => String(t.id) === String(tableId));
      if (clickedTable.status !== 'available' && !isOriginalTable && selectedArea !== 'selected') {
        toast.error("Chỉ có thể chọn bàn ở trạng thái Trống.");
        return;
      }
      if (tempSelectedTables.length > 0) {
        const firstTableAreaId = tempSelectedTables[0].table_area_id;
        if (String(firstTableAreaId) !== String(clickedTable.table_area_id)) {
          toast.info("Bạn chỉ có thể chọn bàn trong cùng một khu vực.");
          return;
        }
      }
      setTempSelectedTables((prev) => [...prev, clickedTable]);
      setActiveTableId(tableId);
      setSelectedArea("selected");
    }
  };

  const handleAreaSelect = (areaId) => {
    setSelectedArea(areaId);
    setLoadingTables(true);
    if (areaId === "selected") {
      if (activeTableId) {
        const activeTable = tempSelectedTables.find((t) => String(t.id) === String(activeTableId)) || 
                           selectedTables.find((t) => String(t.id) === String(activeTableId));
        if (activeTable) {
          getTableStatus(activeTable.table_number)
            .then((res) => {
              const tableData = res.data?.data?.table;
              if (tableData && Array.isArray(tableData.tables)) {
                setModalTableList(tableData.tables);
              } else {
                setModalTableList([...tempSelectedTables]);
                toast.error("Không tìm thấy bàn trong khu vực này!");
              }
            })
            .catch(() => {
              setModalTableList([...tempSelectedTables]);
              toast.error("Lỗi khi tải danh sách bàn!");
            })
            .finally(() => setLoadingTables(false));
        } else {
          setModalTableList([...tempSelectedTables]);
          setLoadingTables(false);
        }
      } else {
        setModalTableList([...tempSelectedTables]);
        setLoadingTables(false);
      }
    } else {
      getTables({ table_area_id: areaId })
        .then((res) => {
          const tables = res.data?.data?.items || [];
          setModalTableList(tables);
        })
        .catch(() => {
          setModalTableList([]);
          toast.error("Lỗi khi tải danh sách bàn!");
        })
        .finally(() => setLoadingTables(false));
    }
  };

  useEffect(() => {
    if (showTableModal && selectedArea) {
      setLoadingTables(true);
      if (selectedArea === "selected") {
        if (activeTableId) {
          const activeTable = tempSelectedTables.find((t) => String(t.id) === String(activeTableId)) || 
                             selectedTables.find((t) => String(t.id) === String(activeTableId));
          if (activeTable) {
            getTableStatus(activeTable.table_number)
              .then((res) => {
                const tableData = res.data?.data?.table;
                if (tableData && Array.isArray(tableData.tables)) {
                  setModalTableList(tableData.tables);
                } else {
                  setModalTableList([...tempSelectedTables]);
                  toast.error("Không tìm thấy bàn trong khu vực này!");
                }
              })
              .catch(() => {
                setModalTableList([...tempSelectedTables]);
                toast.error("Lỗi khi tải danh sách bàn!");
              })
              .finally(() => setLoadingTables(false));
          } else {
            setModalTableList([...tempSelectedTables]);
            setLoadingTables(false);
          }
        } else {
          setModalTableList([...tempSelectedTables]);
          setLoadingTables(false);
        }
      } else {
        getTables({ table_area_id: selectedArea })
          .then((res) => {
            const tables = res.data?.data?.items || [];
            setModalTableList(tables);
          })
          .catch(() => {
            setModalTableList([]);
            toast.error("Lỗi khi tải danh sách bàn!");
          })
          .finally(() => setLoadingTables(false));
      }
    }
  }, [showTableModal, selectedArea, activeTableId]);

  const getOrderType = (method) => {
    if (method === "Dine In") return "dine-in";
    if (method === "Takeaway") return "takeaway";
    if (method === "Delivery") return "delivery";
    return "dine-in";
  };

  const subtotal = orderItems.reduce(
    (sum, item) => sum + (item.unit_price || item.price) * item.quantity,
    0
  );
  const vat = 0;
  const total = subtotal;

  const handleUpdateOrder = async () => {
    setIsSubmitting(true);
    try {
      const allItems = [
        ...orderItems,
        ...removedItems
      ];

      const oldTables = Array.isArray(orderDataState?.tables) ? orderDataState.tables : [];
      const newTableIds = selectedTables.map(t => String(t.id));

      let tablesPayload = [];

      if (selectedTables.length > 0) {
        oldTables.forEach(oldTable => {
          if (!newTableIds.includes(String(oldTable.id))) {
            tablesPayload.push({
              old_id_table: Number(oldTable.id),
              status: oldTable.status
            });
          }
        });

        selectedTables.forEach(currentTable => {
          tablesPayload.push({
            new_id_table: Number(currentTable.id),
            status: currentTable.status
          });
        });
      }

      const payload = {
        order_type: getOrderType(orderMethod),
        status: orderStatus,
        notes: orderNotes || "",
        tables: orderMethod === "Dine In" ? tablesPayload : [],
        delivery_address: orderMethod === "Delivery" ? deliveryAddress || "" : "",
        contact_name: contactName || "",
        contact_email: contactEmail || "",
        contact_phone: contactPhone || "",
        items: allItems.map((item) => ({
          id: item.order_item_id,
          dish_id: item.combo_id ? null : (item.dish_id?.id || item.id),
          combo_id: item.combo_id ? Number(item.combo_id) : null,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price || item.price),
        })),
      };

      console.log('Payload gửi lên:', payload);

      await updateOrder(orderId, payload);
      toast.success("Cập nhật đơn hàng thành công!", {
        autoClose: 2000,
        onClose: () => {
          navigate("/orders/list");
        },
      });
    } catch (error) {
      console.error("Error updating order:", error.response || error);
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        const errorMessages = Object.values(apiErrors)
          .map((e) => (Array.isArray(e) ? e.join(", ") : e))
          .join("; ");
        toast.error(errorMessages || "Lỗi khi cập nhật đơn hàng!");
      } else {
        toast.error(error.response?.data?.message || "Lỗi khi cập nhật đơn hàng!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-content">
      <div className="mb-3">
        <Breadcrumbs title="Quản lý đơn hàng" breadcrumbItem="Chỉnh sửa đơn hàng" />
      </div>
      {loadingOrder ? (
        <div className="text-center my-5">
          <Spinner color="primary" />
        </div>
      ) : (
        <Row>
          <Col md={8}>
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
                    >
                      <option value="">Tất cả danh mục</option>
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
                      <Col md={6} key={dish.id} className="mb-3">
                        <Card className="menu-card d-flex flex-row align-items-stretch shadow-sm border-0">
                          <div className="menu-card-img-block">
                            <img
                              src={dish.image_url ? `${fullUrl}${dish.image_url}` : dishDefaultImg}
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
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <PaginationItem disabled={currentPage === 1}>
                      <PaginationLink
                        previous
                        onClick={() => handlePageChange(currentPage - 1)}
                      />
                    </PaginationItem>
                    {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page} active={page === currentPage}>
                          <PaginationLink onClick={() => handlePageChange(page)}>
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem disabled={currentPage === meta.last_page}>
                      <PaginationLink
                        next
                        onClick={() => handlePageChange(currentPage + 1)}
                      />
                    </PaginationItem>
                  </Pagination>
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
                        onChange={e => { setComboSearch(e.target.value); setComboCurrentPage(1); fetchCombos(1); }}
                      />
                    </div>
                  </Col>
                  <Col md={4} sm={12}>
                    <Input
                      type="select"
                      value={comboCategoryFilter}
                      onChange={e => { setComboCategoryFilter(e.target.value); setComboCurrentPage(1); fetchCombos(1); }}
                    >
                      <option value="">Tất cả danh mục</option>
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
                              src={combo.image_url ? `${fullUrl}${combo.image_url}` : dishDefaultImg}
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
                  <Pagination>
                    <PaginationItem disabled={comboCurrentPage === 1}>
                      <PaginationLink previous onClick={() => setComboCurrentPage(comboCurrentPage - 1)} />
                    </PaginationItem>
                    {Array.from({ length: comboMeta.last_page }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page} active={page === comboCurrentPage}>
                        <PaginationLink onClick={() => setComboCurrentPage(page)}>{page}</PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem disabled={comboCurrentPage === comboMeta.last_page}>
                      <PaginationLink next onClick={() => setComboCurrentPage(comboCurrentPage + 1)} />
                    </PaginationItem>
                  </Pagination>
                </div>
              </>
            )}
          </Col>

          <Col md={4} className="order-sidebar">
            <div className="order-sidebar-inner">
              <div className="order-sidebar-header mb-3">
                <div className="order-sidebar-title d-flex align-items-center">
                  Chỉnh sửa đơn hàng
                </div>
              </div>
              
              <div className="order-sidebar-section mb-3">
                <Label className="order-sidebar-label mb-2">Thông tin khách hàng</Label>
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
              
              <div className="order-sidebar-section mb-3">
                {orderMethod === "Dine In" && (
                  <div className="order-table-box d-flex align-items-center justify-content-between py-2 mb-2">
                    <span>
                      {selectedTables.length > 0 ? (
                        selectedTables.map((t) => `Bàn ${t.table_number}`).join(", ")
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
                    <Modal
                      isOpen={showTableModal}
                      toggle={handleCloseTableModal}
                      size="xl"
                      style={{ maxWidth: '80vw' }}
                    >
                      <ModalHeader toggle={handleCloseTableModal}>
                        <div className="d-flex justify-content-between align-items-center w-100">
                          <span>Chọn bàn</span>
                          {tempSelectedTables.length > 0 && (
                            <Button
                            className="ms-3"
                              color="outline-danger"
                              size="sm"
                              onClick={() => setTempSelectedTables([])}
                            >
                              Bỏ chọn tất cả
                            </Button>
                          )}
                        </div>
                      </ModalHeader>
                      <ModalBody>
                        <div
                          className="table-area-carousel d-flex align-items-center mb-3"
                          style={{ overflowX: "auto" }}
                        >
                          {tableAreas.map((area) => {
                            const hasAvailable = modalTableList.some(
                              (t) => t.table_area_id === area.id && t.status === 'available'
                            );
                            const isDisabled = tempSelectedTables.length > 0 && tempSelectedTables[0].table_area_id !== area.id && area.id !== "selected";
                            
                            return (
                              <div
                                key={area.id}
                                className={`table-area-item py-2 me-2 rounded ${
                                  selectedArea === area.id ? "active" : ""
                                } ${isDisabled ? "disabled" : ""}`}
                                style={{
                                  background: selectedArea === area.id ? "#556ee6" : "#f4f4f6",
                                  color: selectedArea === area.id ? "#fff" : isDisabled ? "#999" : "#222",
                                  cursor: isDisabled ? "not-allowed" : "pointer",
                                  minWidth: 120,
                                  textAlign: "center",
                                  fontWeight: 500,
                                  border: selectedArea === area.id ? "2px solid #556ee6" : "2px solid transparent",
                                  transition: "all 0.2s",
                                  position: 'relative',
                                  opacity: isDisabled ? 0.6 : 1,
                                }}
                                onClick={() => !isDisabled && handleAreaSelect(area.id)}
                              >
                                {area.name}
                                {hasAvailable && (
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      width: 10,
                                      height: 10,
                                      background: '#28a745',
                                      borderRadius: '50%',
                                      marginLeft: 8,
                                      verticalAlign: 'middle',
                                    }}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="table-modal-list-by-status">
                          {loadingTables ? (
                            <div className="text-center w-100 py-4">
                              <Spinner color="primary" />
                            </div>
                          ) : modalTableList.length === 0 ? (
                            <div className="text-muted text-center w-100">
                              Không có bàn nào trong khu vực này.
                            </div>
                          ) : (
                            [
                              { key: 'available', label: 'Trống' },
                              { key: 'occupied', label: 'Đang sử dụng' },
                              { key: 'cleaning', label: 'Đang dọn dẹp' },
                              { key: 'out_of_service', label: 'Ngưng phục vụ' },
                            ].map(statusObj => {
                              const tables = modalTableList.filter(t => t.status === statusObj.key);
                              if (tables.length === 0) return null;
                              return (
                                <div className="table-status-row mb-3" key={statusObj.key}>
                                  <div className="table-status-label mb-1" style={{ fontWeight: 600 }}>{statusObj.label}</div>
                                  <div className="table-status-cards-row d-flex flex-row flex-nowrap align-items-center" style={{ gap: 12, overflowX: 'auto', minHeight: 48 }}>
                                    {tables.map(table => {
                                      const isSelected = tempSelectedTables.some((t) => String(t.id) === String(table.id));
                                      const isAllArea = selectedArea === 'selected';
                                      const canClick = isAllArea || isSelected || table.status === 'available';
                                      
                                      return (
                                        <div
                                          key={table.id}
                                          className={`table-card-wrapper ${isSelected ? "selected" : ""}`}
                                          onClick={canClick ? () => handleTableToggle(String(table.id)) : undefined}
                                          style={{
                                            margin: 4,
                                            flex: '0 0 auto',
                                            cursor: canClick ? 'pointer' : 'not-allowed',
                                            opacity: canClick ? 1 : 0.6,
                                            border: isSelected ? '2px solid #007bff' : '1px solid #dee2e6',
                                            backgroundColor: isSelected ? '#e3f0ff' : 'transparent',
                                          }}
                                        >
                                          <CardTable
                                            tableId={table.id}
                                            tableNumber={table.table_number}
                                            seatCount={
                                              table.table_type === '2_seats' ? 2 :
                                              table.table_type === '4_seats' ? 4 :
                                              table.table_type === '8_seats' ? 8 :
                                              table.capacity || 4
                                            }
                                            status={table.status}
                                            hideMenu={true}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </ModalBody>
                      <ModalFooter>
                        <Button color="secondary" onClick={handleCloseTableModal}>
                          Hủy
                        </Button>
                        <Button 
                          color="primary" 
                          onClick={() => {
                            setSelectedTables([...tempSelectedTables]);
                            setShowTableModal(false);
                            setTempSelectedTables([]);
                            setModalTableList([]);
                            setActiveTableId(null);
                          }}
                        >
                          Xác nhận
                        </Button>
                      </ModalFooter>
                    </Modal>
                  </div>
                )}
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
                <div className="order-method-row py-2 mb-2">
                  <Label className="order-sidebar-label mb-1">Hình thức đơn hàng</Label>
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
                <div className="order-status-row py-2 mb-2">
                  <Label className="order-sidebar-label mb-1">
                    Trạng thái đơn hàng
                  </Label>
                  <Input
                    type="select"
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="order-status-select"
                    style={{ width: "100%" }}
                  >
                    {(statusOptionsMap[orderMethod] || []).map((opt, idx, arr) => {
                      const currentIdx = arr.findIndex(o => o.value === orderStatus);
                      const isNext = idx === currentIdx + 1;
                      const isCurrent = idx === currentIdx;

                      let shouldBeDisabled = false;

                      if (orderMethod === "Dine In" && (opt.value === "ready" || opt.value === "completed")) {
                          shouldBeDisabled = true;
                      } else if (opt.value === "cancelled") {
                          if (orderStatus !== "pending") {
                              shouldBeDisabled = true;
                          }
                      } else {
                          shouldBeDisabled = !(isCurrent || isNext);
                      }

                      return (
                        <option
                          key={opt.value}
                          value={opt.value}
                          disabled={shouldBeDisabled}
                        >
                          {opt.label}
                        </option>
                      );
                    })}
                  </Input>
                </div>
              </div>
              <div className="order-items-detail-box mb-3">
                <div className="fw-bold mb-3 px-3" style={{ fontSize: "1.1rem" }}>
                  Chi tiết đơn hàng ({orderItems.length} món)
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
                        key={item.combo_id ? `combo-${item.combo_id}` : item.dish_id?.id || item.id}
                      >
                        <div className="order-item-img-block me-3">
                          <img
                            src={item.image_url ? `${fullUrl}${item.image_url}` : dishDefaultImg}
                            alt={item.combo_id ? (item.name || 'Combo không tên') : (item.name || 'Món ăn không tên')}
                            className="order-item-img"
                          />
                        </div>
                        <div className="flex-grow-1 d-flex align-items-center">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="fw-bold order-item-title ellipsis-1 mb-1">
                              {item.combo_id ? (item.name || 'Combo không tên') : (item.name || 'Món ăn không tên')}
                            </div>
                            <div className="order-item-price-mult text-muted">
                              {formatPriceToVND(item.unit_price || item.price)} × {item.quantity}
                            </div>
                            {item.kitchen_status && (
                              (() => {
                                const badge = kitchenStatusBadge[item.kitchen_status] || { label: item.kitchen_status, color: '#6c757d', bg: '#f8f9fa' };
                                return (
                                  <span
                                    className="badge"
                                    style={{
                                      backgroundColor: badge.bg,
                                      color: badge.color,
                                      fontWeight: 500,
                                      fontSize: 13,
                                      padding: '4px 10px',
                                      borderRadius: 8,
                                      marginTop: 4,
                                      display: 'inline-block',
                                      border: `1px solid ${badge.color}`,
                                    }}
                                  >
                                    {badge.label}
                                  </span>
                                );
                              })()
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-2 ms-3">
                            <Button
                              color="light"
                              size="sm"
                              className="border order-item-qty-btn"
                              onClick={() =>
                                updateQuantity(
                                  item.combo_id ? null : (item.dish_id?.id || item.id),
                                  item.quantity - 1,
                                  item.combo_id ? item.combo_id : null
                                )
                              }
                              disabled={typeof item.kitchen_status !== 'undefined' && item.kitchen_status !== 'pending'}
                            >
                              -
                            </Button>
                            <span className="mx-2 order-item-qty">{item.quantity}</span>
                            <Button
                              color="light"
                              size="sm"
                              className="border order-item-qty-btn"
                              onClick={() =>
                                updateQuantity(
                                  item.combo_id ? null : (item.dish_id?.id || item.id),
                                  item.quantity + 1,
                                  item.combo_id ? item.combo_id : null
                                )
                              }
                              disabled={typeof item.kitchen_status !== 'undefined' && item.kitchen_status !== 'pending'}
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
                  <span className="order-totals-value">{formatPriceToVND(subtotal)}</span>
                </div>
                <div className="order-totals-row">
                  <span className="order-totals-label">VAT</span>
                  <span className="order-totals-value">{formatPriceToVND(vat)}</span>
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
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={handleUpdateOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner size="sm" /> : "Lưu lại"}
                </button>
                <button
                  type="button"
                  className="btn btn-danger w-100"
                  onClick={() => setShowPaymentModal(true)}
                  disabled={isSubmitting}
                >
                  Lưu & Thanh toán
                </button>
              </div>
              <PaymentModal
                isOpen={showPaymentModal}
                toggle={() => setShowPaymentModal(false)}
                orderItems={orderItems}
                subtotal={subtotal}
                vat={vat}
                total={total}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                orderMethod={orderMethod}
                selectedTables={selectedTables}
                tableAreas={tableAreas}
                selectedPaymentMethod={selectedPaymentMethod}
                setSelectedPaymentMethod={setSelectedPaymentMethod}
                fullUrl={fullUrl}
                orderId={orderId}
                paymentOrder={paymentOrder}
                navigate={navigate}
                toast={toast}
                orderNotes={orderNotes}
                orderData={orderDataState}
              />
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default FormOrderUpdate;