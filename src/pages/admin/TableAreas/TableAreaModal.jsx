import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
  Row,
  Col,
  FormFeedback,
} from "reactstrap";
import { toast } from "react-toastify";
import {
  getTableArea,
  updateTableArea,
  createTableArea,
} from "@services/admin/tableAreaService";

const TableAreaModal = ({
  modalOpen,
  setModalOpen,
  newTableArea,
  setNewTableArea,
  onSave,
  isEdit = false,
  errors = {},
  selectedId = null,
}) => {
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens for creating a new table area
  useEffect(() => {
    if (modalOpen && !isEdit) {
      setNewTableArea({
        name: "",
        description: "",
        capacity: "",
        status: "active",
      });
    }
  }, [modalOpen, isEdit, setNewTableArea]);

  // Fetch area details for editing
  useEffect(() => {
    if (modalOpen && isEdit && selectedId) {
      fetchAreaDetail(selectedId);
    }
  }, [modalOpen, isEdit, selectedId]);

  const fetchAreaDetail = async (id) => {
    setLoading(true);
    try {
      const res = await getTableArea(id);
      console.log("API response:", res);
      const data = res?.data.data.table_area ;
      if (!data) {
        throw new Error("Invalid data format received from API");
      }
      setNewTableArea({
        name: data.name || "",
        description: data.description || "",
        capacity: data.capacity || "",
        status: data.status || "active",
      });
    } catch (error) {
      console.error("Error fetching area detail:", error);
      toast.error(error.message || "Không thể tải chi tiết khu vực!");
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Client-side validation before saving
  const handleSave = async () => {
    const validationErrors = {};
    if (!newTableArea.name) validationErrors.name = "Tên khu vực là bắt buộc";
    if (!newTableArea.capacity || newTableArea.capacity < 1)
      validationErrors.capacity = "Sức chứa phải là số lớn hơn 0";
    if (newTableArea.description && newTableArea.description.length > 255)
      validationErrors.description = "Mô tả không được vượt quá 255 ký tự";

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      onSave(validationErrors); // Pass errors back to parent
      return;
    }

    setLoading(true);
    try {
      if (isEdit && selectedId) {
        await updateTableArea(selectedId, newTableArea);
        toast.success("Cập nhật khu vực bàn thành công!");
      } else {
        await createTableArea(newTableArea);
        toast.success("Tạo khu vực bàn thành công!");
      }
      onSave(); // Notify parent of success
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving table area:", error);
      toast.error(error.message || "Lưu khu vực bàn thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="lg" centered>
      <ModalHeader toggle={() => setModalOpen(false)}>
        {isEdit ? "Chỉnh sửa khu vực bàn" : "Thêm mới khu vực bàn"}
      </ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="text-center my-4">
            <Spinner color="primary" />
            <div className="mt-2">Đang tải thông tin...</div>
          </div>
        ) : (
          <Form>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="name">
                    Tên khu vực <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={newTableArea.name || ""}
                    onChange={(e) =>
                      setNewTableArea({ ...newTableArea, name: e.target.value })
                    }
                    placeholder="Nhập tên khu vực"
                    invalid={!!errors.name}
                    maxLength={100}
                  />
                  {errors.name && <FormFeedback>{errors.name}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="capacity">
                    Sức chứa <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newTableArea.capacity || ""}
                    onChange={(e) =>
                      setNewTableArea({ ...newTableArea, capacity: e.target.value })
                    }
                    placeholder="Nhập sức chứa"
                    invalid={!!errors.capacity}
                    min={1}
                  />
                  {errors.capacity && <FormFeedback>{errors.capacity}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup>
                  <Label for="description">Mô tả</Label>
                  <Input
                    id="description"
                    type="textarea"
                    value={newTableArea.description || ""}
                    onChange={(e) =>
                      setNewTableArea({ ...newTableArea, description: e.target.value })
                    }
                    placeholder="Mô tả ngắn về khu vực bàn"
                    invalid={!!errors.description}
                    maxLength={255}
                  />
                  {errors.description && <FormFeedback>{errors.description}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup>
                  <div className="d-flex align-items-center justify-content-between p-2 border rounded">
                    <div>
                      <Label for="status_switch" className="mb-0 fw-medium">
                        Trạng thái hoạt động
                      </Label>
                      <p className="text-muted small mb-0">
                        Khu vực sẽ được hiển thị nếu bật.
                      </p>
                    </div>
                    <Input
                      type="select"
                      id="status_switch"
                      value={newTableArea.status || "active"}
                      onChange={(e) =>
                        setNewTableArea({ ...newTableArea, status: e.target.value })
                      }
                      style={{ width: "auto" }}
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                    </Input>
                  </div>
                  {errors.status && (
                    <div className="text-danger small mt-1">{errors.status}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>
          </Form>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSave} disabled={loading}>
          {loading ? <Spinner size="sm" /> : isEdit ? "Lưu thay đổi" : "Lưu"}
        </Button>
        <Button color="secondary" onClick={() => setModalOpen(false)} disabled={loading}>
          Hủy
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TableAreaModal;