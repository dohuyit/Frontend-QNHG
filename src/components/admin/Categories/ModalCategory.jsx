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
} from "reactstrap";
import { toast } from "react-toastify";

const ModalCategory = ({
  modalOpen,
  setModalOpen,
  newCategory,
  setNewCategory,
  categories = [],
  onSave,
  isEdit = false,
  errors = {},
}) => {
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (modalOpen) {
      const fullImageUrl = "http://localhost:8000/storage/";
      if (isEdit && newCategory.image_url && typeof newCategory.image_url === "string") {
        setPreviewImage(`${fullImageUrl}${newCategory.image_url}`);
      } else {
        setPreviewImage(null);
      }
    }
  }, [modalOpen, newCategory.image_url, isEdit]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn một tệp hình ảnh!");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Hình ảnh quá lớn! Vui lòng chọn tệp dưới 5MB.");
        return;
      }
      setNewCategory({ ...newCategory, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg" centered>
      <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
        {isEdit ? "Chỉnh sửa danh mục" : "Thêm mới danh mục"}
      </ModalHeader>
      <ModalBody>
        <Form>
          <Row>
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

            <Col md={6}>
              <FormGroup>
                <Label for="name">
                  Tên danh mục <span className="text-danger">*</span>
                </Label>
                <Input
                  id="name"
                  value={newCategory.name || ""}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  placeholder="Nhập tên danh mục"
                  invalid={!!errors.name}
                />
                {errors.name && <FormFeedback>{errors.name}</FormFeedback>}
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label for="parent_id">Danh mục cha</Label>
                <Input
                  id="parent_id"
                  type="select"
                  value={newCategory.parent_id || ""}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, parent_id: e.target.value })
                  }
                  invalid={!!errors.parent_id}
                  disabled={categories.length === 0}
                >
                  <option value="">Không có danh mục cha</option>
                  {categories
                    .filter((cat) => cat.id !== (isEdit ? newCategory.id : null))
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </Input>
                {errors.parent_id && <FormFeedback>{errors.parent_id}</FormFeedback>}
              </FormGroup>
            </Col>

            <Col md={12}>
              <FormGroup>
                <Label for="description">Mô tả</Label>
                <Input
                  id="description"
                  type="textarea"
                  value={newCategory.description || ""}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, description: e.target.value })
                  }
                  placeholder="Mô tả ngắn về danh mục"
                  invalid={!!errors.description}
                />
                {errors.description && <FormFeedback>{errors.description}</FormFeedback>}
              </FormGroup>
            </Col>

            <Col md={12}>
              <FormGroup>
                <div className="d-flex align-items-center justify-content-between p-2 border rounded">
                  <div>
                    <Label for="is_active_switch" className="mb-0 fw-medium">
                      Trạng thái hoạt động
                    </Label>
                    <p className="text-muted small mb-0">
                      Danh mục sẽ được hiển thị nếu bật.
                    </p>
                  </div>
                  <Input
                    type="checkbox"
                    id="is_active_switch"
                    checked={!!newCategory.is_active}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, is_active: e.target.checked })
                    }
                  />
                </div>
                {errors.is_active && (
                  <div className="text-danger small mt-1">{errors.is_active}</div>
                )}
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

export default ModalCategory;