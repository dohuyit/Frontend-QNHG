import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Badge,
  FormText,
  Spinner,
  FormFeedback, // Import FormFeedback
  Modal,        // Import Modal
  ModalHeader,  // Import ModalHeader
  ModalBody,    // Import ModalBody
} from "reactstrap";
import { useProvinces, useDistricts, useWards } from '@hooks/admin/useAdministrativeUnits';

// Import Formik
import { useFormik } from "formik";

// Import SCSS file
import './CustomerForm.scss';

const genderOptions = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

const statusOptions = [
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Ngưng hoạt động" },
  { value: "blocked", label: "Khóa" },
];

const CustomerForm = ({ initialValues = {}, isEdit = false, onSubmit, loading, apiErrors = {} }) => {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarInputKey, setAvatarInputKey] = useState(Date.now()); 
  const [isAvatarDeleted, setIsAvatarDeleted] = useState(false);

  const [modalOpen, setModalOpen] = useState(false); 
  const [selectedImage, setSelectedImage] = useState(null); 

  const toggleModal = () => setModalOpen(!modalOpen);

  const formik = useFormik({
    enableReinitialize: true, // Quan trọng để Formik cập nhật initialValues khi props thay đổi
    initialValues: {
      full_name: initialValues.full_name || "",
      avatar: initialValues.avatar || null,
      phone_number: initialValues.phone_number || "",
      email: initialValues.email || "",
      address: initialValues.address || "",
      date_of_birth: initialValues.date_of_birth || "",
      gender: String(initialValues.gender || "male"),
      city_id: String(initialValues.city_id || ""),
      district_id: String(initialValues.district_id || ""),
      ward_id: String(initialValues.ward_id || ""),
      status_customer: String(initialValues.status_customer || "active"),
    },
    // Không cần validationSchema ở đây nữa, vì validation được xử lý từ API
    onSubmit: (values) => {
      let dataToSubmit = { ...values };

      // Xử lý logic cho avatar trước khi submit
      if (isAvatarDeleted) {
        dataToSubmit.avatar = null; // Nếu ảnh đã bị xóa, gửi null
      } else if (values.avatar instanceof File) {
        // Nếu người dùng chọn ảnh mới (là File object), giữ nguyên để gửi
      } else if (typeof values.avatar === 'string' && values.avatar !== '') {
        // Nếu là ảnh cũ (là string URL) và không bị xóa, giữ nguyên đường dẫn
      } else {
        // Trường hợp còn lại (ban đầu không có ảnh hoặc đã được reset), gửi null
        dataToSubmit.avatar = null;
      }
      onSubmit(dataToSubmit); // Gọi hàm onSubmit từ prop
    },
  });

  // Sử dụng useEffect để cập nhật avatarPreview khi initialValues thay đổi
  useEffect(() => {
    const initialAvatar = initialValues.avatar || null;
    if (initialAvatar) {
      // Kiểm tra nếu là đường dẫn tương đối, thêm base URL
      if (!initialAvatar.startsWith('http') && !initialAvatar.startsWith('/')) {
        const fullUrl = `http://localhost:8000/storage/${initialAvatar}`; // Điều chỉnh base URL nếu cần
        setAvatarPreview(fullUrl);
      } else {
        setAvatarPreview(initialAvatar);
      }
      setIsAvatarDeleted(false); // Đặt lại cờ khi initialValues thay đổi
    } else {
      setAvatarPreview(null);
      setIsAvatarDeleted(false);
    }
  }, [initialValues]); // Dependency array chứa initialValues

  // Hàm xử lý thay đổi input, tích hợp với Formik
  const handleFormikChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      formik.setFieldValue(name, file); // Cập nhật File object vào Formik
      const previewUrl = file ? URL.createObjectURL(file) : null;
      setAvatarPreview(previewUrl);
      setIsAvatarDeleted(false); // Reset cờ nếu người dùng chọn ảnh mới
    } else {
      formik.handleChange(e); // Formik tự động xử lý cập nhật giá trị
      // Logic reset district_id và ward_id khi city_id thay đổi
      if (name === "city_id" && value !== formik.values.city_id) { // So sánh với formik.values.city_id hiện tại
        formik.setFieldValue("district_id", "");
        formik.setFieldValue("ward_id", "");
      }
      // Logic reset ward_id khi district_id thay đổi
      if (name === "district_id" && value !== formik.values.district_id) { // So sánh với formik.values.district_id hiện tại
        formik.setFieldValue("ward_id", "");
      }
    }
  };

  // Hàm xóa ảnh đại diện
  const handleRemoveAvatar = () => {
    formik.setFieldValue("avatar", null); // Đặt avatar về null trong Formik
    setAvatarPreview(null); // Xóa preview ảnh
    setAvatarInputKey(Date.now()); // Reset key để xóa giá trị trong input file
    setIsAvatarDeleted(true); // Đặt cờ là true khi xóa ảnh
  };

  // Hàm xử lý click vào ảnh để phóng to
  const handleImageClick = (src) => {
    setSelectedImage(src);
    toggleModal(); // Mở modal
  };

  // Sử dụng các custom hook để tải dữ liệu hành chính
  const provinces = useProvinces();
  const districts = useDistricts(formik.values.city_id); // Dùng formik.values
  const wards = useWards(formik.values.district_id); // Dùng formik.values

  // Helper function để kiểm tra xem có lỗi từ API hay không
  const hasError = (field) => {
    return !!apiErrors[field]; // Trả về true nếu có lỗi cho trường đó trong apiErrors
  };

  // Helper function để lấy thông báo lỗi từ API
  const getErrorMessage = (field) => {
    return apiErrors[field];
  };

  return (
    <Form onSubmit={formik.handleSubmit}>
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <CardHeader className="bg-primary text-white">Thông tin khách hàng</CardHeader>
            <CardBody>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="full_name">
                      Họ và tên <Badge color="danger">*</Badge>
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formik.values.full_name}
                      onChange={handleFormikChange}
                      onBlur={formik.handleBlur} // Giữ lại onBlur để Formik biết trường này đã được chạm vào
                      maxLength={255}
                      disabled={loading}
                      invalid={hasError("full_name")} // Kích hoạt style lỗi nếu có lỗi API
                    />
                    {hasError("full_name") && (
                      <FormFeedback type="invalid">{getErrorMessage("full_name")}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="email">
                      Email <Badge color="danger">*</Badge>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formik.values.email}
                      onChange={handleFormikChange}
                      onBlur={formik.handleBlur}
                      maxLength={255}
                      disabled={loading}
                      invalid={hasError("email")}
                    />
                    {hasError("email") && (
                      <FormFeedback type="invalid">{getErrorMessage("email")}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="phone_number">
                      Số điện thoại <Badge color="danger">*</Badge>
                    </Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      value={formik.values.phone_number}
                      onChange={handleFormikChange}
                      onBlur={formik.handleBlur}
                      maxLength={20}
                      disabled={loading}
                      invalid={hasError("phone_number")}
                    />
                    {hasError("phone_number") && (
                      <FormFeedback type="invalid">{getErrorMessage("phone_number")}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="date_of_birth">Ngày sinh</Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={formik.values.date_of_birth}
                      onChange={handleFormikChange}
                      onBlur={formik.handleBlur}
                      disabled={loading}
                      invalid={hasError("date_of_birth")}
                    />
                    {hasError("date_of_birth") && (
                      <FormFeedback type="invalid">{getErrorMessage("date_of_birth")}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="gender">Giới tính</Label>
                    <Input
                      id="gender"
                      name="gender"
                      type="select"
                      value={formik.values.gender}
                      onChange={handleFormikChange}
                      onBlur={formik.handleBlur}
                      disabled={loading}
                      invalid={hasError("gender")}
                    >
                      {genderOptions.map((opt) => (
                        <option key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </option>
                      ))}
                    </Input>
                    {hasError("gender") && (
                      <FormFeedback type="invalid">{getErrorMessage("gender")}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formik.values.address}
                      onChange={handleFormikChange}
                      onBlur={formik.handleBlur}
                      maxLength={255}
                      disabled={loading}
                      invalid={hasError("address")}
                    />
                    {hasError("address") && (
                      <FormFeedback type="invalid">{getErrorMessage("address")}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="city_id">Thành phố</Label>
                    <Input
                      id="city_id"
                      name="city_id"
                      type="select"
                      value={formik.values.city_id}
                      onChange={handleFormikChange}
                      onBlur={formik.handleBlur}
                      disabled={loading}
                      invalid={hasError("city_id")}
                    >
                      <option value="">Chọn Thành phố</option>
                      {provinces.map(p => (
                        <option key={p.id} value={String(p.id)}>
                          {p.name}
                        </option>
                      ))}
                    </Input>
                    {hasError("city_id") && (
                      <FormFeedback type="invalid">{getErrorMessage("city_id")}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="district_id">Quận/Huyện</Label>
                    <Input
                      id="district_id"
                      name="district_id"
                      type="select"
                      value={formik.values.district_id}
                      onChange={handleFormikChange}
                      onBlur={formik.handleBlur}
                      disabled={loading || !formik.values.city_id} // Disable nếu chưa chọn thành phố
                      invalid={hasError("district_id")}
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map(d => (
                        <option key={d.id} value={String(d.id)}>
                          {d.name}
                        </option>
                      ))}
                    </Input>
                    {hasError("district_id") && (
                      <FormFeedback type="invalid">{getErrorMessage("district_id")}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="ward_id">Phường/Xã</Label>
                    <Input
                      id="ward_id"
                      name="ward_id"
                      type="select"
                      value={formik.values.ward_id}
                      onChange={handleFormikChange}
                      onBlur={formik.handleBlur}
                      disabled={loading || !formik.values.district_id} // Disable nếu chưa chọn quận/huyện
                      invalid={hasError("ward_id")}
                    >
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map(w => (
                        <option key={w.id} value={String(w.id)}>
                          {w.name}
                        </option>
                      ))}
                    </Input>
                    {hasError("ward_id") && (
                      <FormFeedback type="invalid">{getErrorMessage("ward_id")}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>
                <Col md={12}>
                  <FormGroup>
                    <Label for="status_customer">
                      Trạng thái <Badge color="danger">*</Badge>
                    </Label>
                    <Input
                      id="status_customer"
                      name="status_customer"
                      type="select"
                      value={formik.values.status_customer}
                      onChange={handleFormikChange}
                      onBlur={formik.handleBlur}
                      disabled={loading}
                      invalid={hasError("status_customer")}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </option>
                      ))}
                    </Input>
                    {hasError("status_customer") && (
                      <FormFeedback type="invalid">{getErrorMessage("status_customer")}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <CardHeader className="bg-primary text-white">Ảnh đại diện</CardHeader>
            <CardBody className="d-flex flex-column align-items-center justify-content-center">
              <FormGroup className="w-100">
                <Label for="avatar">Ảnh đại diện</Label>
                <Input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleFormikChange}
                  onBlur={formik.handleBlur}
                  disabled={loading}
                  key={avatarInputKey}
                  invalid={hasError("avatar")} // Kích hoạt style lỗi nếu có lỗi API
                />
                {hasError("avatar") && (
                  <FormFeedback type="invalid">{getErrorMessage("avatar")}</FormFeedback>
                )}
                {avatarPreview && (
                  <div className="avatar-preview-container">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="avatar-preview-image" // Sử dụng class CSS cho ảnh
                      onClick={() => handleImageClick(avatarPreview)} // Thêm onClick để mở modal
                    />
                    <Button
                      color="danger"
                      size="sm"
                      className="avatar-remove-button" // Sử dụng class CSS cho nút xóa
                      onClick={handleRemoveAvatar}
                    >
                      &times;
                    </Button>
                  </div>
                )}
                <FormText>Một ảnh đại diện cho khách hàng (tùy chọn)</FormText>
              </FormGroup>
            </CardBody>
          </Card>
          <Card>
            <CardHeader className="bg-primary text-white">Hành động</CardHeader>
            <CardBody className="d-flex gap-2">
              <Button color="secondary" size="lg" tag={Link} to="/customer">
                Quay lại
              </Button>
              <Button color="success" size="lg" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Đang xử lý...
                  </>
                ) : isEdit ? (
                  "Cập nhật"
                ) : (
                  "Thêm mới"
                )}
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Modal để hiển thị ảnh phóng to */}
      <Modal isOpen={modalOpen} toggle={toggleModal} centered size="lg">
        <ModalHeader toggle={toggleModal}>Xem ảnh</ModalHeader>
        <ModalBody className="text-center">
          {selectedImage && (
            <img src={selectedImage} alt="Phóng to ảnh" style={{ maxWidth: '100%', height: 'auto' }} />
          )}
        </ModalBody>
      </Modal>
    </Form>
  );
};

export default CustomerForm;