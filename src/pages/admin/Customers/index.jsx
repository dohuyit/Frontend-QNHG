import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  Button,
  Input,
  InputGroup,
  InputGroupText,
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

// Nút trạng thái phía trên
const customerStatusFilterButtons = [
  { label: "Tất cả", value: "all", badgeColor: "secondary" },
  { label: "Đang hoạt động", value: "active", badgeColor: "success" },
  { label: "Tạm ngưng", value: "inactive", badgeColor: "warning" },
];

// Dropdown trạng thái trong filter
const customerStatusDropdownOptions = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Đang hoạt động", value: "active" },
  { label: "Tạm ngưng", value: "inactive" },
];

const CustomerIndex = () => {
  const [customerData, setCustomerData] = useState({ items: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [showFilter, setShowFilter] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getCustomers({
        page,
        keyword: searchKeyword,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
      });
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
  }, [searchKeyword, selectedStatus]);

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

        {/* Switch view dạng list / grid */}
        <Card className="mb-4">
          <CardHeader className="bg-white border-bottom-0">
            <div className="d-flex flex-wrap gap-2 mb-3">
              {customerStatusFilterButtons.map((opt) => (
                  <Button
                      key={opt.value}
                      color={selectedStatus === opt.value ? "primary" : "light"}
                      onClick={() => setSelectedStatus(opt.value)}
                      style={{
                        fontWeight: 500,
                        borderColor: "#ddd",
                        color: selectedStatus === opt.value ? "#fff" : "#333",
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
                  </Button>
              ))}
            </div>

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-5">
              <div className="d-flex flex-wrap gap-2">
                <InputGroup style={{ width: 320 }}>
                  <InputGroupText>
                    <i className="mdi mdi-magnify" />
                  </InputGroupText>
                  <Input
                      type="text"
                      placeholder="Tìm kiếm khách hàng..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </InputGroup>
                <InputGroup style={{ width: 220 }}>
                  <InputGroupText>
                    <i className="mdi mdi-filter-variant" />
                  </InputGroupText>
                  <Input
                      type="select"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {customerStatusDropdownOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                    ))}
                  </Input>
                </InputGroup>
              </div>
              <Button
                  color="light"
                  className="border"
                  style={{ minWidth: 140 }}
                  onClick={() => setShowFilter(true)}
              >
                <i className="mdi mdi-filter-variant me-1"></i> Lọc nâng cao
              </Button>
            </div>
          </CardHeader>
        </Card>

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
