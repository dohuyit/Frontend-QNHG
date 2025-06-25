import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  FormFeedback,
  InputGroup,
} from "reactstrap";
import SwitchUI from "@components/admin/ui/SwitchUI";
import { toast } from "react-toastify";

const ModalDish = ({
  modalOpen,
  setModalOpen,
  newDish,
  setNewDish,
  categories = [],
  unitOptions,
  onSave,
  isEdit = false,
  errors = {},
}) => {
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (modalOpen) {
      const fullImageUrl = "http://localhost:8000/storage/"; // Adjust based on backend configuration
      if (isEdit && newDish.image_url && typeof newDish.image_url === "string") {
        setPreviewImage(`${fullImageUrl}${newDish.image_url}`);
      } else {
        setPreviewImage(null);
      }
    }
  }, [modalOpen, newDish.image_url, isEdit]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn một tệp hình ảnh!");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Hình ảnh quá lớn! Vui lòng chọn tệp dưới 5MB.");
        return;
      }
      setNewDish({ ...newDish, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg" centered>
      <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
        {isEdit ? "Chỉnh sửa món ăn" : "Thêm mới món ăn"}
      </ModalHeader>
      <ModalBody>
        <Form>
          <Row>
            {/* Image Upload */}
            <Col md={12} className="text-center mb-4">
              <FormGroup>
                <Label for="image-upload-button">Hình ảnh</Label>
                <div>
                  <Input
                    id="image_url"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    invalid={!!errors.image}
                    style={{ display: "none" }}
                  />
                  <Button
                    id="image-upload-button"
                    color="primary"
                    onClick={() => document.getElementById("image_url").click()}
                  >
                    Chọn hình ảnh
                  </Button>
                </div>
                {previewImage && (
                  <div className="mt-3">
                    <img
                      src={previewImage}
                      alt="Preview"
                      style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain" }}
                    />
                  </div>
                )}
                {errors.image && (
                  <div className="text-danger small mt-1">
                    {Array.isArray(errors.image) ? errors.image.join(", ") : errors.image}
                  </div>
                )}
              </FormGroup>
            </Col>

            {/* Dish Name */}
            <Col md={6}>
              <FormGroup>
                <Label for="name">
                  Tên món ăn <span className="text-danger">*</span>
                </Label>
                <Input
                  id="name"
                  value={newDish.name || ""}
                  onChange={(e) =>
                    setNewDish({ ...newDish, name: e.target.value })
                  }
                  placeholder="Nhập tên món ăn"
                  invalid={!!errors.name}
                />
                {errors.name && <FormFeedback>{errors.name}</FormFeedback>}
              </FormGroup>
            </Col>

            {/* Category */}
            <Col md={6}>
              <FormGroup>
                <Label for="category_id">
                  Danh mục <span className="text-danger">*</span>
                </Label>
                <Input
                  id="category_id"
                  type="select"
                  value={newDish.category_id || ""}
                  onChange={(e) =>
                    setNewDish({ ...newDish, category_id: e.target.value })
                  }
                  invalid={!!errors.category_id}
                  disabled={categories.length === 0}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Input>
                {categories.length === 0 && (
                  <div className="text-muted small">
                    Không có danh mục nào.
                  </div>
                )}
                {errors.category_id && (
                  <FormFeedback>{errors.category_id}</FormFeedback>
                )}
              </FormGroup>
            </Col>

            {/* Original Price */}
            <Col md={6}>
              <FormGroup>
                <Label for="original_price">
                  Giá gốc <span className="text-danger">*</span>
                </Label>
                <InputGroup>
                  <Input
                    id="original_price"
                    type="number"
                    min={0}
                    value={newDish.original_price || ""}
                    onChange={(e) =>
                      setNewDish({ ...newDish, original_price: e.target.value })
                    }
                    placeholder="Nhập giá gốc"
                    invalid={!!errors.original_price}
                  />
                  <span className="input-group-text">VNĐ</span>
                  {errors.original_price && (
                    <FormFeedback>{errors.original_price}</FormFeedback>
                  )}
                </InputGroup>
              </FormGroup>
            </Col>
            
            {/* Selling Price */}
            <Col md={6}>
              <FormGroup>
                <Label for="selling_price">
                  Giá bán <span className="text-danger">*</span>
                </Label>
                <InputGroup>
                  <Input
                    id="selling_price"
                    type="number"
                    min={0}
                    value={newDish.selling_price || ""}
                    onChange={(e) =>
                      setNewDish({ ...newDish, selling_price: e.target.value })
                    }
                    placeholder="Nhập giá bán"
                    invalid={!!errors.selling_price}
                  />
                  <span className="input-group-text">VNĐ</span>
                  {errors.selling_price && (
                    <FormFeedback>{errors.selling_price}</FormFeedback>
                  )}
                </InputGroup>
              </FormGroup>
            </Col>

            {/* Unit */}
            <Col md={6}>
              <FormGroup>
                <Label for="unit">
                  Đơn vị <span className="text-danger">*</span>
                </Label>
                <Input
                  id="unit"
                  type="select"
                  value={newDish.unit || ""}
                  onChange={(e) =>
                    setNewDish({ ...newDish, unit: e.target.value })
                  }
                  invalid={!!errors.unit}
                >
                  {unitOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Input>
                {errors.unit && <FormFeedback>{errors.unit}</FormFeedback>}
              </FormGroup>
            </Col>

            {/* Tags */}
            <Col md={6}>
              <FormGroup>
                <Label for="tags">Tags</Label>
                <Input
                  id="tags"
                  value={newDish.tags || ""}
                  onChange={(e) =>
                    setNewDish({ ...newDish, tags: e.target.value })
                  }
                  placeholder="VD: cay, chay, ... (phân cách bởi dấu phẩy)"
                  invalid={!!errors.tags}
                />
                {errors.tags && <FormFeedback>{errors.tags}</FormFeedback>}
              </FormGroup>
            </Col>
            
            {/* Description */}
            <Col md={12}>
              <FormGroup>
                <Label for="description">Mô tả</Label>
                <Input
                  id="description"
                  type="textarea"
                  value={newDish.description || ""}
                  onChange={(e) =>
                    setNewDish({ ...newDish, description: e.target.value })
                  }
                  placeholder="Mô tả ngắn về món ăn"
                  invalid={!!errors.description}
                />
                {errors.description && (
                  <FormFeedback>{errors.description}</FormFeedback>
                )}
              </FormGroup>
            </Col>

            {/* Status */}
            <Col md={12} className="mb-3">
              <FormGroup>
                <Label for="statuses">
                  Trạng thái <span className="text-danger">*</span>
                </Label>
                <Input
                  id="statuses"
                  type="select"
                  value={newDish.status || "active"}
                  onChange={(e) =>
                    setNewDish({ ...newDish, status: e.target.value })
                  }
                  invalid={!!errors.status}
                >
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngưng bán</option>
                </Input>
                {errors.status && <FormFeedback>{errors.status}</FormFeedback>}
              </FormGroup>
            </Col>

            {/* Featured */}
            <Col md={12}>
              <FormGroup>
                <div className="d-flex align-items-center justify-content-between p-2 border rounded">
                  <div>
                    <Label for="is_featured_switch" className="mb-0 fw-medium">
                      Món ăn nổi bật
                    </Label>
                    <p className="text-muted small mb-0">
                      Món ăn sẽ được ưu tiên hiển thị.
                    </p>
                  </div>
                  <SwitchUI
                    id="is_featured_switch"
                    checked={!!newDish.is_featured}
                    onChange={(e) => {
                      setNewDish({ ...newDish, is_featured: e.target.checked });
                    }}
                  />
                </div>
              </FormGroup>
            </Col>
          </Row>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={onSave}>
          {isEdit ? "Lưu thay đổi" : "Lưu"}
        </Button>
        <Button color="secondary" onClick={() => setModalOpen(false)}>
          Hủy
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalDish;