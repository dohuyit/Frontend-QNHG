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
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
  Form,
  FormGroup,
  Label,
} from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import TableCard from "@components/admin/Table/CardTable";
import ModalTable from "@components/admin/Table/ModalTable";
import TableDetailModal from "@components/admin/Table/TableDetailModal";
import SearchAndStatusFilterBar from "@components/admin/ui/SearchAndStatusFilterBar";
import DeleteModal from "@components/admin/ui/DeleteModal";
import CustomPaginate from "@components/admin/ui/CustomPaginate";
import { toast } from "react-toastify";
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  getTable,
  countTable,
} from "@services/admin/tableService";
import StatusFilterGroup from "@components/admin/ui/StatusFilterGroup";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination as SwiperPagination, Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./Table.scss";

import { getTableAreas } from "@services/admin/tableAreaService";

import "react-toastify/dist/ReactToastify.css";

const TableIndex = () => {
  const [tables, setTables] = useState([]);
  const [tableAreas, setTableAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [loadingTables, setLoadingTables] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedAreaIds, setSelectedAreaIds] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [newTable, setNewTable] = useState({
    table_number: "",
    description: "",
    table_type: "",
    tags: "",
    table_area_id: "",
  });
  const [errors, setErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [editTableId, setEditTableId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTableId, setDeleteTableId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  // Advanced filter states
  const [filterTableNumber, setFilterTableNumber] = useState("");
  const [filterTableType, setFilterTableType] = useState("");
  const [filterTableArea, setFilterTableArea] = useState("");

  // Table status counts
  const [tableStatusCounts, setTableStatusCounts] = useState({
    available: 0,
    occupied: 0,
    cleaning: 0,
    out_of_service: 0,
  });

  // Lọc client-side theo từ khóa tìm kiếm (React)
  const filteredTables = React.useMemo(() => {
    const keyword = (search || "").toLowerCase().trim();
    if (!keyword) return tables;
    return tables.filter((t) =>
      String(t.table_number || "").toLowerCase().includes(keyword)
    );
  }, [tables, search]);

  const statusOptions = [
    { value: "all", label: "Tất cả", badgeColor: "secondary" },
    { value: "available", label: "Trống", badgeColor: "success" },
    { value: "occupied", label: "Đang sử dụng", badgeColor: "danger" },
    { value: "cleaning", label: "Đang dọn dẹp", badgeColor: "info" },
    { value: "out_of_service", label: "Ngưng phục vụ", badgeColor: "dark" },
  ];

  const handleTableClick = async (tableId) => {
    try {
      const res = await getTable(tableId);
      const table = res.data.data.table;
      setNewTable({
        table_number: table.table_number || "",
        description: table.description || "",
        table_area_id: table.table_area?.id || "", // Sử dụng table_area.id thay vì table_area_id
        status: table.status || "",
        table_type: table.table_type || "",
        tags: table.tags ? table.tags.join(", ") : "",
      });
      setEditTableId(table.id);
      setIsEdit(true);
      setModalOpen(true);
      setErrors({});
    } catch {
      toast.error("Không lấy được thông tin bàn!");
    }
  };

  const handleViewDetail = (tableId) => {
    const table = tables.find((t) => t.id === tableId);
    if (table) {
      setSelectedTable(table);
      setDetailModalOpen(true);
    }
  };

  const handleAreaClick = (areaId) => {
    setCurrentPage(1);
    setSelectedAreaIds((prev) => {
      if (prev.includes(areaId)) {
        return prev.filter((id) => id !== areaId);
      } else {
        return [...prev, areaId];
      }
    });
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= meta.last_page) {
      setCurrentPage(pageNumber);
    }
  };

  const handleSave = async () => {
    setErrors({});
    const tableData = {
      ...newTable,
      tags: newTable.tags
        ? newTable.tags.split(",").map((tag) => tag.trim())
        : [],
    };
    try {
      if (isEdit) {
        await updateTable(editTableId, tableData);
        toast.success("Cập nhật bàn thành công!");
      } else {
        await createTable(tableData);
        toast.success("Thêm bàn thành công!");
      }
      setModalOpen(false);
      setNewTable({
        table_number: "",
        description: "",
        table_type: "",
        tags: "",
        table_area_id: "",
      });
      fetchTables();
      fetchTableStatusCounts();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi lưu bàn, vui lòng thử lại!";
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  const fetchTables = async () => {
    setLoadingTables(true);
    try {
      const params = {
        page: currentPage,
        per_page: 6,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
        table_area_id:
          selectedAreaIds.length > 0 ? selectedAreaIds.join(",") : undefined,
      };
      if (filterTableNumber) params.table_number = filterTableNumber;
      if (filterTableType) params.table_type = filterTableType;
      if (filterTableArea) params.table_area_id = filterTableArea;
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );
      const res = await getTables(params);
      setTables(res.data.data.items || []);
      setMeta(res.data.data.meta || {});
    } catch {
      setTables([]);
      setMeta({
        current_page: 1,
        per_page: 6,
        total: 0,
        last_page: 1,
      });
      toast.error("Lỗi khi tải danh sách bàn!");
    } finally {
      setLoadingTables(false);
    }
  };

  const fetchTableStatusCounts = async () => {
    try {
      const res = await countTable();
      setTableStatusCounts(res.data.data || {});
    } catch (error) {
      console.error("Error fetching table status counts:", error);
    }
  };

  // Fetch table areas
  useEffect(() => {
    const fetchAreas = async () => {
      setLoadingAreas(true);
      try {
        const res = await getTableAreas();
        const areas = res.data.data.items || [];
        setTableAreas(areas);

        // Auto-select the first area if areas exist and no area is currently selected
        if (areas.length > 0 && selectedAreaIds.length === 0) {
          setSelectedAreaIds([areas[0].id]);
        }
      } catch {
        setTableAreas([]);
        toast.error("Lỗi khi tải danh sách khu vực bàn!");
      } finally {
        setLoadingAreas(false);
      }
    };
    fetchAreas();
  }, []);

  // Fetch tables
  useEffect(() => {
    // Không gửi search lên API nữa, chỉ fetch theo trang/tham số khác
    fetchTables();
    fetchTableStatusCounts();
  }, [currentPage, /* search, */ status, selectedAreaIds]);

  // Auto filter when advanced filter values change
  useEffect(() => {
    fetchTables();
    setCurrentPage(1);
  }, [filterTableNumber, filterTableType, filterTableArea]);

  const handleDeleteClick = (tableId) => {
    setDeleteTableId(tableId);
    setDeleteModalOpen(true);
  };

  const handleDeleteTable = async () => {
    if (!deleteTableId) return;
    try {
      await deleteTable(deleteTableId);
      toast.success("Xóa bàn thành công!");
      setDeleteModalOpen(false);
      setDeleteTableId(null);
      fetchTables();
      fetchTableStatusCounts();
    } catch {
      toast.error("Lỗi khi xóa bàn!");
      setDeleteModalOpen(false);
      setDeleteTableId(null);
    }
  };

  const tableListContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "1rem",
  };

  return (
    <div className="page-content">
      <Breadcrumbs
        title="Quản Lý Bàn Nhà Hàng"
        breadcrumbItem="Danh sách bàn"
      />

      {/* Area Cards section with Swiper Carousel */}
      <Card className="mb-4">
        <CardHeader className="bg-white border-bottom-0">
          <Row className="align-items-center">
            <Col xs="12" className="text-center">
              <h4 className="fw-bold text-primary mb-0">Khu vực Bàn</h4>
              <p className="text-muted mb-0">
                Lướt để xem các khu vực bàn khác nhau và thông tin tổng quan
              </p>
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          {loadingAreas ? (
            <div className="text-center my-4">
              <Spinner color="primary" />
            </div>
          ) : (
            <Swiper
              className="area-swiper"
              modules={[SwiperPagination, Navigation]}
              navigation
              spaceBetween={20}
              slidesPerView={1}
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 1, spaceBetween: 20 },
                768: { slidesPerView: 2, spaceBetween: 30 },
                1024: { slidesPerView: 3, spaceBetween: 40 },
              }}
            >
              {tableAreas.map((area) => {
                return (
                  <SwiperSlide key={area.id}>
                    <Card
                      className={`h-100 area-card${
                        selectedAreaIds.includes(area.id) ? " selected" : ""
                      }`}
                      style={{
                        border: "1px solid #dee2e6",
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        if (!selectedAreaIds.includes(area.id)) {
                          e.currentTarget.style.boxShadow =
                            "0 2px 4px rgba(0,0,0,0.1)";
                        }
                      }}
                      onClick={() => handleAreaClick(area.id)}
                    >
                      <CardBody className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center">
                            {selectedAreaIds.includes(area.id) && (
                              <span className="area-selected-indicator"></span>
                            )}
                            <div
                              className="mx-2 d-flex align-items-center justify-content-center rounded-circle"
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: "#e0f7fa",
                                color: "#00bcd4",
                                fontSize: "1.5rem",
                              }}
                            >
                              {area.icon || "📊"}
                            </div>
                            <h5 className="mb-0 fw-bold">{area.name}</h5>
                          </div>
                        </div>
                        <p className="text-muted small mb-3">
                          {area.description}
                        </p>
                        <div>
                          <p className="mb-0">
                            <span className="text-muted">Sức chứa:</span>{" "}
                            <span className="fw-bold text-success">
                              {area.capacity} bàn
                            </span>
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </CardBody>
      </Card>

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
                      ? Object.values(tableStatusCounts).reduce(
                          (a, b) => a + b,
                          0
                        )
                      : tableStatusCounts[opt.value] || 0,
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
                  setNewTable({
                    table_number: "",
                    description: "",
                    table_type: "",
                    tags: "",
                    table_area_id: "",
                  });
                  setIsEdit(false);
                  setModalOpen(true);
                  setErrors({});
                }}
              >
                <i className="mdi mdi-plus"></i> Thêm mới bàn
              </Button>
            </Col>
          </Row>
        </CardHeader>
      </Card>

      <Card className="mb-4">
        <CardHeader className="bg-white border-bottom-0">
          <SearchAndStatusFilterBar
            searchValue={search}
            onSearchChange={handleSearchChange}
            statusValue={status}
            onStatusChange={handleStatusChange}
            statusOptions={statusOptions}
            searchPlaceholder="Tìm kiếm bàn..."
            statusPlaceholder="Tất cả trạng thái"
            rightContent={
              <Button
                color="light"
                className="border"
                onClick={() => setShowFilter(true)}
                style={{ minWidth: 140 }}
              >
                <i className="mdi mdi-filter-variant me-1"></i> Lọc nâng cao
              </Button>
            }
          />
        </CardHeader>
      </Card>

      {/* Main content card (Table List) */}
      <Card className="mb-4">
        <CardHeader className="bg-white border-bottom-0">
          <Row className="align-items-center">
            <Col xs="12" className="text-center">
              <h4 className="fw-bold text-primary mb-0">Danh sách Bàn</h4>
              <p className="text-muted mb-0">
                Click vào bàn để xem chi tiết hoặc thực hiện thao tác
              </p>
              {selectedAreaIds.length > 0 && (
                <div className="d-flex justify-content-center mt-2 mb-0 flex-wrap">
                  {selectedAreaIds.map((id) => {
                    const area = tableAreas.find((a) => a.id === id);
                    if (!area) return null;
                    return (
                      <span
                        key={id}
                        className="badge-area-selected badge rounded-pill px-3 py-2 d-flex align-items-center m-1"
                      >
                        <span className="me-2">
                          <span>Hiển thị bàn cho khu vực:</span>
                          <strong className="ms-1">{area.name}</strong>
                        </span>
                        <Button
                          close
                          className="ms-2"
                          style={{ fontSize: 18, lineHeight: 1 }}
                          onClick={() => handleAreaClick(id)}
                        />
                      </span>
                    );
                  })}
                </div>
              )}
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          {loadingTables ? (
            <div className="text-center my-5">
              <Spinner color="primary" />
            </div>
          ) : (
            <>
              <div style={tableListContainerStyle}>
                {filteredTables.map((table) => (
                  <TableCard
                    key={table.id}
                    tableId={table.id}
                    tableNumber={table.table_number}
                    seatCount={table.table_type} // Thay đổi từ table_type_label thành table_type
                    status={table.status}
                    onViewDetail={handleViewDetail}
                    onClick={handleTableClick}
                    onDelete={handleDeleteClick}
                    hideMenu={false}
                  />
                ))}
                {filteredTables.length === 0 && (
                  <div className="text-center text-muted">
                    Không tìm thấy bàn nào.
                  </div>
                )}
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <ModalTable
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        newTable={newTable}
        setNewTable={setNewTable}
        tableAreas={tableAreas}
        onSave={handleSave}
        isEdit={isEdit}
        errors={errors}
      />

      <DeleteModal
        show={deleteModalOpen}
        onDeleteClick={handleDeleteTable}
        onCloseClick={() => setDeleteModalOpen(false)}
      />

      <TableDetailModal
        isOpen={detailModalOpen}
        toggle={() => setDetailModalOpen(false)}
        table={selectedTable}
        tableAreas={tableAreas}
      />

      {/* Bộ lọc nâng cao */}
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
              setFilterTableNumber("");
              setFilterTableType("");
              setFilterTableArea("");
              setCurrentPage(1);
            }}
            title="Làm mới bộ lọc"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
        </OffcanvasHeader>
        <OffcanvasBody>
          <Form>
            <FormGroup>
              <Label for="filterTableNumber">Số bàn</Label>
              <Input
                id="filterTableNumber"
                value={filterTableNumber}
                onChange={(e) => setFilterTableNumber(e.target.value)}
                placeholder="Nhập số bàn..."
              />
            </FormGroup>
            <FormGroup>
              <Label for="filterTableType">Loại bàn</Label>
              <Input
                type="select"
                id="filterTableType"
                value={filterTableType}
                onChange={(e) => setFilterTableType(e.target.value)}
              >
                <option value="">Tất cả loại bàn</option>
                <option value="2_seats">Bàn 2 chỗ</option>
                <option value="4_seats">Bàn 4 chỗ</option>
                <option value="6_seats">Bàn 6 chỗ</option>
                <option value="8_seats">Bàn 8 chỗ</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="filterTableArea">Khu vực</Label>
              <Input
                type="select"
                id="filterTableArea"
                value={filterTableArea}
                onChange={(e) => setFilterTableArea(e.target.value)}
              >
                <option value="">Tất cả khu vực</option>
                <option value="1">Tầng 1</option>
                <option value="2">Tầng 2</option>
                <option value="3">Sân thượng</option>
                <option value="4">Phòng VIP</option>
              </Input>
            </FormGroup>
          </Form>
        </OffcanvasBody>
      </Offcanvas>
    </div>
  );
};

export default TableIndex;
