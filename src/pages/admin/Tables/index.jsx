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
} from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import TableCard from "@components/admin/Table/CardTable";
import ModalTable from "@components/admin/Table/ModalTable";
import TableDetailModal from "@components/admin/Table/TableDetailModal";
import CustomerFilterBar from "@components/admin/CustomerFilterBar";
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
} from "@services/admin/tableService";

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
      const res = await getTables(params);
      setTables(res.data.data.items || []);
      setMeta(res.data.data.meta || {});
    } catch {
      toast.error("Lỗi khi tải danh sách bàn!");
    } finally {
      setLoadingTables(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [currentPage, search, status]);

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

        <Card className="mb-4">
          <CardHeader className="bg-white border-bottom-0">
            <Row className="align-items-center">
              <Col md={7} sm={12} className="mb-2 mb-md-0 d-flex align-items-center">
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                  {statusOptions.map((opt) => (
                      <button
                          key={opt.value}
                          onClick={() => handleStatusChange(opt.value)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: "8px 16px",
                            fontWeight: status === opt.value ? 600 : 400,
                            color: status === opt.value ? "#007bff" : "#333",
                            borderBottom:
                                status === opt.value ? "3px solid #007bff" : "3px solid transparent",
                            fontSize: 16,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                          }}
                      >
                        {opt.label}
                        <Badge
                            color={opt.badgeColor}
                            pill
                            className="ms-2"
                            style={{ fontSize: 13, minWidth: 28 }}
                        >
                          {opt.value === "all"
                              ? meta.total
                              : tables.filter((t) => t.status === opt.value).length}
                        </Badge>
                      </button>
                  ))}
                </div>
              </Col>
              <Col md={5} sm={12} className="d-flex justify-content-md-end justify-content-start gap-2">
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
            <CustomerFilterBar
                searchKeyword={search}
                onSearchChange={setSearch}
                selectedStatus={status}
                onStatusChange={(val) => setStatus(val)}
                statusOptions={statusOptions}
                showDropdown={true}
                onOpenAdvancedFilter={() => {}}
                placeholder="Tìm kiếm bàn..."
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
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
                    {tables.map((table) => (
                        <TableCard
                            key={table.id}
                            tableId={table.id}
                            tableNumber={table.table_number}
                            seatCount={table.table_type_label}
                            status={table.status}
                            onViewDetail={() => setSelectedTable(table) || setDetailModalOpen(true)}
                            onClick={handleTableClick}
                            onDelete={handleDeleteClick}
                            hideMenu={false}
                        />
                    ))}
                  </div>
                  {tables.length === 0 && (
                      <div className="text-center text-muted">Không tìm thấy bàn nào.</div>
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
      </div>
  );
};

export default TableIndex;
