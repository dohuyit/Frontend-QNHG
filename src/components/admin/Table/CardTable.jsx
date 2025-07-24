import React, { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Alert,
} from "reactstrap";
import { toast } from "react-toastify";

const TableCard = ({
  tableId,
  tableNumber,
  seatCount = "4 ghế",
  status = "available", // available, occupied, reserved
  onClick,
  onDelete,
  onViewDetail,
  hideMenu = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [show, setShow] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggle = () => setShow(!show);

  const handleCardClick = () => {
    // Gọi onViewDetail để hiển thị modal chi tiết cho tất cả trạng thái bàn
    if (onViewDetail) {
      onViewDetail(tableId);
    }
  };

  // Tính toán chiều dài bàn dựa trên loại bàn
  const getTableWidth = (seatType) => {
    if (typeof seatType === 'string') {
      if (seatType.includes('2')) return 140;
      if (seatType.includes('4')) return 200;
      if (seatType.includes('6')) return 280;
      if (seatType.includes('8')) return 360;
    }
    
    // Fallback cho số ghế cũ
    const seats = parseInt(seatType) || 4;
    const clampedSeats = Math.max(2, Math.min(seats, 8));

    if (clampedSeats === 2) return 140;
    if (clampedSeats === 4) return 200;
    if (clampedSeats === 6) return 280;
    if (clampedSeats === 8) return 360;

    if (clampedSeats < 4) {
      return 140 + (200 - 140) * ((clampedSeats - 2) / (4 - 2));
    } else if (clampedSeats < 6) {
      return 200 + (280 - 200) * ((clampedSeats - 4) / (6 - 4));
    } else if (clampedSeats < 8) {
      return 280 + (360 - 280) * ((clampedSeats - 6) / (8 - 6));
    }
    return clampedSeats;
  };

  // Tính số ghế từ loại bàn
  const getSeatCount = (seatType) => {
    if (typeof seatType === 'string') {
      if (seatType.includes('2')) return 2;
      if (seatType.includes('4')) return 4;
      if (seatType.includes('8')) return 8;
    }
    return parseInt(seatType) || 4;
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
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    cursor: status === "available" ? "default" : "pointer",
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

  const actualSeatCount = getSeatCount(seatCount);

  return (
    <div
      className="table-card"
      style={cardStyle}
      onClick={handleCardClick}
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
        {!hideMenu && (
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
                onViewDetail && onViewDetail(tableId);
              }}>
                Xem chi tiết
              </DropdownItem>
              <DropdownItem onClick={(e) => {
                e.stopPropagation();
                if (status === "occupied") {
                  toast.error("Không thể sửa bàn đang sử dụng!");
                  return;
                }
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
        )}
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
          {Array.from({ length: Math.ceil(actualSeatCount / 2) }).map((_, i) => (
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
          <div className="w-100 d-flex justify-content-center align-items-center pb-2 h-100">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translateY(4px)',
                backgroundColor: getTableColor(status),
                fontWeight: 600,
                color: getStatusColor(status),
                fontSize: 14,
              }}
            >
              {tableNumber}
            </div>
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
          {Array.from({ length: Math.floor(actualSeatCount / 2) }).map((_, i) => (
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

      <Alert color="success" isOpen={show} toggle={toggle} timeout={0}>
        {/* ... */}
      </Alert>
    </div>
  );
};

export default TableCard;