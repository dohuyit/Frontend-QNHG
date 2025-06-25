import React from "react";
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

const statusOptions = [
  { value: "available", label: "Trống" },
  { value: "occupied", label: "Đang sử dụng" },
  { value: "reserved", label: "Đã đặt" },
  { value: "cleaning", label: "Đang dọn dẹp" },
  { value: "out_of_service", label: "Ngưng phục vụ" },
];

const TableModal = ({
  modalOpen,
  setModalOpen,
  newTable,
  setNewTable,
  tableAreas,
  onSave,
  isEdit = false,
  errors = {},
}) => (
  <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg" centered>
    <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
      {isEdit ? "Chỉnh sửa bàn" : "Thêm mới bàn"}
    </ModalHeader>
    <ModalBody>
      <Form>
        <Row>
          <Col md={6}>
            <FormGroup>
              <Label for="table_number">
                Số bàn <span className="text-danger">*</span>
              </Label>
              <Input
                id="table_number"
                value={newTable.table_number}
                onChange={(e) =>
                  setNewTable({ ...newTable, table_number: e.target.value })
                }
                placeholder="Nhập số bàn"
                invalid={!!errors.table_number}
              />
              {errors.table_number && (
                <FormFeedback>
                  {Array.isArray(errors.table_number)
                    ? errors.table_number.join(", ")
                    : errors.table_number}
                </FormFeedback>
              )}
            </FormGroup>
            <FormGroup>
              <Label for="description">Mô tả</Label>
              <Input
                id="description"
                value={newTable.description}
                onChange={(e) =>
                  setNewTable({ ...newTable, description: e.target.value })
                }
                placeholder="Mô tả ngắn về bàn"
                invalid={!!errors.description}
              />
              {errors.description && (
                <FormFeedback>
                  {Array.isArray(errors.description)
                    ? errors.description.join(", ")
                    : errors.description}
                </FormFeedback>
              )}
            </FormGroup>
            <FormGroup>
              <Label for="table_area_id">
                Khu vực <span className="text-danger">*</span>
              </Label>
              <Input
                id="table_area_id"
                type="select"
                value={newTable.table_area_id}
                onChange={(e) =>
                  setNewTable({ ...newTable, table_area_id: e.target.value })
                }
                invalid={!!errors.table_area_id}
              >
                <option value="">Chọn khu vực</option>
                {tableAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </Input>
              {errors.table_area_id && (
                <FormFeedback>
                  {Array.isArray(errors.table_area_id)
                    ? errors.table_area_id.join(", ")
                    : errors.table_area_id}
                </FormFeedback>
              )}
            </FormGroup>
            <FormGroup>
              <Label for="statuses">Trạng thái</Label>
              <Input
                id="statuses"
                type="select"
                value={newTable.status}
                onChange={(e) =>
                  setNewTable({ ...newTable, status: e.target.value })
                }
                invalid={!!errors.status}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Input>
              {errors.status && (
                <FormFeedback>
                  {Array.isArray(errors.status)
                    ? errors.status.join(", ")
                    : errors.status}
                </FormFeedback>
              )}
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
                min={1}
                value={newTable.capacity}
                onChange={(e) =>
                  setNewTable({ ...newTable, capacity: e.target.value })
                }
                placeholder="Số ghế"
                invalid={!!errors.capacity}
              />
              {errors.capacity && (
                <FormFeedback>
                  {Array.isArray(errors.capacity)
                    ? errors.capacity.join(", ")
                    : errors.capacity}
                </FormFeedback>
              )}
            </FormGroup>
            <FormGroup>
              <Label for="min_guests">Số khách tối thiểu</Label>
              <Input
                id="min_guests"
                type="number"
                min={1}
                value={newTable.min_guests}
                onChange={(e) =>
                  setNewTable({ ...newTable, min_guests: e.target.value })
                }
                placeholder="Tối thiểu"
                invalid={!!errors.min_guests}
              />
              {errors.min_guests && (
                <FormFeedback>
                  {Array.isArray(errors.min_guests)
                    ? errors.min_guests.join(", ")
                    : errors.min_guests}
                </FormFeedback>
              )}
            </FormGroup>
            <FormGroup>
              <Label for="max_guests">Số khách tối đa</Label>
              <Input
                id="max_guests"
                type="number"
                min={1}
                value={newTable.max_guests}
                onChange={(e) =>
                  setNewTable({ ...newTable, max_guests: e.target.value })
                }
                placeholder="Tối đa"
                invalid={!!errors.max_guests}
              />
              {errors.max_guests && (
                <FormFeedback>
                  {Array.isArray(errors.max_guests)
                    ? errors.max_guests.join(", ")
                    : errors.max_guests}
                </FormFeedback>
              )}
            </FormGroup>
            <FormGroup>
              <Label for="tags">Tags</Label>
              <Input
                id="tags"
                value={newTable.tags}
                onChange={(e) =>
                  setNewTable({ ...newTable, tags: e.target.value })
                }
                placeholder="VD: VIP, ngoài trời, ... (phân cách bởi dấu phẩy)"
                invalid={!!errors.tags}
              />
              {errors.tags && (
                <FormFeedback>
                  {Array.isArray(errors.tags)
                    ? errors.tags.join(", ")
                    : errors.tags}
                </FormFeedback>
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

export default TableModal;