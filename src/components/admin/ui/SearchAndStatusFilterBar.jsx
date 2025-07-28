import React from "react";
import { Row, Col, Input, Button } from "reactstrap";

/**
 * SearchAndStatusFilterBar - Search + status select filter bar
 * @param {string} searchValue
 * @param {function} onSearchChange
 * @param {string} statusValue
 * @param {function} onStatusChange
 * @param {Array} statusOptions - [{label, value}]
 * @param {string} searchPlaceholder
 * @param {string} statusPlaceholder
 * @param {ReactNode} rightContent - optional (e.g. advanced filter button)
 * @param {string} className
 * @param {object} style
 */
const SearchAndStatusFilterBar = ({
  searchValue = "",
  onSearchChange,
  statusValue = "all",
  onStatusChange,
  statusOptions = [],
  searchPlaceholder = "Tìm kiếm...",
  statusPlaceholder = "Tất cả trạng thái",
  rightContent = null,
  className = "",
  style = {},
}) => {
  return (
    <Row className={`align-items-center ${className}`} style={style}>
      <Col md={4} className="mb-2 mb-md-0">
        <div className="input-group">
          <span className="input-group-text">
            <i className="mdi mdi-magnify" />
          </span>
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
        </div>
      </Col>
      <Col md={3} className="mb-2 mb-md-0">
        <div className="input-group">
          <span className="input-group-text">
            <i className="mdi mdi-filter-variant" />
          </span>
          <Input
            type="select"
            value={statusValue}
            onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
          >
            <option value="all">{statusPlaceholder}</option>
            {statusOptions
              .filter((opt) => opt.value !== "all")
              .map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
          </Input>
        </div>
      </Col>
      <Col
        md={5}
        className="d-flex justify-content-md-end justify-content-start"
      >
        {rightContent}
      </Col>
    </Row>
  );
};

export default SearchAndStatusFilterBar;
