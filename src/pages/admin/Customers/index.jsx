import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
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
} from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import GridCustomer from "@components/admin/Customers/grid-customer";
import ListCustomer from "@components/admin/Customers/list-customer";
import { getCustomers, deleteCustomer } from "@services/admin/customerService";

const customerStatusOptions = [
  { label: "Tất cả", value: "all", badgeColor: "secondary" },
  { label: "Đang hoạt động", value: "active", badgeColor: "success" },
  { label: "Tạm ngưng", value: "inactive", badgeColor: "warning" },
];

const CustomerIndex = () => {
  const [customerData, setCustomerData] = useState({ items: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [showFilter, setShowFilter] = useState(false);

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getCustomers({ page });
      setCustomerData({
        items: res.data.data.items,
        meta: res.data.data.meta,
      });
    } catch (error) {
      console.error("API ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteCustomer(id);
      setCustomerData((prev) => ({
        ...prev,
        items: prev.items.filter((customer) => customer.id !== id),
      }));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="page-content">
      <Breadcrumbs
        title="Danh sách khách hàng"
        breadcrumbItem="Quản lí khách hàng"
      />

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
                {customerStatusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "8px 24px",
                      fontWeight: 400,
                      color: "#333",
                      borderBottom: "3px solid transparent",
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
                      0
                    </Badge>
                  </button>
                ))}
              </div>
            </Col>

            <Col
              md="5"
              sm="12"
              className="d-flex justify-content-md-end justify-content-start align-items-center gap-2"
            >
              <ButtonGroup>
                <Button
                  color={view === "list" ? "primary" : "light"}
                  onClick={() => setView("list")}
                  title="Dạng danh sách"
                >
                  <i className="mdi mdi-format-list-bulleted"></i>
                </Button>
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
        <Row className="align-items-center p-3">
          <Col md="8" sm="12">
            <Input
              type="search"
              placeholder="Tìm kiếm khách hàng..."
              value=""
              onChange={() => {}}
              style={{ maxWidth: 350 }}
              disabled
            />
          </Col>
          <Col
            md="4"
            sm="12"
            className="d-flex justify-content-md-end justify-content-start"
          >
            <Button
              color="light"
              className="border"
              style={{ minWidth: 140 }}
              onClick={() => setShowFilter(true)}
            >
              <i className="mdi mdi-filter-variant me-1"></i> Lọc nâng cao
            </Button>
          </Col>
        </Row>
      </Card>

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
              <Label for="filterName">Tên khách hàng</Label>
              <Input
                id="filterName"
                placeholder="Nhập tên khách hàng..."
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label for="filterAddress">Địa chỉ</Label>
              <Input
                id="filterAddress"
                placeholder="Nhập địa chỉ..."
                disabled
              />
            </FormGroup>
            <Button color="primary" className="mt-3" block disabled>
              Áp dụng lọc
            </Button>
          </Form>
        </OffcanvasBody>
      </Offcanvas>

      {/* Danh sách hoặc lưới khách hàng */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner color="primary" />
        </div>
      ) : view === "list" ? (
        <ListCustomer
          paginate={customerData.meta}
          data={customerData.items}
          onDelete={handleDelete}
          onPageChange={(page) => fetchCustomers(page)}
        />
      ) : (
        <GridCustomer data={customerData.items} />
      )}
    </div>
  );
};

export default CustomerIndex;
