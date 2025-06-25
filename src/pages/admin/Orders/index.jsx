import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
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
  FormGroup,
  Label,
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
  Form,
  ModalFooter,
  Button,
} from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import OrderGrid from "@components/admin/Orders/grid-order";
import ModalOrder from "@components/admin/Orders/ModalOrder"; // Import the new component
import { getListOrders, createOrder, trackOrder } from "@services/admin/orderService";
import Swal from "sweetalert2";

// Danh sách trạng thái đơn hàng
const orderStatusOptions = [
  { label: "Tất cả", value: "all", badgeColor: "secondary" },
  { label: "Chờ xác nhận", value: "pending_confirmation", badgeColor: "warning" },
  { label: "Đã xác nhận", value: "confirmed", badgeColor: "info" },
  { label: "Đang chế biến", value: "preparing", badgeColor: "primary" },
  { label: "Sẵn sàng", value: "ready", badgeColor: "success" },
  { label: "Đã giao", value: "delivered", badgeColor: "success" },
  { label: "Đã hủy", value: "cancelled", badgeColor: "danger" },
  { label: "Hoàn thành", value: "completed", badgeColor: "info" },
];

const OrderIndex = () => {
  const [orderData, setOrderData] = useState({ items: [], meta: {} });
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");
  const [showCreate, setShowCreate] = useState(false); // Added missing state
  const [showTrack, setShowTrack] = useState(false);
  const [showFilter, setShowFilter] = useState(false); // Added for offcanvas filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [trackCode, setTrackCode] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [createForm, setCreateForm] = useState({
    order_type: "dine-in",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    table_id: "",
    notes: "",
    items: [],
    delivery_address: "",
    delivery_contact_name: "",
    delivery_contact_phone: "",
  });
  const [currentPage, setCurrentPage] = useState(1); // Added for pagination

  // Lọc dữ liệu theo search và filter
  const filteredData = orderData.items.filter((order) => {
    const matchesSearch =
      order.customer?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.customer?.phone_number?.includes(searchTerm) ||
      order.order_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 10,
        search: searchTerm || undefined,
      };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const res = await getListOrders(params);
      console.log("API SUCCESS:", res.data);
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

  const fetchMenuItems = async () => {
    try {
      // Implement fetch menu items API
      setMenuItems([
        { id: 1, name: "Phở bò", price: 50000 },
        { id: 2, name: "Cơm tấm", price: 35000 },
        { id: 3, name: "Bún chả", price: 40000 },
      ]);
    } catch (error) {
      console.error("API ERROR:", error);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
    fetchMenuItems();
  }, [currentPage, searchTerm, statusFilter]);

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

  const handleCreate = async (payload) => {
    try {
      await createOrder(payload);
      fetchOrders(currentPage);
    } catch (error) {
      throw error; // Let ModalOrder handle the error display
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

  return (
    <div className="page-content">
      <Breadcrumbs title="Danh sách đơn hàng" breadcrumbItem="Quản lí đơn hàng" />

      {/* Tabs */}
      <Card className="mb-4">
        <CardHeader className="bg-white border-bottom-0">
          <Row className="align-items-center">
            <Col md="7" sm="12">
              <Nav tabs className="border-0">
                <NavItem>
                  <NavLink
                    className={`border-0 ${activeTab === "1" ? "active fw-bold" : "text-muted"}`}
                    onClick={() => toggleTab("1")}
                    style={{
                      borderBottom: activeTab === "1" ? "3px solid #556ee6" : "none",
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
                    className={`border-0 ${activeTab === "2" ? "active fw-bold" : "text-muted"}`}
                    onClick={() => toggleTab("2")}
                    style={{
                      borderBottom: activeTab === "2" ? "3px solid #556ee6" : "none",
                      padding: "12px 20px",
                      cursor: "pointer",
                    }}
                  >
                    Theo dõi đơn hàng
                  </NavLink>
                </NavItem>
              </Nav>
            </Col>
            <Col
              md="5"
              sm="12"
              className="d-flex justify-content-md-end justify-content-start align-items-center gap-2"
            >
              <Button
                color="success"
                onClick={() => {
                  setCreateForm({ ...createForm, items: [] }); // Reset items
                  setShowCreate(true); // Open the modal
                }}
                className="d-flex align-items-center"
                size="sm"
              >
                <span className="me-1">Receipt</span> Tạo đơn hàng
              </Button>
              <Button
                color="info"
                onClick={() => setShowTrack(true)}
                className="d-flex align-items-center"
                size="sm"
              >
                <span className="me-1">Search</span> Theo dõi
              </Button>
            </Col>
          </Row>
        </CardHeader>
      </Card>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          {/* Bộ lọc trạng thái và view switch */}
          <Card className="mb-4">
            <CardHeader className="bg-white border-bottom-0">
              <Row className="align-items-center">
                <Col
                  md="7"
                  sm="12"
                  className="mb-2 mb-md-0 d-flex align-items-center"
                >
                  <div style={{ display: "flex" }}>
                    {orderStatusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        style={{
                          background: "none",
                          border: "none",
                          padding: "8px 24px",
                          fontWeight: 400,
                          color: "#333",
                          borderBottom:
                            statusFilter === opt.value
                              ? `3px solid #${opt.badgeColor}`
                              : "3px solid transparent",
                          fontSize: 16,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onClick={() => {
                          setStatusFilter(opt.value);
                          setCurrentPage(1); // Reset to first page on filter change
                        }}
                      >
                        {opt.label}
                        <Badge
                          color={opt.badgeColor}
                          pill
                          className="ms-2"
                          style={{ fontSize: 13, minWidth: 28 }}
                        >
                          {filteredData.filter(
                            (item) =>
                              opt.value === "all" || item.status === opt.value
                          ).length}
                        </Badge>
                      </button>
                    ))}
                  </div>
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
                    <span className="input-group-text">Search</span>
                    <Input
                      type="text"
                      placeholder="Tìm kiếm theo mã đơn hàng, tên, SĐT..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page on search
                      }}
                    />
                  </div>
                </Col>
                <Col md={3}>
                  <div className="input-group">
                    <span className="input-group-text">Filter</span>
                    <Input
                      type="select"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1); 
                      }}
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="pending_confirmation">Chờ xác nhận</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="preparing">Đang chế biến</option>
                      <option value="ready">Sẵn sàng</option>
                      <option value="delivered">Đã giao</option>
                      <option value="cancelled">Đã hủy</option>
                      <option value="completed">Hoàn thành</option>
                    </Input>
                  </div>
                </Col>
                <Col md={5} className="d-flex justify-content-md-end justify-content-start">
                  <Button
                    color="light"
                    className="border"
                    style={{ minWidth: 140 }}
                    onClick={() => setShowFilter(true)}
                  >
                    <span className="me-1">Advanced Filter</span>
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Danh sách đơn hàng */}
          {loading ? (
            <div className="text-center my-5">
              <Spinner color="primary" />
            </div>
          ) : (
            <OrderGrid
              data={filteredData}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              menuItems={menuItems}
              paginate={{
                page: orderData.meta.current_page,
                perPage: orderData.meta.per_page,
                totalPage: orderData.meta.last_page,
              }}
              onPageChange={handlePageChange}
            />
          )}
        </TabPane>

        <TabPane tabId="2">
          {/* Theo dõi đơn hàng */}
          <Card className="mb-4">
            <CardHeader className="bg-white border-bottom-0">
              <Row className="align-items-center">
                <Col>
                  <h5 className="mb-0 text-info">
                    <span className="me-2">Search</span> Theo dõi đơn hàng
                  </h5>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="trackCode">Mã đơn hàng</Label>
                    <div className="input-group">
                      <Input
                        id="trackCode"
                        placeholder="Nhập mã đơn hàng..."
                        value={trackCode}
                        onChange={(e) => setTrackCode(e.target.value)}
                      />
                      <Button color="primary" onClick={handleTrackOrder}>
                        Search
                      </Button>
                    </div>
                  </FormGroup>
                </Col>
              </Row>

              {trackResult && (
                <Card className="mt-3">
                  <CardBody>
                    <h6>Kết quả theo dõi:</h6>
                    <pre>{JSON.stringify(trackResult, null, 2)}</pre>
                  </CardBody>
                </Card>
              )}
            </CardBody>
          </Card>
        </TabPane>
      </TabContent>

      {/* Offcanvas bộ lọc */}
      <Offcanvas
        direction="end"
        isOpen={showFilter}
        toggle={() => setShowFilter(false)}
      >
        <OffcanvasHeader toggle={() => setShowFilter(false)}>
          Bộ lọc nâng cao
        </OffcanvasHeader>
        <OffcanvasBody>
          <Form>
            <FormGroup>
              <Label for="filterCustomerName">Tên khách hàng</Label>
              <Input
                id="filterCustomerName"
                placeholder="Nhập tên khách hàng..."
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label for="filterPhone">Số điện thoại</Label>
              <Input
                id="filterPhone"
                placeholder="Nhập số điện thoại..."
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label for="filterDate">Ngày đặt</Label>
              <Input
                id="filterDate"
                type="date"
                disabled
              />
            </FormGroup>
            <Button color="primary" className="mt-3" block disabled>
              Áp dụng lọc
            </Button>
          </Form>
        </OffcanvasBody>
      </Offcanvas>

      {/* Modal Tạo đơn hàng (replaced with ModalOrder) */}
      <ModalOrder
        isOpen={showCreate}
        toggle={() => setShowCreate(false)}
        onSave={handleCreate}
        formData={createForm}
        setFormData={setCreateForm}
      />

      {/* Modal Theo dõi đơn hàng */}
      <Modal isOpen={showTrack} toggle={() => setShowTrack(false)}>
        <ModalHeader toggle={() => setShowTrack(false)}>Theo dõi đơn hàng</ModalHeader>
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