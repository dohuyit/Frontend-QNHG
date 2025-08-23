import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Row,
  Col,
  Spinner,
  Input,
  Badge,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
  Form,
  Button,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import OrderGrid from "@components/admin/Orders/grid-order";
import {
  getListOrders,
  trackOrder,
  countOrder,
} from "@services/admin/orderService";
import Swal from "sweetalert2";
import RealtimeOrderUpdater from "@components/admin/Orders/RealtimeOrderUpdater";
import StatusFilterGroup from "@components/admin/ui/StatusFilterGroup";
import SearchAndStatusFilterBar from "@components/admin/ui/SearchAndStatusFilterBar";
import CustomPaginate from "@components/admin/ui/CustomPaginate";

// Danh sách trạng thái đơn hàng
const orderStatusOptions = [
  { label: "Tất cả", value: "all", badgeColor: "secondary" },
  { label: "Chờ xác nhận", value: "pending", badgeColor: "warning" },
  { label: "Đã xác nhận", value: "confirmed", badgeColor: "info" },
  { label: "Đang chuẩn bị", value: "preparing", badgeColor: "primary" },
  { label: "Sẵn sàng", value: "ready", badgeColor: "success" },
  { label: "Hoàn tất", value: "completed", badgeColor: "success" },
  { label: "Đã hủy", value: "cancelled", badgeColor: "danger" },
];

const OrderIndex = () => {
  const [orderData, setOrderData] = useState({ items: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");
  const [showTrack, setShowTrack] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [trackCode, setTrackCode] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderType, setOrderType] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [orderStatusCounts, setOrderStatusCounts] = useState({});
  // Bộ lọc theo ngày
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const navigate = useNavigate();

  // Lọc dữ liệu theo search và filter (client-side fallback)
  const filteredData = orderData.items.filter((order) => {
    const matchesSearch =
        order.customer?.full_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
        order.customer?.phone_number?.includes(searchTerm) ||
        order.order_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

    // Lọc theo khoảng ngày (client-side fallback nếu backend chưa lọc)
    const orderDate = order.order_time || order.created_at;
    const orderDateStr = orderDate
        ? new Date(orderDate).toISOString().slice(0, 10)
        : "";
    const inFrom = !dateFrom || (orderDateStr && orderDateStr >= dateFrom);
    const inTo = !dateTo || (orderDateStr && orderDateStr <= dateTo);

    return matchesSearch && matchesStatus && inFrom && inTo;
  });

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 10,
        order_type: orderType || undefined,
        order_code: orderCode || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        // Thêm bộ lọc theo ngày - sử dụng đúng tên params backend mong đợi
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const res = await getListOrders(params);
      setOrderData({
        items: res.data.data.items || res.data.items || res.data.data || [],
        meta: {
          current_page: res.data.data.meta?.page || 1,
          per_page: res.data.data.meta?.perPage || 10,
          total: res.data.data.meta?.total || 0,
          last_page: res.data.data.meta?.totalPage || 1,
        },
      });
      setCurrentPage(res.data.data.meta?.page || 1);
    } catch (error) {
      console.error("API ERROR:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải danh sách đơn hàng",
        icon: "error",
        confirmButtonText: "OK",
      });
      setOrderData({ items: [], meta: {} });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStatusCounts = async () => {
    try {
      const res = await countOrder();
      // Thử lấy counts nếu có, nếu không lấy data trực tiếp
      const counts = res.data.data?.counts || res.data.data || {};
      setOrderStatusCounts(counts);
    } catch {
      setOrderStatusCounts({});
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
    fetchOrderStatusCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, orderType, orderCode, statusFilter, dateFrom, dateTo]);

  const handleDelete = async (id) => {
    try {
      setOrderData((prev) => ({
        ...prev,
        items: prev.items.filter((order) => order.id !== id),
      }));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleTrackOrder = async () => {
    if (!trackCode.trim()) {
      Swal.fire({
        title: "Lỗi!",
        text: "Vui lòng nhập mã đơn hàng",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const res = await trackOrder(trackCode);
      setTrackResult(res.data);
    } catch (error) {
      console.error("Track order error:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Không tìm thấy đơn hàng với mã này",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleUpdate = () => {
    fetchOrders(currentPage);
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= orderData.meta.last_page) {
      setCurrentPage(pageNumber);
    }
  };

  const navigateToCreateOrder = () => {
    const initialFormData = {
      order_type: "dine-in",
      table_id: "",
      reservation_id: "",
      customer_id: "",
      notes: "",
      delivery_address: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      items: [],
      tables: [],
    };
    navigate("/orders/form/create", { state: { initialFormData } });
  };

  const handleEditOrder = (orderDetail) => {
    navigate("/orders/form/edit", { state: { orderDetail } });
  };

  return (
      <div className="page-content">
        <Breadcrumbs
            title="Danh sách đơn hàng"
            breadcrumbItem="Quản lí đơn hàng"
        />

        {/* Tabs */}
        <Card className="mb-4">
          <CardHeader className="bg-white border-bottom-0">
            <Row className="align-items-center">
              <Col md="7" sm="12">
                <Nav tabs className="border-0">
                  <NavItem>
                    <NavLink
                        className={`border-0 ${
                            activeTab === "1" ? "active fw-bold" : "text-muted"
                        }`}
                        onClick={() => toggleTab("1")}
                        style={{
                          borderBottom:
                              activeTab === "1" ? "3px solid #556ee6" : "none",
                          padding: "12px 20px",
                          cursor: "pointer",
                        }}
                    >
                      Đơn hàng{" "}
                      <Badge color="primary" className="ms-2" pill>
                        {orderData.items.length}
                      </Badge>
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                        className={`border-0 ${
                            activeTab === "2" ? "active fw-bold" : "text-muted"
                        }`}
                        onClick={() => toggleTab("2")}
                        style={{
                          borderBottom:
                              activeTab === "2" ? "3px solid #556ee6" : "none",
                          padding: "12px 20px",
                          cursor: "pointer",
                        }}
                    >
                      Theo dõi đơn hàng
                    </NavLink>
                  </NavItem>
                </Nav>
              </Col>
            </Row>
          </CardHeader>
        </Card>

        {/* Realtime updater component */}
        <RealtimeOrderUpdater onRefreshData={() => fetchOrders(currentPage)} />

        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            {/* Bộ lọc trạng thái và view switch */}
            <Card className="mb-4">
              <CardHeader className="bg-white border-bottom-0">
                <Row className="align-items-center">
                  <Col
                      md="9"
                      sm="12"
                      className="mb-2 mb-md-0 d-flex align-items-center"
                  >
                    <StatusFilterGroup
                        options={orderStatusOptions.map((opt) => ({
                          ...opt,
                          badgeCount:
                              opt.value === "all"
                                  ? Object.values(orderStatusCounts).reduce(
                                      (a, b) => a + b,
                                      0
                                  )
                                  : orderStatusCounts[opt.value] || 0,
                        }))}
                        value={statusFilter}
                        onChange={(val) => {
                          setStatusFilter(val);
                          setCurrentPage(1);
                        }}
                        className="mb-2"
                    />
                  </Col>
                  <Col
                      md="3"
                      sm="12"
                      className="d-flex justify-content-md-end justify-content-start align-items-center gap-2"
                  >
                    <Button
                        color="success"
                        onClick={navigateToCreateOrder}
                        className="d-flex align-items-center py-2 fs-6"
                        size="sm"
                    >
                      <i className="mdi mdi-plus" /> Tạo mới đơn hàng
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
            </Card>

            {/* Khối tìm kiếm và lọc nâng cao */}
            <Card className="mb-4">
              <CardBody>
                <Row className="align-items-center">
                  <Col md={4}>
                    <div className="input-group">
                    <span className="input-group-text">
                      <i className="mdi mdi-magnify"></i>
                    </span>
                      <Input
                          type="text"
                          placeholder="Tìm kiếm theo mã đơn hàng, tên, SĐT..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                          }}
                      />
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="input-group">
                    <span className="input-group-text">
                      <i className="mdi mdi-calendar"></i>
                    </span>
                      <Input
                          type="date"
                          placeholder="Từ ngày"
                          value={dateFrom}
                          onChange={(e) => {
                            setDateFrom(e.target.value);
                            setCurrentPage(1);
                          }}
                      />
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="input-group">
                    <span className="input-group-text">
                      <i className="mdi mdi-calendar"></i>
                    </span>
                      <Input
                          type="date"
                          placeholder="Đến ngày"
                          value={dateTo}
                          min={dateFrom}
                          onChange={(e) => {
                            setDateTo(e.target.value);
                            setCurrentPage(1);
                          }}
                      />
                    </div>
                  </Col>
                  <Col md={2} className="text-end">
                    <div className="d-flex gap-2 justify-content-end">
                      {(dateFrom || dateTo) && (
                          <Button
                              color="outline-secondary"
                              size="sm"
                              onClick={() => {
                                setDateFrom("");
                                setDateTo("");
                                setCurrentPage(1);
                              }}
                              title="Xóa bộ lọc ngày"
                          >
                            <i className="mdi mdi-close me-1"></i>
                            Xóa ngày
                          </Button>
                      )}
                      <Button
                          color="light"
                          className="border"
                          style={{ minWidth: 140 }}
                          onClick={() => setShowFilter(true)}
                      >
                        <i className="mdi mdi-filter-variant me-1"></i> Lọc nâng
                        cao
                      </Button>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Thông báo khoảng ngày đang lọc */}
            {(dateFrom || dateTo) && (
                <div className="mb-3">
                  <div
                      className="alert alert-info d-flex align-items-center"
                      style={{ fontSize: 14 }}
                  >
                    <i className="mdi mdi-calendar-clock me-2"></i>
                    <div>
                      <strong>Đang lọc theo ngày:</strong>{" "}
                      {dateFrom && dateTo ? (
                          <>
                            Từ{" "}
                            <strong>
                              {new Date(dateFrom).toLocaleDateString("vi-VN")}
                            </strong>{" "}
                            đến{" "}
                            <strong>
                              {new Date(dateTo).toLocaleDateString("vi-VN")}
                            </strong>
                          </>
                      ) : dateFrom ? (
                          <>
                            Từ{" "}
                            <strong>
                              {new Date(dateFrom).toLocaleDateString("vi-VN")}
                            </strong>{" "}
                            trở đi
                          </>
                      ) : (
                          <>
                            Đến{" "}
                            <strong>
                              {new Date(dateTo).toLocaleDateString("vi-VN")}
                            </strong>
                          </>
                      )}
                    </div>
                  </div>
                </div>
            )}

            {/* Danh sách đơn hàng */}
            {loading ? (
                <div className="text-center my-5">
                  <Spinner color="primary" />
                </div>
            ) : (
                <div>
                  <Card>
                    <CardBody>
                      <OrderGrid
                          data={filteredData}
                          onDelete={handleDelete}
                          onUpdate={handleUpdate}
                          onEdit={handleEditOrder}
                      />
                    </CardBody>
                    <CardFooter>
                      {orderData.meta.last_page > 1 && (
                          <div className="d-flex justify-content-center">
                            <CustomPaginate
                                currentPage={orderData.meta.current_page}
                                totalPages={orderData.meta.last_page}
                                onPageChange={handlePageChange}
                            />
                          </div>
                      )}
                    </CardFooter>
                  </Card>
                </div>
            )}
          </TabPane>
        </TabContent>

        {/* Offcanvas bộ lọc */}
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
                  setOrderType("");
                  setOrderCode("");
                  setStatusFilter("all");
                  setDateFrom("");
                  setDateTo("");
                  setCurrentPage(1);
                  fetchOrders(1);
                }}
                title="Làm mới bộ lọc"
            >
              <i className="bi bi-arrow-clockwise"></i>
            </Button>
          </OffcanvasHeader>
        </Offcanvas>

        {/* Modal Theo dõi đơn hàng */}
        <Modal isOpen={showTrack} toggle={() => setShowTrack(false)}>
          <ModalHeader toggle={() => setShowTrack(false)}>
            Theo dõi đơn hàng
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label for="trackCodeModal">Mã đơn hàng</Label>
              <div className="input-group">
                <Input
                    id="trackCodeModal"
                    placeholder="Nhập mã đơn hàng..."
                    value={trackCode}
                    onChange={(e) => setTrackCode(e.target.value)}
                />
                <Button color="primary" onClick={handleTrackOrder}>
                  Search
                </Button>
              </div>
            </FormGroup>

            {trackResult && (
                <div className="mt-3">
                  <h6>Kết quả theo dõi:</h6>
                  <pre>{JSON.stringify(trackResult, null, 2)}</pre>
                </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setShowTrack(false)}>
              Đóng
            </Button>
          </ModalFooter>
        </Modal>
      </div>
  );
};

export default OrderIndex;
