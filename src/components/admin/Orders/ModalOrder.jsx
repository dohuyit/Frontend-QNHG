import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Button,
} from "reactstrap";
import Swal from "sweetalert2";

const ModalOrder = ({ isOpen, toggle, onSave, formData, setFormData }) => {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Reset errors when modal opens or form data changes
    setErrors({});
  }, [isOpen, formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.customer_name || !formData.customer_phone) {
      Swal.fire({
        title: "Lỗi!",
        text: "Vui lòng điền đầy đủ thông tin bắt buộc (tên và số điện thoại)",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const payload = {
      order_type: formData.order_type,
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      customer_email: formData.customer_email,
      notes: formData.notes,
      items: formData.items,
    };

    if (formData.order_type === "dine-in") {
      payload.table_id = formData.table_id || null;
    } else if (formData.order_type === "delivery") {
      if (
        !formData.delivery_address ||
        !formData.delivery_contact_name ||
        !formData.delivery_contact_phone
      ) {
        Swal.fire({
          title: "Lỗi!",
          text: "Vui lòng điền đầy đủ thông tin giao hàng",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
      payload.delivery_address = formData.delivery_address;
      payload.delivery_contact_name = formData.delivery_contact_name;
      payload.delivery_contact_phone = formData.delivery_contact_phone;
    }

    try {
      await onSave(payload);
      Swal.fire({
        title: "Thành công!",
        text: "Đã tạo đơn hàng thành công",
        icon: "success",
        confirmButtonText: "OK",
      });
      toggle();
      setFormData({
        order_type: "dine-in",
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        table_id: "",
        notes: "",
        items: [],
        delivery_address: "",
        delivery_contact_name: "",
        delivery_contact_phone: "",
      });
    } catch (error) {
      console.error("Error creating order:", error);
      Swal.fire({
        title: "Lỗi!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Không thể tạo đơn hàng",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>Tạo đơn hàng mới</ModalHeader>
      <ModalBody>
        <Form>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="order_type">Loại đơn hàng *</Label>
                <Input
                  id="order_type"
                  name="order_type"
                  type="select"
                  value={formData.order_type}
                  onChange={handleChange}
                  required
                >
                  <option value="dine-in">Tại bàn</option>
                  <option value="takeaway">Mang về</option>
                  <option value="delivery">Giao hàng</option>
                </Input>
              </FormGroup>
            </Col>
            {formData.order_type === "dine-in" && (
              <Col md={6}>
                <FormGroup>
                  <Label for="table_id">Bàn</Label>
                  <Input
                    id="table_id"
                    name="table_id"
                    type="select"
                    value={formData.table_id}
                    onChange={handleChange}
                  >
                    <option value="">Chọn bàn</option>
                    <option value="1">Bàn 1</option>
                    <option value="2">Bàn 2</option>
                    <option value="3">Bàn 3</option>
                  </Input>
                </FormGroup>
              </Col>
            )}
          </Row>
          <hr />
          <h6 className="mb-3">Thông tin khách hàng</h6>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="customer_name">Tên khách hàng *</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="customer_phone">Số điện thoại *</Label>
                <Input
                  id="customer_phone"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  name="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
          </Row>

          {formData.order_type === "delivery" && (
            <>
              <hr />
              <h6 className="mb-3">Thông tin giao hàng</h6>
              <FormGroup>
                <Label for="delivery_address">Địa chỉ giao hàng *</Label>
                <Input
                  id="delivery_address"
                  name="delivery_address"
                  type="textarea"
                  rows="2"
                  value={formData.delivery_address}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="delivery_contact_name">Tên người nhận *</Label>
                    <Input
                      id="delivery_contact_name"
                      name="delivery_contact_name"
                      value={formData.delivery_contact_name}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="delivery_contact_phone">SĐT người nhận *</Label>
                    <Input
                      id="delivery_contact_phone"
                      name="delivery_contact_phone"
                      value={formData.delivery_contact_phone}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                </Col>
              </Row>
            </>
          )}

          <hr />
          <FormGroup>
            <Label for="notes">Ghi chú</Label>
            <Input
              id="notes"
              name="notes"
              type="textarea"
              value={formData.notes}
              onChange={handleChange}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Hủy
        </Button>
        <Button color="primary" onClick={handleSubmit}>
          Tạo đơn hàng
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalOrder;