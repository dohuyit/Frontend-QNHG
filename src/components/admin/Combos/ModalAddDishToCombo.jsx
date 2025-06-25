import React, { useEffect, useState } from "react";
import { Modal, Button } from "reactstrap";
import { addItemToCombo } from "@services/admin/comboService";
import { toast } from "react-toastify";
import { getDishes } from "@services/admin/dishService";

const ModalAddDishToCombo = ({ isOpen, onClose, comboId, onSuccess, mode = "edit" }) => {
    const [dishList, setDishList] = useState([]);
    const [selectedDishes, setSelectedDishes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Lấy danh sách món ăn (API mẫu, bạn thay bằng API thực tế của bạn)
    useEffect(() => {
        if (isOpen) {
            console.log("comboId:", comboId);
            setSelectedDishes([]);
            fetchDishes();
        }
    }, [isOpen]);

    const fetchDishes = async () => {
        setLoading(true);
        try {
            const res = await getDishes();
            setDishList(res.data.data.items || []);
        } catch  {
            toast.error("Không lấy được danh sách món ăn!");
        } finally {
            setLoading(false);
        }
    };

  
    const handleIncreaseDish = (dish) => {
        setSelectedDishes(prev => {
            const found = prev.find(d => d.id === dish.id);
            if (found) {
                return prev.map(d => d.id === dish.id ? { ...d, quantity: d.quantity + 1 } : d);
            }
            return [...prev, { ...dish, quantity: 1 }];
        });
    };

    const handleDecreaseDish = (dishId) => {
        setSelectedDishes(prev => {
            const found = prev.find(d => d.id === dishId);
            if (!found) return prev;
            if (found.quantity === 1) {
                return prev.filter(d => d.id !== dishId);
            }
            return prev.map(d => d.id === dishId ? { ...d, quantity: d.quantity - 1 } : d);
        });
    };

    const handleSubmit = async () => {
        if (selectedDishes.length === 0) {
            toast.warning("Vui lòng chọn ít nhất 1 món ăn!");
            return;
        }
        if (mode === "create") {
            onSuccess && onSuccess(selectedDishes);
            onClose();
            return;
        }
        if (!comboId) {
            toast.error("Không xác định được combo!");
            return;
        }
        try {
            await Promise.all(selectedDishes.map(dish =>
                addItemToCombo(comboId, {
                    dish_id: dish.id,
                    quantity: dish.quantity,
                })
            ));
            toast.success("Thêm món ăn vào combo thành công!");
            onClose();
            if (onSuccess) onSuccess();
        } catch  {
            toast.error("Lỗi khi thêm món ăn vào combo!");
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={onClose} size="lg" centered>
            <div className="modal-header">
                <h4 className="modal-title">Thêm món ăn vào combo</h4>
                <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body" style={{ maxHeight: 500, overflowY: "auto" }}>
                <div className="mb-2 text-muted">
                    Chọn các món ăn để thêm vào combo <b>{comboId}</b>
                </div>
                {loading ? (
                    <div>Đang tải...</div>
                ) : (
                    <div>
                        {dishList.map((dish) => {
                            const selected = selectedDishes.find(d => d.id === dish.id);
                            return (
                                <div
                                    key={dish.id}
                                    className="d-flex align-items-center justify-content-between p-2 mb-2"
                                    style={{
                                        background: "#fafbfc",
                                        borderRadius: 8,
                                        border: "1px solid #f0f0f0",
                                    }}
                                >
                                    <div className="d-flex align-items-center">
                                        <div
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: "50%",
                                                background: "#eee",
                                                marginRight: 16,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 20,
                                                color: "#bbb",
                                            }}
                                        >
                                            <i className="mdi mdi-image"></i>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{dish.name}</div>
                                            <div style={{ color: "#888", fontSize: 15 }}>
                                                {dish.selling_price?.toLocaleString()} đ &nbsp;•&nbsp; {dish.category?.name || 'Chưa phân loại'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-success" style={{ fontSize: 15, marginRight: 8 }}>
                                            Có sẵn
                                        </span>
                                        {selected ? (
                                            <>
                                                <Button
                                                    color="dark"
                                                    size="sm"
                                                    onClick={() => handleDecreaseDish(dish.id)}
                                                    style={{ minWidth: 36, fontWeight: 700 }}
                                                >
                                                    -
                                                </Button>
                                                <span style={{ minWidth: 24, textAlign: "center" }}>{selected.quantity}</span>
                                                <Button
                                                    color="dark"
                                                    size="sm"
                                                    onClick={() => handleIncreaseDish(dish)}
                                                    style={{ minWidth: 36, fontWeight: 700 }}
                                                >
                                                    +
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                color="dark"
                                                size="sm"
                                                onClick={() => handleIncreaseDish(dish)}
                                                style={{ minWidth: 36, fontWeight: 700 }}
                                            >
                                                +
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className="modal-footer">
                <Button color="secondary" onClick={onClose}>
                    Hủy
                </Button>
                <Button color="warning" onClick={handleSubmit}>
                    Hoàn thành
                </Button>
            </div>
        </Modal>
    );
};

export default ModalAddDishToCombo;
