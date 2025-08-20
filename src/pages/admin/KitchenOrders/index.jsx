import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Spinner,
  Button,
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
  Form,
  FormGroup,
  Label,
  Input,
  Card,
  CardHeader,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Badge,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import KanbanColumn from "@components/admin/KitchenOrders/KanbanColumn";
import FilterBar from "@components/admin/KitchenOrders/FilterBar";
import {
  getListKitchenOrders,
  updateKitchenOrderStatus,
} from "@services/admin/kitchenOrderService";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import "@pages/admin/KitchenOrders/KitchenOrdersKanban.css";
import KanbanCard from "@components/admin/KitchenOrders/KanbanCard";
import "react-toastify/dist/ReactToastify.css";
import RealtimeKitchenOrderUpdater from "@components/admin/KitchenOrders/RealtimeKitchenOrderUpdater";

const STATUS_LIST = [
  { key: "pending", label: "Chờ xử lý", badgeColor: "warning" },
  { key: "preparing", label: "Đang chế biến", badgeColor: "info" },
  { key: "ready", label: "Hoàn thành", badgeColor: "success" },
  { key: "cancelled", label: "Đã hủy", badgeColor: "danger" },
];

const KitchenOrdersPage = () => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState({});
  const [filterDate, setFilterDate] = useState(todayStr);
  const [showFilter, setShowFilter] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  // Bộ lọc theo khoảng ngày
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchOrders = async (filterParams = filter, date = filterDate) => {
    try {
      const params = { ...filterParams };
      // ✅ Thêm searchTerm vào params gửi backend
      if (searchTerm) {
        params.search = searchTerm;
      }

      // Nếu có khoảng ngày thì ưu tiên khoảng ngày
      if (dateFrom || dateTo) {
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
      } else {
        params.created_at = date;
      }
      // Nếu có khoảng ngày thì ưu tiên khoảng ngày
      if (dateFrom || dateTo) {
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
      } else {
        // Nếu không có khoảng ngày thì dùng ngày đơn lẻ
        params.created_at = date;
      }

      const res = await getListKitchenOrders(params);
      const items =
        res.data.data && Array.isArray(res.data.data.items)
          ? res.data.data.items
          : [];
      setOrders(items);
    } catch {
      setOrders([]);
      toast.error("Không thể tải danh sách đơn bếp!");
    }
  };

  useEffect(() => {
    fetchOrders(filter, filterDate);
  }, [searchTerm, filter, filterDate]);

  useEffect(() => {
    fetchOrders(filter, filterDate);
    // eslint-disable-next-line
  }, [filterDate, dateFrom, dateTo]);

  // Filter trạng thái badge
  const handleStatusBadge = (status) => {
    setStatusFilter(status);
    // Gửi luôn status lên backend khi filter
    const newFilter = { ...filter, status: status === "all" ? "" : status };
    setFilter(newFilter);
    fetchOrders(newFilter);
  };

  // Chuyển trạng thái đơn bếp
  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      console.log(
        `🔄 Đang chuyển đơn #${orderId} từ trạng thái hiện tại sang: ${newStatus}`
      );

      const response = await updateKitchenOrderStatus(orderId, {
        status: newStatus,
      });
      console.log("✅ Response từ backend:", response);

      // Kiểm tra response từ backend
      if (response?.data?.data?.status) {
        const actualStatus = response.data.data.status;
        console.log(`📊 Backend trả về trạng thái: ${actualStatus}`);

        if (actualStatus !== newStatus) {
          console.warn(
            `⚠️ Trạng thái mong muốn: ${newStatus}, nhưng backend trả về: ${actualStatus}`
          );
          toast.warn(`Trạng thái đã được cập nhật thành: ${actualStatus}`);
        } else {
          toast.success("Cập nhật trạng thái thành công!");
        }
      } else {
        toast.success("Cập nhật trạng thái thành công!");
      }

      // Reload lại danh sách để cập nhật UI
      fetchOrders(filter);
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật trạng thái:", error);
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  // Hủy đơn bếp
  const handleCancel = async (orderId) => {
    const result = await Swal.fire({
      title: "Bạn chắc chắn muốn hủy đơn này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hủy đơn",
      cancelButtonText: "Đóng",
    });
    if (result.isConfirmed) {
      try {
        // Gọi API cập nhật trạng thái sang cancelled
        const res = await updateKitchenOrderStatus(orderId, {
          status: "cancelled",
        });
        // Nếu API trả về message lỗi, hiển thị message đó
        if (res?.data?.message && res?.data?.success === false) {
          toast.error(res.data.message);
        } else {
          toast.success("Đã hủy đơn bếp!");
          fetchOrders(filter);
        }
      } catch (err) {
        // Nếu có response từ backend, lấy message
        const msg = err?.response?.data?.message || "Hủy đơn thất bại!";
        toast.error(msg);
      }
    }
  };

  // Filter theo searchTerm và ngày (client-side fallback)
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      String(order.order_id || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(order.order_code || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) || // ✅ thêm mã đơn bếp
      String(order.table_number || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(order.item_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    // Lọc theo ngày (client-side fallback nếu backend chưa lọc)
    const orderDate = order.created_at || order.order_time;
    const orderDateStr = orderDate
      ? new Date(orderDate).toISOString().slice(0, 10)
      : "";

    // Nếu có khoảng ngày thì ưu tiên khoảng ngày
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const inFrom = !dateFrom || (orderDateStr && orderDateStr >= dateFrom);
      const inTo = !dateTo || (orderDateStr && orderDateStr <= dateTo);
      matchesDate = inFrom && inTo;
    } else {
      // Nếu không có khoảng ngày thì dùng ngày đơn lẻ
      matchesDate = !filterDate || orderDateStr === filterDate;
    }

    return matchesSearch && matchesDate;
  });

  // Xử lý kéo thả card giữa các cột
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    // Tìm order bị kéo
    const draggedOrder = orders.find((o) => String(o.id) === draggableId);
    if (!draggedOrder) return;

    const from = source.droppableId;
    const to = destination.droppableId;

    console.log(
      `🎯 Kéo thả: Đơn #${draggedOrder.id} từ "${from}" sang "${to}"`
    );
    console.log(`📋 Trạng thái hiện tại của đơn: ${draggedOrder.status}`);

    // Chỉ cho phép chuyển hợp lệ
    if (
      (from === "pending" && !["preparing", "cancelled"].includes(to)) ||
      (from === "preparing" && !["ready"].includes(to)) ||
      from === "ready" || // ready không kéo đi đâu được
      from === "cancelled" // cancelled không kéo đi đâu được
    ) {
      console.warn(`❌ Không cho phép chuyển từ "${from}" sang "${to}"`);
      toast.warn("Không thể chuyển trạng thái này!");
      return;
    }

    console.log(`✅ Cho phép chuyển từ "${from}" sang "${to}"`);

    if (draggedOrder.status !== to) {
      console.log(`🔄 Gọi API cập nhật trạng thái sang: ${to}`);
      await handleChangeStatus(draggedOrder.id, to);
    } else {
      console.log(`ℹ️ Trạng thái đã đúng, không cần cập nhật`);
    }
  };

  // Component hiển thị card đơn bếp
  const OrderCard = ({ order }) => {
    const nextStatus =
      order.status === "pending"
        ? "preparing"
        : order.status === "preparing"
          ? "ready"
          : null;
    const statusInfo = STATUS_LIST.find((s) => s.key === order.status);

    return (
      <Card className="mb-3 shadow-sm" style={{ minWidth: 280 }}>
        <CardBody className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold text-primary">
              #{order.order_id || order.id}
            </span>
            <Badge color={statusInfo?.badgeColor || "secondary"}>
              {statusInfo?.label || order.status}
            </Badge>
          </div>
          <div className="mb-2">
            <strong>Bàn:</strong> {order.table_number || "-"}
            {order.is_priority && (
              <Badge color="danger" className="ms-2">
                Ưu tiên
              </Badge>
            )}
          </div>
          <div className="mb-2">
            <strong>Món:</strong> {order.item_name}
            <Badge color="light" className="text-dark ms-1">
              x{order.quantity}
            </Badge>
          </div>
          {order.notes && (
            <div className="mb-2 text-muted">
              <i className="mdi mdi-note-text me-1"></i>
              {order.notes}
            </div>
          )}
          <div className="mb-3 text-secondary" style={{ fontSize: 12 }}>
            <i className="mdi mdi-clock me-1"></i>
            {order.created_at
              ? new Date(order.created_at).toLocaleString("vi-VN")
              : "-"}
          </div>
          <div className="d-flex gap-2">
            {nextStatus && (
              <Button
                color="primary"
                size="sm"
                onClick={() => handleChangeStatus(order.id, nextStatus)}
              >
                <i className="mdi mdi-arrow-right me-1"></i>
                Chuyển trạng thái
              </Button>
            )}
            {order.status !== "cancelled" && (
              <Button
                color="outline-danger"
                size="sm"
                onClick={() => handleCancel(order.id)}
              >
                <i className="mdi mdi-close me-1"></i>
                Hủy đơn
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <div className="page-content">
      <RealtimeKitchenOrderUpdater
        onRefreshData={() => fetchOrders(filter, filterDate)}
      />
      <Breadcrumbs title="Danh sách đơn bếp" breadcrumbItem="Quản lí đơn bếp" />
      {/* Tabs */}
      <Card className="mb-4">
        <CardHeader className="bg-white border-bottom-0">
          <Nav tabs>
            <NavItem>
              <NavLink
                className={activeTab === "1" ? "active" : ""}
                onClick={() => setActiveTab("1")}
              >
                Đơn bếp ({orders.length})
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === "2" ? "active" : ""}
                onClick={() => setActiveTab("2")}
              >
                Thùng rác (0)
              </NavLink>
            </NavItem>
          </Nav>
        </CardHeader>
      </Card>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          {/* Bộ lọc trạng thái badge */}
          <Card className="mb-4">
            <CardHeader className="bg-white border-bottom-0">
              <div className="d-flex flex-wrap gap-2">
                <Button
                  color={statusFilter === "all" ? "secondary" : ""}
                  outline={statusFilter !== "all"}
                  onClick={() => handleStatusBadge("all")}
                  size="sm"
                >
                  Tất cả{" "}
                  <Badge color="secondary" pill className="ms-2">
                    {filteredOrders.length}
                  </Badge>
                </Button>
                {STATUS_LIST.map((opt) => (
                  <Button
                    key={opt.key}
                    color={statusFilter === opt.key ? opt.badgeColor : "light"}
                    outline={statusFilter !== opt.key}
                    className={
                      statusFilter !== opt.key ? "text-dark border" : ""
                    }
                    style={
                      statusFilter !== opt.key
                        ? { opacity: 0.95, fontWeight: 500 }
                        : {}
                    }
                    onClick={() => handleStatusBadge(opt.key)}
                    size="sm"
                  >
                    {opt.label}{" "}
                    <Badge color={opt.badgeColor} pill className="ms-2">
                      {
                        filteredOrders.filter(
                          (order) => order.status === opt.key
                        ).length
                      }
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardHeader>
          </Card>
          {/* Filter nhanh và nâng cao */}
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
                      placeholder="Tìm kiếm theo mã đơn, bàn, món..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center" style={{ gap: 8 }}>
                    <Input
                      type="date"
                      value={dateFrom}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        setDateTo(""); // Reset dateTo khi thay đổi dateFrom
                        setFilterDate(""); // Reset filterDate khi dùng khoảng ngày
                      }}
                      placeholder="Từ ngày"
                      title="Chọn ngày bắt đầu"
                    />
                    <span className="text-muted">—</span>
                    <Input
                      type="date"
                      value={dateTo}
                      min={dateFrom || undefined}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        setFilterDate(""); // Reset filterDate khi dùng khoảng ngày
                      }}
                      placeholder="Đến ngày"
                      title="Chọn ngày kết thúc"
                    />
                  </div>
                </Col>

                <Col md={2} className="text-end">
                  <div className="d-flex gap-2">
                    {(filterDate !== todayStr || dateFrom || dateTo) && (
                      <Button
                        color="outline-secondary"
                        size="sm"
                        onClick={() => {
                          setFilterDate(todayStr);
                          setDateFrom("");
                          setDateTo("");
                        }}
                        title="Về ngày hôm nay"
                      >
                        <i className="mdi mdi-close me-1"></i>
                        Hôm nay
                      </Button>
                    )}
                    <div className="row align-items">
                      <div className="col">{/* ... */}</div>
                      <div className="col-auto ms-auto pe-3">
                        <Button
                          color="light"
                          className="border"
                          style={{ minWidth: 140 }}
                          onClick={() => setShowFilter(true)}
                        >
                          <i className="mdi mdi-filter-variant me-1"></i> Lọc
                          nâng cao
                        </Button>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Thông báo khoảng ngày đang lọc */}
          <div className="mb-3">
            <div
              className="alert alert-info d-flex align-items-center"
              style={{ fontSize: 14 }}
            >
              <i className="mdi mdi-information-outline me-2"></i>
              <div>
                <strong>Lưu ý:</strong> Đơn có{" "}
                <span className="badge bg-danger">Ưu tiên</span> đầu bếp cần
                phải làm trước.
                {dateFrom || dateTo ? (
                  <span className="ms-2">
                    <i className="mdi mdi-calendar-range me-1"></i>
                    <strong>Đang xem đơn bếp từ:</strong>{" "}
                    {dateFrom && dateTo ? (
                      <>
                        <span className="badge bg-primary">
                          {new Date(dateFrom).toLocaleDateString("vi-VN")}
                        </span>{" "}
                        đến{" "}
                        <span className="badge bg-primary">
                          {new Date(dateTo).toLocaleDateString("vi-VN")}
                        </span>
                      </>
                    ) : dateFrom ? (
                      <>
                        <span className="badge bg-primary">
                          {new Date(dateFrom).toLocaleDateString("vi-VN")}
                        </span>{" "}
                        trở đi
                      </>
                    ) : (
                      <>
                        đến{" "}
                        <span className="badge bg-primary">
                          {new Date(dateTo).toLocaleDateString("vi-VN")}
                        </span>
                      </>
                    )}
                  </span>
                ) : filterDate !== todayStr ? (
                  <span className="ms-2">
                    <i className="mdi mdi-calendar-clock me-1"></i>
                    <strong>Đang xem đơn bếp ngày:</strong>{" "}
                    <span className="badge bg-primary">
                      {new Date(filterDate).toLocaleDateString("vi-VN")}
                    </span>
                  </span>
                ) : (
                  <span className="ms-2">
                    <i className="mdi mdi-calendar-today me-1"></i>
                    <strong>Đang xem đơn bếp hôm nay</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            {STATUS_LIST.filter((s) => s.key !== undefined).map((status) => {
              // Lọc và sắp xếp đơn theo trạng thái và ưu tiên
              const ordersInStatus = filteredOrders
                .filter((o) => o.status === status.key)
                .sort((a, b) => {
                  // Ưu tiên đơn có is_priority = 1 lên đầu
                  if (a.is_priority && !b.is_priority) return -1;
                  if (!a.is_priority && b.is_priority) return 1;

                  // Nếu cùng ưu tiên, sắp xếp theo thời gian tạo (mới nhất lên đầu)
                  const timeA = new Date(a.created_at || 0).getTime();
                  const timeB = new Date(b.created_at || 0).getTime();
                  return timeB - timeA;
                });

              return (
                <div key={status.key} className="kanban-swimlane-row mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <h5 className="mb-0 me-2">{status.label}</h5>
                    <Badge color={status.badgeColor} pill>
                      {ordersInStatus.length}
                    </Badge>
                  </div>
                  <Droppable droppableId={status.key} direction="horizontal">
                    {(provided) => (
                      <div
                        className="kanban-swimlane-cards d-flex flex-row gap-3 overflow-auto pb-2"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {ordersInStatus.length === 0 ? (
                          <div className="text-muted">Không có đơn nào</div>
                        ) : (
                          ordersInStatus.map((order, idx) => (
                            <KanbanCard
                              key={order.id}
                              order={order}
                              index={idx}
                              onChangeStatus={handleChangeStatus}
                              onCancel={handleCancel}
                              status={status.key}
                            />
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </DragDropContext>
        </TabPane>
        <TabPane tabId="2">
          {/* Thùng rác - có thể phát triển thêm logic xóa mềm */}
          <div className="text-center text-muted py-5">
            <i className="mdi mdi-delete-outline" style={{ fontSize: 64 }}></i>
            <h5 className="mt-3">Chức năng thùng rác</h5>
            <p>Chức năng thùng rác sẽ phát triển sau.</p>
          </div>
        </TabPane>
      </TabContent>


      <OffcanvasBody>
        <Form>
          <FormGroup>
            <Label for="filterItem">Tên món</Label>
            <Input
              id="filterItem"
              name="item_name"
              value={filter.item_name || ""}
              onChange={(e) => {
                const value = e.target.value;
                const updatedFilter = { ...filter, item_name: value };
                setFilter(updatedFilter);
                fetchOrders(updatedFilter, filterDate);
              }}
              placeholder="Nhập tên món..."
            />
          </FormGroup>
          <FormGroup>
            <Label for="filterStatus">Trạng thái</Label>
            <Input
              id="filterStatus"
              type="select"
              name="status"
              value={filter.status || ""}
              onChange={(e) => {
                const value = e.target.value;
                const updatedFilter = { ...filter, status: value };
                setFilter(updatedFilter);
                fetchOrders(updatedFilter, filterDate);
              }}
            >
              <option value="">Tất cả</option>
              <option value="pending">Pending</option>
              <option value="preparing">In Progress</option>
              <option value="ready">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Input>
          </FormGroup>
        </Form>
      </OffcanvasBody>
    </div>
  );
};

export default KitchenOrdersPage;
