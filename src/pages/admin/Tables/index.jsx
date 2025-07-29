import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Spinner,
  Button,
  Badge,
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import TableCard from "@components/admin/Table/CardTable";
import ModalTable from "@components/admin/Table/ModalTable";
import TableDetailModal from "@components/admin/Table/TableDetailModal";
import SearchAndStatusFilterBar from "@components/admin/ui/SearchAndStatusFilterBar";
import DeleteModal from "@components/admin/ui/DeleteModal";
import PaginateUi from "@components/admin/ui/paginateUi";
import RealtimeTableUpdater from "@components/admin/Table/RealtimeTableUpdater";
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

import "react-toastify/dist/ReactToastify.css";

const TableIndex = () => {
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
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
    reserved: 0,
    cleaning: 0,
    out_of_service: 0,
  });

  const statusOptions = [
    { value: "all", label: "Tất cả", badgeColor: "secondary" },
    { value: "available", label: "Trống", badgeColor: "success" },
    { value: "occupied", label: "Đang sử dụng", badgeColor: "danger" },
    { value: "reserved", label: "Đã đặt", badgeColor: "warning" },
    { value: "cleaning", label: "Đang dọn dẹp", badgeColor: "info" },
    { value: "out_of_service", label: "Ngưng phục vụ", badgeColor: "dark" },
  ];

  const fetchTables = async () => {
    setLoadingTables(true);
    try {
      const params = {
        page: currentPage,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
      };
      
      // Add advanced filter params
      if (filterTableNumber) params.table_number = filterTableNumber;
      if (filterTableType) params.table_type = filterTableType;
      if (filterTableArea) params.table_area_id = filterTableArea;
      
      // Debug: log parameters being sent
      console.log('API Parameters:', params);
      
      const res = await getTables(params);
      setTables(res.data.data.items || []);
      setMeta(res.data.data.meta || {});
    } catch {
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
      console.error('Error fetching table status counts:', error);
    }
  };

  useEffect(() => {
    fetchTables();
    fetchTableStatusCounts();
  }, [currentPage, search, status]);

  // Auto filter when advanced filter values change
  useEffect(() => {
    fetchTables();
    setCurrentPage(1);
  }, [filterTableNumber, filterTableType, filterTableArea]);

  const handleStatusChange = (value) => {
    setStatus(value);
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

  const handleTableClick = async (tableId) => {
    try {
      const res = await getTable(tableId);
      const table = res.data.data.table;
      setNewTable({
        table_number: table.table_number || "",
        description: table.description || "",
        table_area_id: table.table_area_id || "",
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

  return (
    <div className="page-content">
      <RealtimeTableUpdater onRefreshData={fetchTables} />
      <Breadcrumbs
        title="Quản Lý Bàn Nhà Hàng"
        breadcrumbItem="Danh sách bàn"
      />

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
                      ? Object.values(tableStatusCounts).reduce((a, b) => a + b, 0)
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
            onSearchChange={setSearch}
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

      <Card className="mb-4">
        <CardBody>
          {loadingTables ? (
            <div className="text-center my-5">
              <Spinner color="primary" />
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                {tables.map((table) => (
                  <TableCard
                    key={table.id}
                    tableId={table.id}
                    tableNumber={table.table_number}
                    seatCount={table.table_type_label}
                    status={table.status}
                    onViewDetail={() =>
                      setSelectedTable(table) || setDetailModalOpen(true)
                    }
                    onClick={handleTableClick}
                    onDelete={handleDeleteClick}
                    hideMenu={false}
                  />
                ))}
              </div>
              {tables.length === 0 && (
                <div className="text-center text-muted">
                  Không tìm thấy bàn nào.
                </div>
              )}
              <PaginateUi
                currentPage={currentPage}
                totalPages={meta.last_page}
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
        tableAreas={[]}
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
        tableAreas={[]}
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
