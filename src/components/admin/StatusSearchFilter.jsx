import React from "react";
import { Input, ButtonGroup, Button, Row, Col } from "reactstrap";

const StatusSearchFilter = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  statusOptions = [],
}) => {
  return (
    <Row className="align-items-center mb-3">
      <Col md="4" sm="12" className="mb-2 mb-md-0">
        <Input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Col>
      <Col
        md="8"
        sm="12"
        className="d-flex flex-wrap gap-2 justify-content-md-end justify-content-start"
      >
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            color={statusFilter === option.value ? option.badgeColor : "light"}
            onClick={() => setStatusFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </Col>
    </Row>
  );
};

export default StatusSearchFilter;
