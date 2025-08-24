import React, { useState } from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import Badge from "@components/admin/ui/Badge";
import { FaEye, FaTrash, FaEdit, FaClock, FaUserFriends } from "react-icons/fa";
import "./cardCombo.scss";
import dishDefaultImg from "@assets/admin/images/dish/dish-default.webp";

const ComboCardGrid = ({
  data = [],
  onDetail,
  onEdit,
  onDelete,
  onAddDish,
  onToggleStatus,
}) => {
  return (
    <Row className="g-4">
      {data.length === 0 ? (
        <Col xs={12} className="text-center text-muted">
          Không có combo nào
        </Col>
      ) : (
        data.map((combo) => (
          <Col key={combo.id} xs={12} sm={12} md={6} lg={6} xl={6}>
            <ComboCard
              combo={combo}
              onDetail={onDetail}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddDish={onAddDish}
              onToggleStatus={onToggleStatus}
            />
          </Col>
        ))
      )}
    </Row>
  );
};

const ComboCard = ({ combo, onDetail, onEdit, onDelete }) => {
  const [imgError, setImgError] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    let imgPath = url;
    if (!imgPath.startsWith("/storage")) {
      imgPath = "/storage/" + imgPath.replace(/^\/+/, "");
    }
    return `http://localhost:8000${imgPath}`;
  };

  return (
    <Card className="combo-card">
      <CardBody>
        <Row className="combo-header">
          <Col xs={3} className="pe-0">
            <div className="combo-image">
              <img
                src={
                  !imgError && combo.image_url
                    ? getImageUrl(combo.image_url)
                    : dishDefaultImg
                }
                alt={combo.name}
                onError={() => setImgError(true)}
                className="combo-img"
              />
            </div>
          </Col>

          <Col xs={9} className="ps-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h5 className="combo-title mb-0">{combo.name}</h5>
              <Badge
                type={Number(combo.is_active) === 1 ? "success" : "secondary"}
              >
                {Number(combo.is_active) === 1
                  ? "Hoạt động"
                  : "Ngừng hoạt động"}
              </Badge>
            </div>

            <p className="combo-description">
              {combo.description || "Bữa ăn cao cấp dành cho 2 người"}
            </p>

            <div className="price-section">
              <span className="current-price">
                {formatPrice(combo.selling_price)}
              </span>
              {combo.original_total_price && (
                <span className="original-price">
                  {formatPrice(combo.original_total_price)}
                </span>
              )}
            </div>

            <div className="combo-meta">
              <div className="meta-item">
                <FaClock />
                <span>45-60 phút</span>
              </div>
              <div className="meta-item">
                <FaUserFriends />
                <span>{combo.persons || 2} người</span>
              </div>
            </div>
          </Col>
        </Row>
      </CardBody>

      <div className="combo-footer ">
        <div className="footer-actions">
          <button
            className="action-btn view-btn"
            onClick={() => onDetail && onDetail(combo.id)}
          >
            <FaEye />
            Xem chi tiết
          </button>
          <button
            className="action-btn edit-btn"
            onClick={() => onEdit && onEdit(combo.id)}
          >
            <FaEdit />
            Chỉnh sửa
          </button>
          <button
            className="action-btn delete-btn"
            onClick={() => onDelete && onDelete(combo.id)}
          >
            <FaTrash />
            Xóa
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ComboCardGrid;
