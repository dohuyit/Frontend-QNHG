import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Spinner,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Table,
  Badge,
} from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import PaginateUi from "@components/admin/ui/paginateUi";
import SearchAndStatusFilterBar from "@components/admin/ui/SearchAndStatusFilterBar";
import StatusFilterGroup from "@components/admin/ui/StatusFilterGroup";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  getDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  countDiscountCodes,
} from "@services/admin/discountCodeService";

import CreateDiscountCode from "@pages/admin/DiscountCode/CreateDiscountCode.jsx";

function ListCoupon({ data = [], onEdit = () => {}, onDelete = () => {} }) {
  const formatDate = (d) => {
    if (!d) return "-";
    try {
      const dt = new Date(d);
      if (isNaN(dt)) return d;
      return dt.toLocaleDateString();
    } catch {
      return d;
    }
  };

  const getTypeLabel = (item) => {
    const t = item.type || item.discount_type || "";
    if (t === "percentage" || t === "percent") return "Phần trăm";
    if (t === "fixed" || t === "amount") return "Tiền cố định";
    return t || "-";
  };

  const getValue = (item) => item.value ?? item.discount_value ?? "-";

  const getStatusLabel = (item) => {
    if (typeof item.is_active === "boolean") {
      return item.is_active ? "Đang áp dụng" : "Ngừng áp dụng";
    }
    if (item.status) return item.status;
    return "-";
  };

  return (
    <Table bordered responsive>
      <thead>
        <tr>
          <th>Mã</th>
          <th>Loại</th>
          <th>Giá trị</th>
          <th>Ngày bắt đầu</th>
          <th>Ngày kết thúc</th>
          <th>Giới hạn</th>
          <th>Trạng thái</th>
          <th style={{ width: 160 }}>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(data) && data.length > 0 ? (
          data.map((item) => (
            <tr key={item.id ?? item.code}>
              <td>{item.code}</td>
              <td>{getTypeLabel(item)}</td>
              <td>{getValue(item)}</td>
              <td>{formatDate(item.start_date)}</td>
              <td>{formatDate(item.end_date)}</td>
              <td>{item.usage_limit ?? "-"}</td>
              <td>
                <Badge
                  color={
                    item.is_active || item.status === "active"
                      ? "success"
                      : "secondary"
                  }
                >
                  {getStatusLabel(item)}
                </Badge>
              </td>
              <td>
                <Button size="sm" color="primary" onClick={() => onEdit(item)}>
                  Sửa
                </Button>{" "}
                <Button
                  size="sm"
                  color="danger"
                  onClick={() => onDelete(item.id)}
                >
                  Xóa
                </Button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="9" className="text-center">
              Không có dữ liệu
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

const CouponIndex = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    start_date: "",
    end_date: "",
    usage_limit: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [editCouponId, setEditCouponId] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [statusCounts, setStatusCounts] = useState({
    active: 0,
    inactive: 0,
    all: 0,
  });

  const statusOptions = [
    { value: "all", label: "Tất cả", badgeColor: "secondary" },
    { value: "active", label: "Đang áp dụng", badgeColor: "success" },
    { value: "inactive", label: "Ngừng áp dụng", badgeColor: "danger" },
  ];

  useEffect(() => {
    if (activeTab === "list") fetchCoupons(currentPage);
    fetchStatusCounts();
  }, [currentPage, search, status, activeTab]);

  const fetchCoupons = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        query: search,
      };

      if (status !== "all") {
        params.is_active = status === "active" ? 1 : 0;
      }
      const res = await getDiscountCodes(params);

      let list = [];
      let metaData = null;

      if (Array.isArray(res?.data?.data)) {
        list = res.data.data;
      } else if (Array.isArray(res?.data?.data?.items)) {
        list = res.data.data.items;
        metaData = res.data.data.meta || null;
      } else if (Array.isArray(res?.data?.items)) {
        list = res.data.items;
        metaData = res.data.meta || null;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (res?.data?.data) {
        const firstArray = Object.values(res.data.data).find((v) =>
          Array.isArray(v)
        );
        if (firstArray) list = firstArray;
      }

      setCoupons(list);
      setMeta(
        metaData ??
          res?.data?.meta ?? {
            current_page: 1,
            per_page: 10,
            total: Array.isArray(list) ? list.length : 0,
            last_page: 1,
          }
      );
    } catch (error) {
      console.error("fetchCoupons error:", error);
      toast.error("Không thể tải danh sách mã giảm giá");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      const res = await countDiscountCodes();
      if (res?.data?.data) {
        setStatusCounts({
          active: res.data.data.active || 0,
          inactive: res.data.data.inactive || 0,
          all: (res.data.data.active || 0) + (res.data.data.inactive || 0),
        });
      }
    } catch (error) {
      console.error("fetchStatusCounts error:", error);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        code: newCoupon.code,
        description: newCoupon.description,
        type: newCoupon.discount_type === "percentage" ? "percentage" : "fixed",
        value: newCoupon.discount_value,
        start_date: newCoupon.start_date,
        end_date: newCoupon.end_date,
        usage_limit: newCoupon.usage_limit,
        is_active: newCoupon.status === "active" ? 1 : 0,
      };

      if (isEdit && editCouponId) {
        await updateDiscountCode(editCouponId, payload);
        toast.success("Cập nhật mã giảm giá thành công");
      } else {
        await createDiscountCode(payload);
        toast.success("Thêm mã giảm giá thành công");
      }
      setModalOpen(false);
      fetchCoupons(currentPage);
    } catch (error) {
      console.error("handleSave error:", error);
      toast.error("Lưu mã giảm giá thất bại");
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  const handleCouponClick = (coupon) => {
    setNewCoupon({
      code: coupon.code || "",
      description: coupon.description || "",
      discount_type: coupon.type || coupon.discount_type || "percentage",
      discount_value: coupon.value ?? coupon.discount_value ?? "",
      start_date: coupon.start_date || "",
      end_date: coupon.end_date || "",
      usage_limit: coupon.usage_limit ?? "",
      status:
        coupon.is_active === false ? "inactive" : coupon.status ?? "active",
    });
    setIsEdit(true);
    setEditCouponId(coupon.id ?? coupon._id ?? null);
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    Swal.fire({
      title: "Xóa mã giảm giá?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((res) => {
      if (res.isConfirmed) {
        handleDeleteCoupon(id);
      }
    });
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await deleteDiscountCode(id);
      toast.success("Xóa mã giảm giá thành công");
      fetchCoupons(currentPage);
    } catch (error) {
      console.error("delete error:", error);
      toast.error("Xóa mã giảm giá thất bại");
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setCurrentPage(1);
    fetchCoupons(1);
  };

  const resetNewCoupon = () => {
    setNewCoupon({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      start_date: "",
      end_date: "",
      usage_limit: "",
      status: "active",
    });
    setErrors({});
    setIsEdit(false);
    setEditCouponId(null);
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setSearch("");
      setStatus("all");
      setCurrentPage(1);
      if (tab === "list") fetchCoupons(1);
    }
  };

  return (
    <div className="page-content">
      <Breadcrumbs
        title="Quản Lý Mã Giảm Giá"
        breadcrumbItem={
          activeTab === "list" ? "Danh sách mã giảm giá" : "Thùng rác"
        }
      />

      <Card className="mb-4">
        <CardHeader className="bg-white border-bottom-0">
          <Nav tabs>
            <NavItem>
              <NavLink
                className={activeTab === "list" ? "active" : ""}
                onClick={() => toggleTab("list")}
              >
                Danh sách mã giảm giá
              </NavLink>
            </NavItem>
          </Nav>
        </CardHeader>
      </Card>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="list">
          <Card className="mb-4">
            <CardHeader className="bg-white border-bottom-0">
              <Row className="align-items-center">
                <Col md={7} sm={12}>
                  <StatusFilterGroup
                    options={statusOptions.map((opt) => ({
                      ...opt,
                      badgeCount:
                        opt.value === "all"
                          ? statusCounts.all
                          : statusCounts[opt.value] ?? 0,
                    }))}
                    value={status}
                    onChange={handleStatusChange}
                  />
                </Col>
                <Col
                  md={5}
                  sm={12}
                  className="d-flex justify-content-md-end mt-2 mt-md-0"
                >
                  <Button
                    color="success"
                    onClick={() => {
                      resetNewCoupon();
                      setModalOpen(true);
                    }}
                  >
                    <i className="bx bxs-discount me-1" /> Thêm mã giảm giá
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
                searchPlaceholder="Tìm kiếm mã giảm giá..."
                statusPlaceholder="Tất cả trạng thái"
              />
            </CardHeader>
          </Card>

          <Card className="mb-4">
            <CardBody>
              {loading ? (
                <div className="text-center my-5">
                  <Spinner color="primary" />
                </div>
              ) : (
                <ListCoupon
                  paginate={{
                    page: meta.current_page,
                    perPage: meta.per_page,
                    totalPage: meta.last_page,
                  }}
                  data={Array.isArray(coupons) ? coupons : []}
                  onDelete={handleDeleteClick}
                  onPageChange={setCurrentPage}
                  onEdit={handleCouponClick}
                />
              )}
            </CardBody>
          </Card>

          <PaginateUi
            currentPage={meta.current_page}
            totalPages={meta.last_page}
            onPageChange={setCurrentPage}
          />
        </TabPane>
      </TabContent>

      {modalOpen && (
        <CreateDiscountCode
          isOpen={modalOpen}
          toggle={() => setModalOpen(false)}
          coupon={newCoupon}
          setCoupon={setNewCoupon}
          onSave={handleSave}
          errors={errors}
        />
      )}
    </div>
  );
};

export default CouponIndex;
