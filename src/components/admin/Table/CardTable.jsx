import React, { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

const TableCard = ({
  tableId,
  seatCount = 4,
  status = "available", // available, occupied, reserved
  onClick,
  onDelete,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Tính toán chiều dài bàn dựa trên số ghế và ảnh mẫu
  const getTableWidth = (seats) => {
    const clampedSeats = Math.max(2, Math.min(seats, 8)); // Ensure seats are between 2 and 8

    // These values are visually tuned to approximate the image's scaling
    if (clampedSeats === 2) return 140; // Approximate width for T7, T1
    if (clampedSeats === 4) return 200; // Approximate width for T2, T6, T8
    if (clampedSeats === 6) return 280; // Approximate width for T4
    if (clampedSeats === 8) return 360; // Approximate width for T3, T5

    // Fallback for odd seat counts
    if (clampedSeats < 4) {
      return 140 + (200 - 140) * ((clampedSeats - 2) / (4 - 2));
    } else if (clampedSeats < 6) {
      return 200 + (280 - 200) * ((clampedSeats - 4) / (6 - 4));
    } else if (clampedSeats < 8) {
      return 280 + (360 - 280) * ((clampedSeats - 6) / (8 - 6));
    }
    return clampedSeats; // Should not be reached with clamp
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "occupied":
        return "✔️";
      case "reserved":
        return "🔔";
      case "cleaning":
        return "🧹";
      case "out_of_service":
        return "⛔";
      default: // available
        return "☕";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "occupied":
        return "#ff6b6b";
      case "reserved":
        return "#ffd93d";
      case "cleaning":
        return "#17a2b8";
      case "out_of_service":
        return "#6c757d";
      default:
        return "#6bcf7f";
    }
  };

  const getTableColor = (status) => {
    switch (status) {
      case "occupied":
        return "#ffe6e6";
      case "reserved":
        return "#fff3cd";
      case "cleaning":
        return "#e0f7fa";
      case "out_of_service":
        return "#f0f0f0";
      default:
        return "#e8f5e8";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "occupied":
        return "Đang sử dụng";
      case "reserved":
        return "Đã đặt";
      case "cleaning":
        return "Đang dọn dẹp";
      case "out_of_service":
        return "Ngưng phục vụ";
      default:
        return "Trống";
    }
  };

  const badgeStyle = {
    backgroundColor: getStatusColor(status),
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  };

  const cardStyle = {
    border: "1px solid #dee2e6",
    borderRadius: "12px",
    background: "white",
    marginBottom: "1rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    padding: "1rem",
    position: "relative",
  };

  const seatStyle = {
    height: "12px",
    backgroundColor: "#e6f3ff",
    border: "1px solid #b3d9ff",
    borderRadius: "3px",
    flexGrow: 1,
    margin: "0 2px",
  };

  const menuButtonStyle = {
    cursor: "pointer",
    fontSize: "24px",
    color: "#666",
    padding: "4px",
    border: "none",
    background: "none",
  };

  return (
    <div
      className="table-card"
      style={cardStyle}
      onClick={() => onClick && onClick(tableId)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span style={badgeStyle}>{getStatusText(status)}</span>
        <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
          <DropdownToggle
            tag="button"
            style={menuButtonStyle}
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event
            }}
          >
            ⋮
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem onClick={(e) => {
              e.stopPropagation();
              onClick && onClick(tableId); // Trigger edit action
            }}>
              Sửa
            </DropdownItem>
            <DropdownItem onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete(tableId);
            }}>
              Xóa
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: `${getTableWidth(seatCount)}px`,
          margin: "20px auto",
        }}
      >
        {/* Top Seats Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            padding: "0 10px",
            marginBottom: "10px",
            boxSizing: "border-box",
          }}
        >
          {Array.from({ length: Math.ceil(seatCount / 2) }).map((_, i) => (
            <div
              key={`seat-top-${i}`}
              className="seat seat-top"
              style={seatStyle}
            />
          ))}
        </div>

        {/* Table Surface */}
        <div
          className="table-surface"
          style={{
            width: "100%",
            height: "60px",
            backgroundColor: getTableColor(status),
            borderRadius: "8px",
            border: `2px solid ${getStatusColor(status)}`,
            padding: "0 8px",
            color: "#666",
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="w-100 d-flex justify-content-end pt-1">
            <span>{getStatusIcon(status)}</span>
          </div>
          <div className="w-100 d-flex justify-content-center pb-2">
            <span>T{tableId}</span>
          </div>
        </div>

        {/* Bottom Seats Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            padding: "0 10px",
            marginTop: "10px",
            boxSizing: "border-box",
          }}
        >
          {Array.from({ length: Math.floor(seatCount / 2) }).map((_, i) => (
            <div
              key={`seat-bottom-${i}`}
              className="seat seat-bottom"
              style={seatStyle}
            />
          ))}
        </div>
      </div>

      <div className="text-center">
        <small className="text-muted">{seatCount} ghế</small>
      </div>
    </div>
  );
};

export default TableCard;