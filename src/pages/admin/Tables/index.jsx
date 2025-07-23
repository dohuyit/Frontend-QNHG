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
} from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import TableCard from "@components/admin/Table/CardTable";
import ModalTable from "@components/admin/Table/ModalTable";
import TableDetailModal from "@components/admin/Table/TableDetailModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination as SwiperPagination, Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./Table.scss";

import { getTables, createTable, updateTable, deleteTable, getTable } from "../../../services/admin/tableService";
import { getTableAreas } from "../../../services/admin/tableAreaService";
import DeleteModal from "@components/admin/ui/DeleteModal";
import PaginateUi from "@components/admin/ui/paginateUi";
import RealtimeTableUpdater from '@components/admin/Table/RealtimeTableUpdater';

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

  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "available", label: "Trống" },
    { value: "occupied", label: "Đang sử dụng" },
    { value: "reserved", label: "Đã đặt" },
    { value: "cleaning", label: "Đang dọn dẹp" },
    { value: "out_of_service", label: "Ngưng phục vụ" },
  ];

  const handleTableClick = async (tableId) => {
    try {
      const res = await getTable(tableId);
      const table = res.data.data.table;
      setNewTable({
        table_number: table.table_number || "",
        description: table.description || "",
        table_area_id: table.table_area_id || table.table_area?.id || "",
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
    const table = tables.find(t => t.id === tableId);
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

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
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
      tags: newTable.tags ? newTable.tags.split(",").map((tag) => tag.trim()) : [],
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
        search: search,
        status: status !== "all" ? status : undefined,
        table_area_id: selectedAreaIds.length > 0 ? selectedAreaIds.join(',') : undefined,
      };
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );
      const res = await getTables(params);
      console.log(res.data.data.items);
      console.log(res.data.data.meta);
      setTables(res.data.data.items || []);
      setMeta(res.data.data.meta || {});
    } catch {
      setTables([]);
      setMeta({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
      });
      toast.error("Lỗi khi tải danh sách bàn!");
    } finally {
      setLoadingTables(false);
    }
  };

  // Fetch table areas
  useEffect(() => {
    const fetchAreas = async () => {
      setLoadingAreas(true);
      try {
        const res = await getTableAreas();
        setTableAreas(res.data.data.items || []);
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
    fetchTables();
  }, [currentPage, search, status, selectedAreaIds]);

  const areaStats = tableAreas.reduce((acc, area) => {
    const tablesInArea = tables.filter(
      (t) => String(t.table_area_id) === String(area.id)
    );
    const total = tablesInArea.length;
    const available = tablesInArea.filter((t) => t.status === "available").length;
    const occupied = tablesInArea.filter((t) => t.status === "occupied").length;
    acc[area.id] = { total, available, occupied };
    return acc;
  }, {});

  const totalPages = meta.last_page;

  const tableListContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "1rem",
  };

  const legendStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "2rem",
    marginTop: "1rem",
    padding: "10px 0",
  };

  const legendItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

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
      fetchTables(); // reload lại danh sách
    } catch {
      toast.error("Lỗi khi xóa bàn!");
      setDeleteModalOpen(false);
      setDeleteTableId(null);
    }
  };

  return (
    <div className="page-content">
      <RealtimeTableUpdater onRefreshData={fetchTables} />
      <Breadcrumbs title="Quản Lý Bàn Nhà Hàng" breadcrumbItem="Danh sách bàn" />

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
                const stats = areaStats[area.id] || {
                  total: 0,
                  available: 0,
                  occupied: 0,
                };
                const fillRate =
                  stats.total > 0
                    ? ((stats.occupied / stats.total) * 100).toFixed(0)
                    : 0;

                return (
                  <SwiperSlide key={area.id}>
                    <Card
                      className={`h-100 area-card${selectedAreaIds.includes(area.id) ? " selected" : ""}`}
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
                        <p className="text-muted small mb-3">{area.description}</p>
                        <div className="d-flex justify-content-around text-center mb-3">
                          <div
                            className="p-2"
                            style={{
                              backgroundColor: "#f8f9fa",
                              borderRadius: "5px",
                              flex: 1,
                              margin: "0 5px",
                            }}
                          >
                            <h6 className="mb-0 fw-bold">{stats.total}</h6>
                            <small className="text-muted">Tổng</small>
                          </div>
                          <div
                            className="p-2"
                            style={{
                              backgroundColor: "#e8f5e8",
                              borderRadius: "5px",
                              flex: 1,
                              margin: "0 5px",
                            }}
                          >
                            <h6 className="mb-0 text-success fw-bold">
                              {stats.available}
                            </h6>
                            <small className="text-muted">Trống</small>
                          </div>
                          <div
                            className="p-2"
                            style={{
                              backgroundColor: "#ffe6e6",
                              borderRadius: "5px",
                              flex: 1,
                              margin: "0 5px",
                            }}
                          >
                            <h6 className="mb-0 text-danger fw-bold">
                              {stats.occupied}
                            </h6>
                            <small className="text-muted">Đang dùng</small>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="text-muted">Tỷ lệ lấp đầy</small>
                            <small className="fw-bold">{fillRate}%</small>
                          </div>
                          <div
                            style={{
                              width: "100%",
                              height: "8px",
                              backgroundColor: "#e9ecef",
                              borderRadius: "4px",
                            }}
                          >
                            <div
                              style={{
                                width: `${fillRate}%`,
                                height: "100%",
                                backgroundColor: "#343a40",
                                borderRadius: "4px",
                              }}
                            ></div>
                          </div>
                        </div>
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

      {/* Card Search & Filter */}
      <Card className="mb-4">
        <CardBody>
          <Row className="align-items-center g-2">
            <Col md={6} sm={12}>
              <Input
                type="search"
                placeholder="Tìm kiếm bàn..."
                value={search}
                onChange={handleSearchChange}
              />
            </Col>
            <Col md={3} sm={6}>
              <Input type="select" value={status} onChange={handleStatusChange}>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Input>
            </Col>
            <Col md={3} sm={6} className="text-end">
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
        </CardBody>
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
                    const area = tableAreas.find(a => a.id === id);
                    if (!area) return null;
                    return (
                      <span key={id} className="badge-area-selected badge rounded-pill px-3 py-2 d-flex align-items-center m-1">
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
                {tables.map((table) => (
                  <TableCard
                    key={table.id}
                    tableId={table.id}
                    tableNumber={table.table_number}
                    seatCount={table.table_type_label}
                    status={table.status}
                    onViewDetail={handleViewDetail}
                    onClick={handleTableClick}
                    onDelete={handleDeleteClick}
                    hideMenu={false}
                  />
                ))}
                {tables.length === 0 && (
                  <div className="text-center text-muted">
                    Không tìm thấy bàn nào.
                  </div>
                )}
              </div>
              <PaginateUi
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
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
    </div>
  );
};

export default TableIndex;