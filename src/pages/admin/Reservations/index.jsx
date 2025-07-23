import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  ButtonGroup,
  Button,
  Row,
  Col,
  Input,
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
  Form,
  FormGroup,
  Label,
  Badge,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import { MdSearch, MdFilterList, MdDelete, MdRestore } from "react-icons/md";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import GridReservation from "@components/admin/Reservations/grid-reservation";
import RealtimeReservationUpdater from "@components/admin/Reservations/RealtimeReservationUpdater";
import {
  getReservations,
  getTableAreas,
  createReservation,
  getTrashedReservations,
  restoreReservation,
  forceDeleteReservation,
} from "@services/admin/reservationService";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import StatusFilterGroup from "@components/admin/ui/StatusFilterGroup";
import SearchAndStatusFilterBar from "@components/admin/ui/SearchAndStatusFilterBar";

// Danh sách trạng thái đơn đặt bàn, khi bấm vào sẽ lọc theo trạng thái đó
const bookingStatusOptions = [
  { label: "Tất cả", value: "all", badgeColor: "secondary" },
  { label: "Chờ xác nhận", value: "pending", badgeColor: "warning" },
  { label: "Đã xác nhận", value: "confirmed", badgeColor: "success" },
  { label: "Hoàn thành", value: "completed", badgeColor: "info" },
  { label: "Đã hủy", value: "cancelled", badgeColor: "danger" },
  { label: "Không đến", value: "no_show", badgeColor: "secondary" },
  { label: "Đã ngồi", value: "seated", badgeColor: "primary" },
];

const TableBookingIndex = () => {
  const [bookingData, setBookingData] = useState({ items: [], meta: {} });
  const [trashedData, setTrashedData] = useState({ items: [], meta: {} });
  const [areaData, setAreaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");
  const [view, setView] = useState("list");
  const [showFilter, setShowFilter] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [apiErrors, setApiErrors] = useState({});

  const [createForm, setCreateForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    booking_date: "",
    booking_time: "",
    number_of_guests: "1",
    table_id: "",
    notes: "",
    special_requests: "",
  });

  // Lọc dữ liệu theo search và filter
  const filteredData = bookingData.items.filter((reservation) => {
    const matchesSearch =
      reservation.customer_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      reservation.customer_phone?.includes(searchTerm) ||
      reservation.customer_email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || reservation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Hàm này luôn đảm bảo lấy dữ liệu mới nhất từ API bằng cách thêm tham số random để tránh cache
  const fetchReservations = async (page = 1, search = "", status = "all") => {
    setLoading(true);
    try {
      const params = { page, _t: Date.now() }; // Thêm _t để luôn lấy data mới nhất
      if (search) params.query = search;
      if (status && status !== "all") params.status = status;
      const res = await getReservations(params);
      setBookingData({
        items: res.data.data.items,
        meta: res.data.data.meta,
      });
    } catch {
      toast.error("Không thể tải danh sách đơn đặt bàn");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrashedReservations = async (page = 1) => {
    try {
      const res = await getTrashedReservations({ page });
      console.log("TRASHED API SUCCESS:", res.data);
      setTrashedData({
        items: res.data.data.items,
        meta: res.data.data.meta,
      });
    } catch (error) {
      console.error("TRASHED API ERROR:", error);
      toast.error("Không thể tải danh sách đơn đặt bàn đã xóa");
    }
  };

  const fetchTableAreas = async () => {
    try {
      const res = await getTableAreas();
      setAreaData(res.data.data.items || []);
    } catch (error) {
      console.error("API ERROR:", error);
    }
  };

  useEffect(() => {
    fetchReservations(1, searchTerm, statusFilter);
    fetchTableAreas();
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (activeTab === "2") {
      fetchTrashedReservations();
    }
  }, [activeTab]);

  // Callback cho realtime updates (KHÔNG CẦN NỮA)
  // const handleNewReservation = (data) => {
  //     console.log('Handling new reservation:', data);
  //     // Có thể thêm logic để cập nhật UI ngay lập tức
  //     // Ví dụ: thêm vào đầu danh sách
  //     setBookingData(prev => ({
  //         ...prev,
  //         items: [{
  //             id: data.id || Date.now().toString(),
  //             customer_name: data.customer_name,
  //             customer_phone: data.customer_phone,
  //             customer_email: data.customer_email,
  //             reservation_date: data.reservation_date,
  //             reservation_time: data.reservation_time,
  //             number_of_guests: data.number_of_guests,
  //             status: data.status,
  //             created_at: data.created_at,
  //             updated_at: data.created_at,
  //         }, ...prev.items]
  //     }));
  // };

  // const handleStatusUpdate = (data) => {
  //     console.log('Handling status update:', data);
  //     // Cập nhật trạng thái trong danh sách
  //     setBookingData(prev => ({
  //         ...prev,
  //         items: prev.items.map(item =>
  //             item.id === data.id
  //                 ? { ...item, status: data.new_status }
  //                 : item
  //         )
  //     }));
  // };

  const handleDelete = async (id) => {
    try {
      setBookingData((prev) => ({
        ...prev,
        items: prev.items.filter((booking) => booking.id !== id),
      }));
      toast.success("Đã xóa đơn đặt bàn thành công");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Không thể xóa đơn đặt bàn");
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreReservation(id);
      toast.success("Đã khôi phục đơn đặt bàn thành công");
      fetchTrashedReservations();
      fetchReservations(); // Refresh main list
    } catch (error) {
      console.error("Restore failed:", error);
      toast.error("Không thể khôi phục đơn đặt bàn");
    }
  };

  const handleForceDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa vĩnh viễn",
      text: "Bạn có chắc chắn muốn xóa vĩnh viễn đơn đặt bàn này? Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa vĩnh viễn",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await forceDeleteReservation(id);
        toast.success("Đã xóa vĩnh viễn đơn đặt bàn");
        fetchTrashedReservations();
      } catch (error) {
        console.error("Force delete failed:", error);
        toast.error("Không thể xóa vĩnh viễn đơn đặt bàn");
      }
    }
  };

  const handleCreate = async () => {
    setApiErrors({});
    try {
      if (!createForm.customer_name || !createForm.customer_phone) {
        toast.error(
          "Vui lòng điền đầy đủ thông tin bắt buộc (tên và số điện thoại)"
        );
        return;
      }
      if (
        !createForm.table_id ||
        createForm.table_id === "" ||
        Number(createForm.table_id) === 0
      ) {
        toast.error("Vui lòng chọn khu vực bàn.");
        return;
      }
      if (!createForm.booking_date || !createForm.booking_time) {
        toast.error("Vui lòng chọn ngày và giờ đặt.");
        return;
      }
      const payload = {
        customer_id: 1,
        user_id: 2,
        customer_name: createForm.customer_name,
        customer_phone: createForm.customer_phone,
        customer_email: createForm.customer_email,
        reservation_date: createForm.booking_date,
        reservation_time: createForm.booking_time,
        number_of_guests: Number(createForm.number_of_guests) || 1,
        table_id: Number(createForm.table_id),
        notes: createForm.notes,
        special_requests: createForm.special_requests,
        status: "pending",
      };
      await createReservation(payload);
      toast.success("Đã tạo đơn đặt bàn thành công");
      setShowCreate(false);
      setCreateForm({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        booking_date: "",
        booking_time: "",
        number_of_guests: "1",
        table_id: "",
        notes: "",
        special_requests: "",
      });
      fetchReservations();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setApiErrors(error.response.data.errors);
        toast.error("Vui lòng kiểm tra lại thông tin!");
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Không thể tạo đơn đặt bàn"
        );
      }
    }
  };

  const handleUpdate = () => {
    fetchReservations();
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const handleStatusChangeLocal = (id, newStatus) => {
    setBookingData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      ),
    }));
    toast.success("Đã xác nhận đơn đặt bàn!");
  };

  const handlePageChange = (page) => {
    fetchReservations(page, searchTerm, statusFilter);
  };

  return (
    <div className="page-content">
      {/* Realtime updater component */}
      <RealtimeReservationUpdater
        onRefreshData={() => fetchReservations(1, searchTerm, statusFilter)}
      />

      <Breadcrumbs
        title="Danh sách đơn đặt bàn"
        breadcrumbItem="Quản lí đơn đặt bàn"
      />

      {/* Tabs */}
      <Card className="mb-4">
        <CardHeader className="bg-white border-bottom-0">
          <Nav tabs>
            <NavItem>
              <NavLink
                className={activeTab === "1" ? "active" : ""}
                onClick={() => toggleTab("1")}
              >
                Đơn đặt bàn ({bookingData.items.length})
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === "2" ? "active" : ""}
                onClick={() => toggleTab("2")}
              >
                Thùng rác ({trashedData.items.length})
              </NavLink>
            </NavItem>
          </Nav>
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
                  <StatusFilterGroup
                    options={bookingStatusOptions.map((opt) => ({
                      ...opt,
                      badgeCount: filteredData.filter((item) =>
                        opt.value === "all" ? true : item.status === opt.value
                      ).length,
                    }))}
                    value={statusFilter}
                    onChange={(val) => setStatusFilter(val)}
                    style={{ gap: "1rem" }}
                  />
                </Col>
                <Col
                  md="5"
                  sm="12"
                  className="d-flex justify-content-md-end justify-content-start align-items-center gap-2"
                >
                  <Button
                    color="success"
                    onClick={() => setShowCreate(true)}
                    className="me-2"
                  >
                    <i className="mdi mdi-plus me-1"></i>
                    Tạo đơn đặt bàn
                  </Button>
                  <ButtonGroup>
                    <Button
                      color={view === "grid" ? "primary" : "light"}
                      onClick={() => setView("grid")}
                      title="Dạng card"
                    >
                      <i className="mdi mdi-view-grid-outline"></i>
                    </Button>
                  </ButtonGroup>
                </Col>
              </Row>
            </CardHeader>
          </Card>

          {/* Khối tìm kiếm và lọc nâng cao */}
          <Card className="mb-4">
            <CardBody>
              <SearchAndStatusFilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                statusValue={statusFilter}
                onStatusChange={setStatusFilter}
                statusOptions={bookingStatusOptions}
                searchPlaceholder="Tìm kiếm theo tên, SĐT, email..."
                statusPlaceholder="Tất cả trạng thái"
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
            </CardBody>
          </Card>

          {/* Danh sách hoặc lưới đơn đặt bàn */}
          {loading ? (
            <div className="text-center my-5">
              <Spinner color="primary" />
            </div>
          ) : (
            <>
              <GridReservation
                data={filteredData}
                paginate={bookingData.meta}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onStatusChangeLocal={handleStatusChangeLocal}
                onPageChange={handlePageChange}
                tableAreas={areaData}
              />

              {/* Phân trang đẹp */}
              {bookingData.meta && bookingData.meta.totalPage > 1 && (
                <Card className="mt-4">
                  <CardBody className="d-flex justify-content-between align-items-center">
                    <div className="text-muted">
                      Hiển thị{" "}
                      {(bookingData.meta.currentPage - 1) *
                        bookingData.meta.perPage +
                        1}{" "}
                      -{" "}
                      {Math.min(
                        bookingData.meta.currentPage * bookingData.meta.perPage,
                        bookingData.meta.total
                      )}{" "}
                      trong tổng số {bookingData.meta.total} đơn đặt bàn
                    </div>
                    <div className="d-flex align-items-center">
                      <Button
                        color="light"
                        size="sm"
                        disabled={bookingData.meta.currentPage === 1}
                        onClick={() =>
                          fetchReservations(bookingData.meta.currentPage - 1)
                        }
                        className="me-2"
                      >
                        <i className="mdi mdi-chevron-left"></i>
                        Trước
                      </Button>

                      <div className="d-flex gap-1">
                        {(() => {
                          const pages = [];
                          const currentPage = bookingData.meta.currentPage;
                          const totalPages = bookingData.meta.totalPage;

                          // Hiển thị tối đa 5 trang
                          let startPage = Math.max(1, currentPage - 2);
                          let endPage = Math.min(totalPages, currentPage + 2);

                          // Điều chỉnh để luôn hiển thị 5 trang nếu có thể
                          if (endPage - startPage < 4) {
                            if (startPage === 1) {
                              endPage = Math.min(totalPages, startPage + 4);
                            } else {
                              startPage = Math.max(1, endPage - 4);
                            }
                          }

                          // Thêm nút "Đầu"
                          if (startPage > 1) {
                            pages.push(
                              <Button
                                key="first"
                                color="light"
                                size="sm"
                                onClick={() => fetchReservations(1)}
                                className="px-3"
                              >
                                1
                              </Button>
                            );
                            if (startPage > 2) {
                              pages.push(
                                <span key="dots1" className="px-2 text-muted">
                                  ...
                                </span>
                              );
                            }
                          }

                          // Thêm các trang chính
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <Button
                                key={i}
                                color={i === currentPage ? "primary" : "light"}
                                size="sm"
                                onClick={() => fetchReservations(i)}
                                className="px-3"
                              >
                                {i}
                              </Button>
                            );
                          }

                          // Thêm nút "Cuối"
                          if (endPage < totalPages) {
                            if (endPage < totalPages - 1) {
                              pages.push(
                                <span key="dots2" className="px-2 text-muted">
                                  ...
                                </span>
                              );
                            }
                            pages.push(
                              <Button
                                key="last"
                                color="light"
                                size="sm"
                                onClick={() => fetchReservations(totalPages)}
                                className="px-3"
                              >
                                {totalPages}
                              </Button>
                            );
                          }

                          return pages;
                        })()}
                      </div>

                      <Button
                        color="light"
                        size="sm"
                        disabled={
                          bookingData.meta.currentPage ===
                          bookingData.meta.totalPage
                        }
                        onClick={() =>
                          fetchReservations(bookingData.meta.currentPage + 1)
                        }
                        className="ms-2"
                      >
                        Sau
                        <i className="mdi mdi-chevron-right"></i>
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            </>
          )}
        </TabPane>

        <TabPane tabId="2">
          {/* Thùng rác */}
          <Card className="mb-4">
            <CardHeader className="bg-white border-bottom-0">
              <Row className="align-items-center">
                <Col>
                  <h5 className="mb-0 text-danger">
                    <MdDelete className="me-2" />
                    Thùng rác - Đơn đặt bàn đã xóa
                  </h5>
                </Col>
              </Row>
            </CardHeader>
          </Card>

          {trashedData.items.length === 0 ? (
            <Card>
              <CardBody className="text-center py-5">
                <MdDelete size={48} className="text-muted mb-3" />
                <h5 className="text-muted">Thùng rác trống</h5>
                <p className="text-muted">Không có đơn đặt bàn nào đã bị xóa</p>
              </CardBody>
            </Card>
          ) : (
            <>
              <Card>
                <CardBody>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Tên khách hàng</th>
                          <th>Số điện thoại</th>
                          <th>Ngày đặt</th>
                          <th>Số khách</th>
                          <th>Ngày xóa</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trashedData.items.map((item) => (
                          <tr key={item.id}>
                            <td>#{item.id}</td>
                            <td>{item.customer_name}</td>
                            <td>{item.customer_phone || item.phone_number}</td>
                            <td>
                              {item.reservation_date
                                ? new Date(
                                    item.reservation_date
                                  ).toLocaleDateString("vi-VN")
                                : ""}
                            </td>
                            <td>{item.number_of_guests} người</td>
                            <td>
                              {new Date(item.deleted_at).toLocaleDateString(
                                "vi-VN"
                              )}
                            </td>
                            <td>
                              <ButtonGroup size="sm">
                                <Button
                                  color="success"
                                  onClick={() => handleRestore(item.id)}
                                  title="Khôi phục"
                                >
                                  <MdRestore size={16} />
                                </Button>
                                <Button
                                  color="danger"
                                  onClick={() => handleForceDelete(item.id)}
                                  title="Xóa vĩnh viễn"
                                >
                                  <MdDelete size={16} />
                                </Button>
                              </ButtonGroup>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>

              {/* Phân trang cho thùng rác */}
              {trashedData.meta && trashedData.meta.totalPage > 1 && (
                <Card className="mt-4">
                  <CardBody className="d-flex justify-content-between align-items-center">
                    <div className="text-muted">
                      Hiển thị{" "}
                      {(trashedData.meta.currentPage - 1) *
                        trashedData.meta.perPage +
                        1}{" "}
                      -{" "}
                      {Math.min(
                        trashedData.meta.currentPage * trashedData.meta.perPage,
                        trashedData.meta.total
                      )}{" "}
                      trong tổng số {trashedData.meta.total} đơn đặt bàn đã xóa
                    </div>
                    <div className="d-flex align-items-center">
                      <Button
                        color="light"
                        size="sm"
                        disabled={trashedData.meta.currentPage === 1}
                        onClick={() =>
                          fetchTrashedReservations(
                            trashedData.meta.currentPage - 1
                          )
                        }
                        className="me-2"
                      >
                        <i className="mdi mdi-chevron-left"></i>
                        Trước
                      </Button>

                      <div className="d-flex gap-1">
                        {(() => {
                          const pages = [];
                          const currentPage = trashedData.meta.currentPage;
                          const totalPages = trashedData.meta.totalPage;

                          // Hiển thị tối đa 5 trang
                          let startPage = Math.max(1, currentPage - 2);
                          let endPage = Math.min(totalPages, currentPage + 2);

                          // Điều chỉnh để luôn hiển thị 5 trang nếu có thể
                          if (endPage - startPage < 4) {
                            if (startPage === 1) {
                              endPage = Math.min(totalPages, startPage + 4);
                            } else {
                              startPage = Math.max(1, endPage - 4);
                            }
                          }

                          // Thêm nút "Đầu"
                          if (startPage > 1) {
                            pages.push(
                              <Button
                                key="first"
                                color="light"
                                size="sm"
                                onClick={() => fetchTrashedReservations(1)}
                                className="px-3"
                              >
                                1
                              </Button>
                            );
                            if (startPage > 2) {
                              pages.push(
                                <span key="dots1" className="px-2 text-muted">
                                  ...
                                </span>
                              );
                            }
                          }

                          // Thêm các trang chính
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <Button
                                key={i}
                                color={i === currentPage ? "primary" : "light"}
                                size="sm"
                                onClick={() => fetchTrashedReservations(i)}
                                className="px-3"
                              >
                                {i}
                              </Button>
                            );
                          }

                          // Thêm nút "Cuối"
                          if (endPage < totalPages) {
                            if (endPage < totalPages - 1) {
                              pages.push(
                                <span key="dots2" className="px-2 text-muted">
                                  ...
                                </span>
                              );
                            }
                            pages.push(
                              <Button
                                key="last"
                                color="light"
                                size="sm"
                                onClick={() =>
                                  fetchTrashedReservations(totalPages)
                                }
                                className="px-3"
                              >
                                {totalPages}
                              </Button>
                            );
                          }

                          return pages;
                        })()}
                      </div>

                      <Button
                        color="light"
                        size="sm"
                        disabled={
                          trashedData.meta.currentPage ===
                          trashedData.meta.totalPage
                        }
                        onClick={() =>
                          fetchTrashedReservations(
                            trashedData.meta.currentPage + 1
                          )
                        }
                        className="ms-2"
                      >
                        Sau
                        <i className="mdi mdi-chevron-right"></i>
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            </>
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
              <Input id="filterDate" type="date" disabled />
            </FormGroup>
            <Button color="primary" className="mt-3" block disabled>
              Áp dụng lọc
            </Button>
          </Form>
        </OffcanvasBody>
      </Offcanvas>

      {/* Modal Tạo đơn đặt bàn */}
      <Modal isOpen={showCreate} toggle={() => setShowCreate(false)} size="lg">
        <ModalHeader toggle={() => setShowCreate(false)}>
          Tạo đơn đặt bàn mới
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="customer_name">Tên khách hàng *</Label>
                  <Input
                    id="customer_name"
                    value={createForm.customer_name}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        customer_name: e.target.value,
                      })
                    }
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="customer_phone">Số điện thoại *</Label>
                  <Input
                    id="customer_phone"
                    type="tel"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={createForm.customer_phone}
                    onChange={(e) => {
                      // Chỉ cho nhập số
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setCreateForm({ ...createForm, customer_phone: val });
                    }}
                    required
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="customer_email">Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={createForm.customer_email}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        customer_email: e.target.value,
                      })
                    }
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="number_of_guests">Số khách *</Label>
                  <Input
                    id="number_of_guests"
                    type="number"
                    value={createForm.number_of_guests}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        number_of_guests: e.target.value,
                      })
                    }
                    required
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="booking_date">Ngày đặt *</Label>
                  <Input
                    id="booking_date"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={createForm.booking_date}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        booking_date: e.target.value,
                      })
                    }
                    required
                  />
                  {apiErrors.reservation_date && (
                    <div className="text-danger mt-1" style={{ fontSize: 13 }}>
                      {apiErrors.reservation_date}
                    </div>
                  )}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="booking_time">Giờ đặt *</Label>
                  <Input
                    id="booking_time"
                    type="select"
                    value={createForm.booking_time}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        booking_time: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Chọn giờ</option>
                    {(() => {
                      // Tạo các mốc giờ từ 09:00 đến 20:00, mỗi 30 phút
                      const times = [];
                      let start = 9 * 60; // 9:00
                      let end = 20 * 60; // 20:00
                      for (let mins = start; mins <= end; mins += 30) {
                        const h = Math.floor(mins / 60);
                        const m = mins % 60;
                        const value = `${h.toString().padStart(2, "0")}:${m
                          .toString()
                          .padStart(2, "0")}`;
                        // Hiển thị dạng 12h cho đẹp
                        const ampm = h < 12 ? "AM" : "PM";
                        const h12 = h % 12 === 0 ? 12 : h % 12;
                        const label = `${h12.toString().padStart(2, "0")}:${m
                          .toString()
                          .padStart(2, "0")} ${ampm}`;
                        times.push(
                          <option key={value} value={value}>
                            {label}
                          </option>
                        );
                      }
                      return times;
                    })()}
                  </Input>
                  {apiErrors.reservation_time && (
                    <div className="text-danger mt-1" style={{ fontSize: 13 }}>
                      {apiErrors.reservation_time}
                    </div>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="table_id">Khu vực bàn</Label>
                  <Input
                    id="table_id"
                    type="select"
                    value={createForm.table_id}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, table_id: e.target.value })
                    }
                  >
                    <option value="">Chọn khu vực</option>
                    {areaData.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <Label for="special_requests">Yêu cầu đặc biệt</Label>
              <Input
                id="special_requests"
                type="textarea"
                value={createForm.special_requests}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    special_requests: e.target.value,
                  })
                }
              />
            </FormGroup>
            <FormGroup>
              <Label for="notes">Ghi chú</Label>
              <Input
                id="notes"
                type="textarea"
                value={createForm.notes}
                onChange={(e) =>
                  setCreateForm({ ...createForm, notes: e.target.value })
                }
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowCreate(false)}>
            Hủy
          </Button>
          <Button color="primary" onClick={handleCreate}>
            Tạo đơn đặt bàn
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default TableBookingIndex;
