import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  Button,
  Row,
  Col,
  Spinner,
  Input,
  InputGroup,
  InputGroupText,
  Form,
  FormGroup,
  Label,
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
} from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import Badge from "@components/admin/ui/Badge";
import {
  getTableAreas,
  countTableArea,
} from "@services/admin/tableAreaService";
import Swal from "sweetalert2";
import TableAreaModal from "./TableAreaModal";
import StatusFilterGroup from "@components/admin/ui/StatusFilterGroup";
import SearchAndStatusFilterBar from "@components/admin/ui/SearchAndStatusFilterBar";

const TableAreaIndex = () => {
  const [areaData, setAreaData] = useState({ items: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [newTableArea, setNewTableArea] = useState({
    name: "",
    description: "",
    capacity: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterCapacity, setFilterCapacity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  const [areaStatusCounts, setAreaStatusCounts] = useState({
    active: 0,
    inactive: 0,
    all: 0,
  });

  const statusOptions = [
    { value: "all", label: "Tất cả", badgeColor: "secondary" },
    { value: "active", label: "Hoạt động", badgeColor: "success" },
    { value: "inactive", label: "Không hoạt động", badgeColor: "danger" },
  ];

  const fetchTableAreas = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 10,
        // Nếu filterName có giá trị thì không gửi query (search)
        query: filterName ? undefined : search || undefined,
        status: status !== "all" ? status : undefined,
        name: filterName || undefined,
        capacity: filterCapacity || undefined,
      };
      const res = await getTableAreas(params);
      console.log("API SUCCESS:", res.data);
      setAreaData({
        items: res.data.data.items,
        meta: res.data.data.meta,
      });
      setMeta({
        current_page: res.data.data.meta.page || 1,
        per_page: res.data.data.meta.perPage || 10,
        total: res.data.data.meta.total || 0,
        last_page: res.data.data.meta.totalPage || 1,
      });
      setCurrentPage(res.data.data.meta.page || 1);
    } catch (error) {
      console.error("API ERROR:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải danh sách khu vực bàn",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAreaStatusCounts = async () => {
    try {
      const res = await countTableArea();
      setAreaStatusCounts(res.data.data || {});
    } catch {
      setAreaStatusCounts({ active: 0, inactive: 0, all: 0 });
    }
  };

  useEffect(() => {
    fetchTableAreas(currentPage);
    fetchAreaStatusCounts();
  }, [currentPage, search, status, filterName, filterCapacity]);

  const openAddModal = () => {
    setIsEdit(false);
    setSelectedId(null);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (area) => {
    console.log("Opening edit modal for area:", area);
    setIsEdit(true);
    setSelectedId(area.id);
    setErrors({});
    setModalOpen(true);
  };

  const handleModalSave = (validationErrors = null) => {
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    // Success case - refresh data and close modal
    fetchTableAreas(currentPage);
    setModalOpen(false);
    setErrors({});
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setCurrentPage(1);
    fetchTableAreas(1);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { type: "success", text: "Hoạt động" },
      inactive: { type: "danger", text: "Không hoạt động" },
    };
    const config = statusConfig[status] || {
      type: "secondary",
      text: "Không xác định",
    };
    return <Badge type={config.type}>{config.text}</Badge>;
  };

  return (
    <div className="page-content">
      <Breadcrumbs
        title="Danh sách khu vực bàn"
        breadcrumbItem="Quản lí khu vực bàn"
      />

      {/* Status Filter Card */}
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
                      ? (areaStatusCounts.active || 0) +
                        (areaStatusCounts.inactive || 0)
                      : areaStatusCounts[opt.value] || 0,
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
              <Button color="success" onClick={openAddModal}>
                <i className="mdi mdi-plus me-1"></i>
                Thêm khu vực bàn
              </Button>
            </Col>
          </Row>
        </CardHeader>
      </Card>

      {/* Search and Filter Card */}
      <Card className="mb-4">
        <CardHeader className="bg-white border-bottom-0">
          <SearchAndStatusFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            statusValue={status}
            onStatusChange={handleStatusChange}
            statusOptions={statusOptions}
            searchPlaceholder="Tìm kiếm khu vực bàn..."
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
        </CardHeader>
      </Card>

      {/* Advanced Filter Offcanvas */}
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
              setFilterName("");
              setFilterCapacity("");
              fetchTableAreas();
            }}
            title="Làm mới bộ lọc"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
        </OffcanvasHeader>
        <OffcanvasBody>
          <Form>
            <FormGroup>
              <Label for="filterName">Tên khu vực</Label>
              <Input
                id="filterName"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Nhập tên khu vực..."
              />
            </FormGroup>
            <FormGroup>
              <Label for="filterCapacity">Sức chứa</Label>
              <Input
                id="filterCapacity"
                type="number"
                value={filterCapacity}
                onChange={(e) => setFilterCapacity(e.target.value)}
                placeholder="Nhập sức chứa..."
                min={1}
              />
            </FormGroup>
          </Form>
        </OffcanvasBody>
      </Offcanvas>

      {/* Data Table Card */}
      <Card>
        <CardBody>
          {loading ? (
            <div className="text-center my-5">
              <Spinner color="primary" />
            </div>
          ) : (
            <Table bordered responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 60 }}>#</th>
                  <th>Tên khu vực</th>
                  <th>Mô tả</th>
                  <th>Sức chứa</th>
                  <th>Trạng thái</th>
                  <th style={{ width: 150 }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {areaData.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  areaData.items.map((area, idx) => (
                    <tr key={area.id}>
                      <td>{idx + 1}</td>
                      <td>{area.name}</td>
                      <td>{area.description || "Không có mô tả"}</td>
                      <td>{area.capacity} người</td>
                      <td>{getStatusBadge(area.status)}</td>
                      <td>
                        <div className="text-center" role="group">
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => openEditModal(area)}
                            title="Chỉnh sửa"
                          >
                            <i className="mdi mdi-pencil"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* TableAreaModal component */}
      <TableAreaModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        newTableArea={newTableArea}
        setNewTableArea={setNewTableArea}
        onSave={handleModalSave}
        isEdit={isEdit}
        errors={errors}
        selectedId={selectedId}
      />
    </div>
  );
};

export default TableAreaIndex;
