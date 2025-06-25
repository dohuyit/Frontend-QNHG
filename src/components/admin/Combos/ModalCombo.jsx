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
import { getDishes } from "@services/admin/dishService";
import ModalAddDishToCombo from "@components/admin/Combos/ModalAddDishToCombo";
import { createCombo } from "@services/admin/comboService";

const ModalCombo = ({
  modalOpen,
  setModalOpen,
  combo,
  setCombo,
  isEdit = false,
  onSave,
}) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [ setDishList] = useState([]);
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [errors, setErrors] = useState({});

  // Tính tổng giá gốc các món đã chọn
  useEffect(() => {
    if (combo.items && combo.items.length > 0) {
      const total = combo.items.reduce((sum, item) => sum + (item.selling_price || 0) * (item.quantity || 1), 0);
      setCombo({ ...combo, original_total_price: total });
    } else {
      setCombo({ ...combo, original_total_price: 0 });
    }
    // eslint-disable-next-line
  }, [combo.items]);

  useEffect(() => {
    if (modalOpen) {
      const fullImageUrl = "http://localhost:8000/storage/";
      if (isEdit && combo.image_url && typeof combo.image_url === "string") {
        setPreviewImage(`${fullImageUrl}${combo.image_url}`);
      } else {
        setPreviewImage(null);
      }
      fetchDishList();
    }
    // eslint-disable-next-line
  }, [modalOpen, combo.image_url, isEdit]);

  const fetchDishList = async () => {
    try {
      const res = await getDishes();
      setDishList(res.data.data.items || []);
    } catch {
      toast.error("Không lấy được danh sách món ăn!");
    }
  };

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
      setCombo({ ...combo, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Hàm lưu combo (tạo mới)
  const handleSave = async () => {
    setErrors({});
    const formData = new FormData();
    formData.append("name", combo.name || "");
    formData.append("description", combo.description || "");
    formData.append("original_total_price", combo.original_total_price || 0);
    formData.append("selling_price", combo.selling_price || 0);
    formData.append("is_active", combo.is_active ?? 1);
    if (combo.image instanceof File) {
      formData.append("image_url", combo.image);
    }
    // Thêm danh sách món ăn vào combo (nếu có)
    if (combo.items && combo.items.length > 0) {
      combo.items.forEach((item, idx) => {
        formData.append(`items[${idx}][dish_id]`, item.id);
        formData.append(`items[${idx}][quantity]`, item.quantity);
      });
    }

    // Debug: In ra dữ liệu gửi lên
    for (let pair of formData.entries()) {
      console.log(pair[0]+ ', ' + pair[1]);
    }

    try {
      await createCombo(formData);
      toast.success("Thêm combo thành công!");
      setModalOpen(false);
      if (typeof onSave === "function") onSave();
    } catch (error) {
      console.log(error.response?.data);
      toast.error(error.response?.data?.message || "Lỗi khi lưu combo!");
    }
  };

  return (
    <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="xl" centered>
      <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
        {isEdit ? "Chỉnh sửa combo" : "Thêm mới combo"}
      </ModalHeader>
      <ModalBody>
        <Form>
          <Row>
            {/* Cột trái: Thông tin combo */}
            <Col md={7}>
              {/* Ảnh */}
              <FormGroup className="text-center mb-4">
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
              {/* Tên combo */}
              <FormGroup>
                <Label for="name">
                  Tên combo <span className="text-danger">*</span>
                </Label>
                <Input
                  id="name"
                  value={combo.name || ""}
                  onChange={(e) => setCombo({ ...combo, name: e.target.value })}
                  placeholder="Nhập tên combo"
                  invalid={!!errors.name}
                />
                {errors.name && <FormFeedback>{errors.name}</FormFeedback>}
              </FormGroup>
              {/* Giá bán combo */}
              <FormGroup>
                <Label for="selling_price">
                  Giá bán combo <span className="text-danger">*</span>
                </Label>
                <Input
                  id="selling_price"
                  type="number"
                  min={0}
                  value={
                    isEdit
                      ? combo.selling_price !== undefined
                        ? combo.selling_price
                        : ""
                      : combo.selling_price || ""
                  }
                  onChange={(e) => setCombo({ ...combo, selling_price: e.target.value })}
                  placeholder="Nhập giá bán combo"
                />
                {errors.selling_price && <FormFeedback>{errors.selling_price}</FormFeedback>}
              </FormGroup>
              {/* Mô tả */}
              <FormGroup>
                <Label for="description">Mô tả</Label>
                <Input
                  id="description"
                  type="textarea"
                  value={combo.description || ""}
                  onChange={(e) => setCombo({ ...combo, description: e.target.value })}
                  invalid={!!errors.description}
                />
                {errors.description && <FormFeedback>{errors.description}</FormFeedback>}
              </FormGroup>
              {/* Trạng thái */}
              <FormGroup>
                <Label for="is_active">Trạng thái</Label>
                <Input
                  id="is_active"
                  type="select"
                  value={combo.is_active === 0 ? 0 : 1}
                  onChange={(e) => setCombo({ ...combo, is_active: Number(e.target.value) })}
                >
                  <option value={1}>Đang bán</option>
                  <option value={0}>Ngưng bán</option>
                </Input>
              </FormGroup>
            </Col>
            {/* Cột phải: Danh sách món ăn và tổng giá */}
            <Col md={5}>
              {/* Tổng giá gốc các món */}
              <div style={{ marginBottom: 16, background: "#fffbe6", borderRadius: 8, padding: 12, fontWeight: 600, fontSize: 18, color: "#ff6600", textAlign: "center", border: "1px solid #ffe58f" }}>
                Tổng giá gốc: {combo.original_total_price?.toLocaleString()} đ
              </div>
              <div style={{ maxHeight: 420, overflowY: "auto", border: "1px solid #eee", borderRadius: 8, padding: 12, background: "#fafbfc" }}>
                <div className="fw-bold mb-2">Danh sách món ăn</div>
                {(combo.items && combo.items.length > 0) ? (
                  <>
                    {combo.items.map((item) => (
                      <div
                        key={item.id}
                        className="d-flex align-items-center justify-content-between mb-2"
                        style={{
                          background: "#fff",
                          borderRadius: 10,
                          border: "1px solid #eee",
                          padding: "10px 16px"
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: "50%",
                              background: "#f3f3f3",
                              marginRight: 14,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden"
                            }}
                          >
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <i className="mdi mdi-food" style={{ fontSize: 22, color: "#bbb" }}></i>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.name || item.dish_name}</div>
                            <div style={{ color: "#888", fontSize: 15 }}>
                              {item.selling_price?.toLocaleString()} đ{" "}
                              {item.category?.name && (
                                <span
                                  style={{
                                    background: "#f3f3f3",
                                    borderRadius: 8,
                                    padding: "2px 10px",
                                    fontSize: 13,
                                    marginLeft: 8,
                                    color: "#333"
                                  }}
                                >
                                  {item.category.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <Button
                            color="light"
                            size="sm"
                            style={{ borderRadius: 8, minWidth: 32, minHeight: 32, fontWeight: 700, fontSize: 18, border: "1px solid #ddd" }}
                            disabled={item.quantity <= 1}
                            onClick={() => {
                              let newItems = combo.items ? [...combo.items] : [];
                              const itemIndex = newItems.findIndex(i => i.id === item.id);
                              if (itemIndex > -1) {
                                if (newItems[itemIndex].quantity > 1) {
                                  newItems[itemIndex].quantity -= 1;
                                } else {
                                  newItems.splice(itemIndex, 1);
                                }
                                setCombo({ ...combo, items: newItems });
                              }
                            }}
                          >
                            -
                          </Button>
                          <span style={{ minWidth: 24, textAlign: "center", fontWeight: 600 }}>{item.quantity}</span>
                          <Button
                            color="warning"
                            size="sm"
                            style={{ borderRadius: 8, minWidth: 32, minHeight: 32, fontWeight: 700, fontSize: 18, background: "#ff6600", border: "none" }}
                            onClick={() => {
                              let newItems = combo.items ? [...combo.items] : [];
                              const itemIndex = newItems.findIndex(i => i.id === item.id);
                              if (itemIndex > -1) {
                                newItems[itemIndex].quantity += 1;
                                setCombo({ ...combo, items: newItems });
                              }
                            }}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                    {/* Nút cộng lớn luôn hiển thị ở cuối danh sách */}
                    <div className="d-flex flex-column align-items-center justify-content-center" style={{marginTop: 16}}>
                      <Button
                        color="light"
                        style={{
                          borderRadius: "50%",
                          width: 56,
                          height: 56,
                          fontSize: 32,
                          color: "#bbb",
                          border: "2px dashed #bbb",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          transition: "box-shadow 0.2s, background 0.2s"
                        }}
                        onClick={() => setShowAddDishModal(true)}
                        onMouseOver={e => {
                          e.currentTarget.style.background = "#f5f5f5";
                          e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.16)";
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = "#fff";
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                        }}
                      >
                        +
                      </Button>
                      <div style={{marginTop: 6, color: "#888", fontSize: 14, fontWeight: 500}}>Thêm món</div>
                    </div>
                  </>
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center" style={{height: 220}}>
                    <Button
                      color="light"
                      style={{
                        borderRadius: "50%",
                        width: 80,
                        height: 80,
                        fontSize: 40,
                        color: "#bbb",
                        border: "2px dashed #bbb",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        transition: "box-shadow 0.2s, background 0.2s"
                      }}
                      onClick={() => setShowAddDishModal(true)}
                      onMouseOver={e => {
                        e.currentTarget.style.background = "#f5f5f5";
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.16)";
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                      }}
                    >
                      +
                    </Button>
                    <div style={{marginTop: 12, color: "#888", fontSize: 16, fontWeight: 500}}>Thêm mặt hàng vào combo</div>
                  </div>
                )}
                {errors.items && <div className="text-danger small mt-1">{errors.items}</div>}
              </div>
            </Col>
          </Row>
        </Form>
        <ModalAddDishToCombo
          isOpen={showAddDishModal}
          onClose={() => setShowAddDishModal(false)}
          mode="create"
          onSuccess={(selectedDishes) => {
            const oldItems = combo.items || [];
            const merged = [...oldItems];
            selectedDishes.forEach(newItem => {
              const idx = merged.findIndex(i => i.id === newItem.id);
              if (idx > -1) {
                merged[idx].quantity += newItem.quantity;
              } else {
                merged.push(newItem);
              }
            });
            setCombo({ ...combo, items: merged });
            toast.success("Đã thêm món ăn vào combo!");
          }}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={() => setModalOpen(false)}>
          Hủy
        </Button>
        <Button color="primary" onClick={handleSave}>
          {isEdit ? "Lưu thay đổi" : "Thêm mới"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalCombo;