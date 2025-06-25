import React from "react";
import PropTypes from "prop-types";
import { Card, CardBody, CardFooter, Badge, Button } from "reactstrap";

const CardCustomer = ({ customer }) => {
  return (
    <Card className="shadow-sm h-100">
      {/* Ảnh nền hoặc placeholder */}
      <div
        style={{
          background: "#e9ecef",
          height: 100,
          borderTopLeftRadius: ".25rem",
          borderTopRightRadius: ".25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Có thể thay bằng ảnh thật nếu có */}
        <i
          className="mdi mdi-storefront"
          style={{ fontSize: 40, color: "#adb5bd" }}
        ></i>
      </div>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">{customer.name}</h5>
          <Badge color="success" pill>
            {customer.status}
          </Badge>
        </div>
        <div className="text-muted mb-2" style={{ fontSize: 14 }}>
          <i className="mdi mdi-map-marker me-1"></i>
          {customer.address}
        </div>
        <div className="bg-light rounded d-flex justify-content-between align-items-center px-3 py-2 mb-3">
          <div className="text-center flex-fill">
            <div className="text-muted" style={{ fontSize: 13 }}>
              <i className="mdi mdi-table-chair me-1"></i> Số bàn
            </div>
            <div style={{ fontWeight: 600, fontSize: 20, color: "#2563eb" }}>
              {customer.tables}
            </div>
          </div>
          <div className="text-center flex-fill">
            <div className="text-muted" style={{ fontSize: 13 }}>
              <i className="mdi mdi-account-group-outline me-1"></i> Nhân viên
            </div>
            <div style={{ fontWeight: 600, fontSize: 20, color: "#2563eb" }}>
              {customer.staff}
            </div>
          </div>
        </div>
        <div className="mb-2">
          <div className="text-muted" style={{ fontSize: 14 }}>
            <i className="mdi mdi-phone-outline me-1"></i>
            {customer.phone}
          </div>
          <div className="text-muted" style={{ fontSize: 14 }}>
            <i className="mdi mdi-email-outline me-1"></i>
            {customer.email}
          </div>
        </div>
        <div className="mb-3">
          <div className="text-muted" style={{ fontSize: 14 }}>
            <i className="mdi mdi-clock-outline me-1"></i>
            {customer.openTime.map((t, idx) => (
              <div key={idx}>{t}</div>
            ))}
          </div>
        </div>
      </CardBody>
      <CardFooter className="bg-transparent border-top d-flex justify-content-between">
        <Button color="light" className="me-2">
          <i className="mdi mdi-eye-outline me-1"></i>Chi tiết
        </Button>
        <Button color="primary" outline className="me-2">
          <i className="mdi mdi-pencil-outline me-1"></i>Sửa
        </Button>
      </CardFooter>
    </Card>
  );
};

CardCustomer.propTypes = {
  customer: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    address: PropTypes.string,
    status: PropTypes.string,
    tables: PropTypes.number,
    staff: PropTypes.number,
    phone: PropTypes.string,
    email: PropTypes.string,
    openTime: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default CardCustomer;
