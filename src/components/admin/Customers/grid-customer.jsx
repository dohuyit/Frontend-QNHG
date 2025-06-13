import React from "react";
import { Row, Col } from "reactstrap";
import CardCustomer from "./card-customer";

const GridCustomer = ({ data = [] }) => {
  return (
    <Row>
      {data.map((customer) => (
        <Col md="3" sm="6" xs="12" key={customer.id} className="mb-4">
          <CardCustomer customer={customer} />
        </Col>
      ))}
    </Row>
  );
};

export default GridCustomer;
