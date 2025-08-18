import React from "react";
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
    FormFeedback,
    Row,
    Col
} from "reactstrap";

const CreateDiscountCode = ({ isOpen, toggle, coupon, setCoupon, onSave, errors }) => {
    const handleChange = (field, value) => {
        setCoupon((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>
                {coupon.id ? "Sửa mã giảm giá" : "Thêm mã giảm giá"}
            </ModalHeader>
            <ModalBody>
                <Form>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="code">Mã</Label>
                                <Input
                                    id="code"
                                    value={coupon.code}
                                    onChange={(e) => handleChange("code", e.target.value)}
                                    invalid={!!errors.code}
                                />
                                {errors.code && <FormFeedback>{errors.code[0]}</FormFeedback>}
                            </FormGroup>
                        </Col>

                        <Col md={6}>
                            <FormGroup>
                                <Label for="discount_type">Loại</Label>
                                <Input
                                    id="discount_type"
                                    type="select"
                                    value={coupon.discount_type}
                                    onChange={(e) => handleChange("discount_type", e.target.value)}
                                >
                                    <option value="percentage">Phần trăm</option>
                                    <option value="fixed">Tiền cố định</option>
                                </Input>
                            </FormGroup>
                        </Col>

                        <Col md={6}>
                            <FormGroup>
                                <Label for="discount_value">Giá trị</Label>
                                <Input
                                    id="discount_value"
                                    type="number"
                                    value={coupon.discount_value}
                                    onChange={(e) => handleChange("discount_value", e.target.value)}
                                />
                            </FormGroup>
                        </Col>

                        <Col md={6}>
                            <FormGroup>
                                <Label for="usage_limit">Giới hạn sử dụng</Label>
                                <Input
                                    id="usage_limit"
                                    type="number"
                                    value={coupon.usage_limit}
                                    onChange={(e) => handleChange("usage_limit", e.target.value)}
                                />
                            </FormGroup>
                        </Col>

                        <Col md={6}>
                            <FormGroup>
                                <Label for="start_date">Ngày bắt đầu</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={coupon.start_date}
                                    onChange={(e) => handleChange("start_date", e.target.value)}
                                />
                            </FormGroup>
                        </Col>

                        <Col md={6}>
                            <FormGroup>
                                <Label for="end_date">Ngày kết thúc</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={coupon.end_date}
                                    onChange={(e) => handleChange("end_date", e.target.value)}
                                />
                            </FormGroup>
                        </Col>

                        

                        <Col md={12}>
                            <FormGroup>
                                <Label for="status">Trạng thái</Label>
                                <Input
                                    type="select"
                                    value={coupon.status}
                                    onChange={(e) => handleChange("status", e.target.value)}
                                >
                                    <option value="active">Đang áp dụng</option>
                                    <option value="inactive">Ngừng áp dụng</option>
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={onSave}>
                    Lưu
                </Button>
                <Button color="secondary" onClick={toggle}>
                    Hủy
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default CreateDiscountCode;
