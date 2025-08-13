import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Spinner,
  Input,
  Button,
  Badge,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Modal,
} from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import ListTrashCombo from "@components/admin/Combos/ListTrashCombo";
import ModalCombo from "@components/admin/Combos/ModalCombo";
import { toast } from "react-toastify";
import {
  getCombos,
  softDeleteCombo,
  getComboDetail,
} from "@services/admin/comboService";
import { getDishes } from "@services/admin/dishService";
import Swal from "sweetalert2";
import ComboCardGrid from "@components/admin/Combos/ComboCardGrid";
import ModalAddDishToCombo from "@components/admin/Combos/ModalAddDishToCombo";
import "react-toastify/dist/ReactToastify.css";
import SearchAndStatusFilterBar from "@components/admin/ui/SearchAndStatusFilterBar";

const statusOptions = [
  { value: "all", label: "Tất cả", badgeColor: "secondary" },
  { value: 1, label: "Đang bán", badgeColor: "success" },
  { value: 0, label: "Ngưng áp dụng", badgeColor: "danger" },
];

const ComboIndex = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [meta, setMeta] = useState({
    page: 1,
    perPage: 8,
    total: 0,
    totalPage: 1,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [newCombo, setNewCombo] = useState({
    name: "",
    selling_price: "",
    status: "active",
    description: "",
    items: [],
    image_url: "",
  });
  const [errors, setErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [, setEditComboId] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [refreshTrashKey, setRefreshTrashKey] = useState(0);
  const [dishList] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [currentComboId, setCurrentComboId] = useState(null);

  const fetchCombos = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 8,
        search: search || undefined,
        ...(status !== "all" && { is_active: status }),
      };
      const res = await getCombos(params);
      const items = res.data?.data?.items;
      if (Array.isArray(items)) {
        setCombos(items);
        setMeta({
          page: res.data.data.meta.page || 1,
          perPage: 8,
          total: res.data.data.meta.total || 0,
          totalPage: res.data.data.meta.totalPage || 1,
        });
      } else {
        setCombos([]);
        setMeta({ page: 1, perPage: 8, total: 0, totalPage: 1 });
      }
    } catch {
      setCombos([]);
      setMeta({ page: 1, perPage: 8, total: 0, totalPage: 1 });
      toast.error("Lỗi khi tải danh sách combo!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "list") fetchCombos(meta.page);
  }, [meta.page, search, status, activeTab]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= meta.totalPage) {
      setMeta((prev) => ({ ...prev, page: pageNumber }));
    }
  };

  const resetNewCombo = () => {
    setNewCombo({
      name: "",
      selling_price: "",
      status: "active",
      description: "",
      items: [],
      image_url: "",
    });
    setErrors({});
    setIsEdit(false);
    setEditComboId(null);
  };

  const handleEditCombo = async (comboId) => {
    try {
      const res = await getComboDetail(comboId);
      const combo = res.data.data.combo;
      const items = res.data.data.items || [];
      const dishRes = await getDishes();
      const dishList = dishRes.data.data.items || [];
      const mappedItems = items.map((item) => {
        const dish = dishList.find(
          (d) => Number(d.id) === Number(item.dish_id)
        );
        return {
          ...item,
          id: Number(item.dish_id),
          dish_id: Number(item.dish_id),
          dish_name: item.dish_name || (dish ? dish.name : ""),
          selling_price: dish ? dish.selling_price : 0,
          category: dish ? dish.category : null,
          image_url: dish ? dish.image_url : "",
          quantity: item.quantity || 1,
        };
      });
      setNewCombo({
        id: combo.id,
        name: combo.name || "",
        selling_price: combo.selling_price || "",
        status: combo.is_active === 1 ? "active" : "inactive",
        description: combo.description || "",
        items: mappedItems,
        image_url: combo.image_url || "",
      });
      setEditComboId(combo.id);
      setIsEdit(true);
      setModalOpen(true);
    } catch {
      toast.error("Không lấy được thông tin combo!");
    }
  };

  const handleDeleteClick = (comboId) => {
    Swal.fire({
      title: "Xóa combo?",
      text: "Bạn có chắc chắn muốn xóa combo này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) handleDeleteCombo(comboId);
    });
  };

  const handleDeleteCombo = async (comboId) => {
    try {
      await softDeleteCombo(comboId);
      toast.success("Xóa combo thành công!");
      fetchCombos(meta.page);
    } catch {
      toast.error("Lỗi khi xóa combo!");
    }
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setSearch("");
      setStatus("all");
      setMeta((prev) => ({ ...prev, page: 1 }));
      if (tab === "list") fetchCombos(1);
    }
  };

  const handleAddDish = (comboId) => {
    setCurrentComboId(comboId);
    setShowAddDishModal(true);
  };

  return (
    <div className="page-content">
      <Breadcrumbs
        title="Quản Lý Combo"
        breadcrumbItem={activeTab === "list" ? "Danh sách combo" : "Thùng rác"}
      />

      <Card className="mb-4">
        <CardHeader className="bg-white border-bottom-0">
          <Nav tabs>
            <NavItem>
              <NavLink
                className={activeTab === "list" ? "active" : ""}
                onClick={() => toggleTab("list")}
              >
                Danh sách combo
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === "trash" ? "active" : ""}
                onClick={() => toggleTab("trash")}
              >
                Thùng rác
              </NavLink>
            </NavItem>
          </Nav>
        </CardHeader>
      </Card>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="list">
          <Card className="mb-4">
            <CardBody>
              <SearchAndStatusFilterBar
                searchValue={search}
                onSearchChange={(val) => {
                  setSearch(val);
                  setMeta((prev) => ({ ...prev, page: 1 }));
                  fetchCombos(1);
                }}
                statusValue={status}
                onStatusChange={(val) => {
                  setStatus(val);
                  setMeta((prev) => ({ ...prev, page: 1 }));
                  fetchCombos(1);
                }}
                statusOptions={statusOptions}
                searchPlaceholder="Tìm kiếm combo..."
                statusPlaceholder="Tất cả trạng thái"
                rightContent={
                  <Button
                    color="success"
                    onClick={() => {
                      resetNewCombo();
                      setModalOpen(true);
                    }}
                  >
                    <i className="mdi mdi-plus" /> Thêm combo mới
                  </Button>
                }
              />
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              {loading ? (
                <div className="text-center my-5">
                  <Spinner color="primary" />
                </div>
              ) : (
                <>
                  <ComboCardGrid
                    data={combos}
                    onDetail={async (comboId) => {
                      try {
                        const res = await getComboDetail(comboId);
                        const combo = res.data.data.combo || {};
                        const items = res.data.data.items || [];
                        // Map lại items cho chắc chắn có dish_name, quantity
                        const mappedItems = items.map((item) => ({
                          ...item,
                          dish_name: item.dish_name || item.name || "",
                          quantity: item.quantity || 1,
                        }));
                        setSelectedCombo({ ...combo, items: mappedItems });
                        setShowDetailModal(true);
                      } catch {
                        toast.error("Không lấy được chi tiết combo!");
                      }
                    }}
                    onEdit={handleEditCombo}
                    onDelete={handleDeleteClick}
                    onAddDish={handleAddDish}
                  />
                  <ModalAddDishToCombo
                    isOpen={showAddDishModal}
                    onClose={() => setShowAddDishModal(false)}
                    comboId={currentComboId}
                    onSuccess={async () => {
                      setShowAddDishModal(false);
                      // Reload lại chi tiết combo nếu đang mở modal chi tiết
                      if (
                        currentComboId &&
                        showDetailModal &&
                        selectedCombo &&
                        selectedCombo.id === currentComboId
                      ) {
                        try {
                          const res = await getComboDetail(currentComboId);
                          const combo = res.data.data.combo || {};
                          const items = res.data.data.items || [];
                          const mappedItems = items.map((item) => ({
                            ...item,
                            dish_name: item.dish_name || item.name || "",
                            quantity: item.quantity || 1,
                          }));
                          setSelectedCombo({ ...combo, items: mappedItems });
                        } catch {
                          toast.error("Không cập nhật được chi tiết combo!");
                        }
                      }
                      if (currentComboId) fetchCombos(meta.page);
                    }}
                  />
                  {meta.totalPage > 1 && (
                    <div className="d-flex justify-content-end mt-4">
                      <nav>
                        <ul className="pagination">
                          <li
                            className={`page-item${
                              meta.page === 1 ? " disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(meta.page - 1)}
                            >
                              «
                            </button>
                          </li>
                          {Array.from({ length: meta.totalPage }, (_, i) => (
                            <li
                              key={i + 1}
                              className={`page-item${
                                meta.page === i + 1 ? " active" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(i + 1)}
                              >
                                {i + 1}
                              </button>
                            </li>
                          ))}
                          <li
                            className={`page-item${
                              meta.page === meta.totalPage ? " disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(meta.page + 1)}
                            >
                              »
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        </TabPane>
        <TabPane tabId="trash">
          <ListTrashCombo refreshKey={refreshTrashKey} />
        </TabPane>

      </TabContent>

      <ModalCombo
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        combo={newCombo}
        setCombo={setNewCombo}
        dishList={dishList}
        onSave={fetchCombos}
        isEdit={isEdit}
        errors={errors}
      />

      {/* Modal chi tiết combo */}
      <Modal
        isOpen={showDetailModal}
        toggle={() => setShowDetailModal(false)}
        size="xl"
        centered
      >
        <div className="modal-header">
          <h4 className="modal-title">Chi tiết combo</h4>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowDetailModal(false)}
          ></button>
        </div>
        <div className="modal-body">
          {selectedCombo ? (
            <div>
              {/* Thông tin combo */}
              <div className="row mb-4">
                <div className="col-md-5 d-flex align-items-center justify-content-center">
                  {selectedCombo.image_url ? (
                    <img
                      src={(() => {
                        if (selectedCombo.image_url.startsWith("http"))
                          return selectedCombo.image_url;
                        let imgPath = selectedCombo.image_url;
                        // Nếu đã có /storage/combo ở đầu thì giữ nguyên, nếu chưa thì thêm vào
                        if (!imgPath.startsWith("/storage")) {
                          imgPath = "/storage/" + imgPath.replace(/^\/+/, "");
                        }
                        return `http://localhost:8000${imgPath}`;
                      })()}
                      alt={selectedCombo.name}
                      style={{
                        width: "100%",
                        maxWidth: 320,
                        borderRadius: 12,
                        background: "#f5f5f5",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 280,
                        height: 200,
                        background: "#f5f5f5",
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i
                        className="mdi mdi-image"
                        style={{ fontSize: 48, color: "#ccc" }}
                      ></i>
                    </div>
                  )}
                </div>
                <div className="col-md-7">
                  <h4>
                    <b>{selectedCombo.name}</b>
                  </h4>
                  <div className="mb-2">{selectedCombo.description}</div>
                  <div className="row mb-2">
                    <div className="col-6">
                      <div
                        style={{
                          background: "#f8f9fa",
                          borderRadius: 8,
                          padding: 12,
                        }}
                      >
                        <div style={{ color: "#888" }}>Giá gốc</div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 18,
                            textDecoration: "line-through",
                          }}
                        >
                          {selectedCombo.original_total_price?.toLocaleString()}{" "}
                          đ
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div
                        style={{
                          background: "#e6f9ed",
                          borderRadius: 8,
                          padding: 12,
                        }}
                      >
                        <div style={{ color: "#28a745" }}>Giá bán</div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 18,
                            color: "#28a745",
                          }}
                        >
                          {selectedCombo.selling_price?.toLocaleString()} đ
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="mb-2"
                    style={{
                      background: "#fff6ed",
                      borderRadius: 8,
                      padding: 12,
                    }}
                  >
                    <span
                      style={{
                        color: "#ff6600",
                        fontWeight: 600,
                        fontSize: 18,
                      }}
                    >
                      Mức giảm giá {selectedCombo.discount_percent || 0}%
                    </span>
                  </div>
                  <div className="row mt-2">
                    <div className="col-6">
                      <div
                        style={{
                          background: "#eafaf3",
                          borderRadius: 8,
                          padding: 12,
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            color: "#28a745",
                            fontWeight: 600,
                            fontSize: 24,
                          }}
                        >
                          {selectedCombo.orders || 0}
                        </div>
                        <div>Đơn hàng</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div
                        style={{
                          background: "#f8f9fa",
                          borderRadius: 8,
                          padding: 12,
                          textAlign: "center",
                        }}
                      >
                        <div style={{ color: "#888", fontSize: 14 }}>
                          Trạng thái
                        </div>
                        {selectedCombo.is_active === 1 ? (
                          <div className="d-flex align-items-center justify-content-center mt-1">
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "#28a745",
                                marginRight: 6,
                              }}
                            ></div>
                            <span style={{ fontWeight: 600, color: "#28a745" }}>
                              Đang hoạt động
                            </span>
                          </div>
                        ) : (
                          <div className="d-flex align-items-center justify-content-center mt-1">
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "#6c757d",
                                marginRight: 6,
                              }}
                            ></div>
                            <span style={{ fontWeight: 600, color: "#6c757d" }}>
                              Ngừng áp dụng
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Món ăn trong combo */}
              <div className="d-flex justify-content-between align-items-center mb-2 mt-4">
                <h5 className="mb-0">Món ăn trong combo</h5>
                <Button
                  color="warning"
                  onClick={() => {
                    if (selectedCombo && selectedCombo.id) {
                      setCurrentComboId(selectedCombo.id);
                      setShowAddDishModal(true);
                    } else {
                      toast.error("Chưa có thông tin combo!");
                    }
                  }}
                >
                  <i className="mdi mdi-plus"></i> Thêm món
                </Button>
              </div>
              <div
                style={{
                  minHeight: 120,
                  background: "#fafbfc",
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                {selectedCombo.items && selectedCombo.items.length > 0 ? (
                  <ul
                    className="mb-0"
                    style={{ listStyle: "none", padding: 0 }}
                  >
                    {selectedCombo.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="d-flex align-items-center justify-content-between mb-2 p-2"
                        style={{
                          fontSize: 14,
                          background: "#fff",
                          borderRadius: 6,
                          border: "1px solid #e9ecef",
                        }}
                      >
                        <div>{item.dish_name}</div>
                        <div>
                          Số lượng: <b>{item.quantity}</b>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-muted">
                    Chưa có món ăn nào trong combo này
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>Đang tải...</div>
          )}
        </div>
      </Modal>
    </div>
  );
};
export default ComboIndex;
