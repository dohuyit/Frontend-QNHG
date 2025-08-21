import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Button,
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
  const [combos, setCombos] = useState([]); // tất cả combos fetch từ API
  const [filteredCombos, setFilteredCombos] = useState([]); // combos sau khi filter client-side
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
    is_active: 1,
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

  // Fetch tất cả combo 1 lần
  const fetchCombos = async () => {
    setLoading(true);
    try {
      const res = await getCombos({ per_page: 1000 }); // lấy nhiều nhất có thể
      const items = res.data?.data?.items || [];
      setCombos(items);
    } catch {
      setCombos([]);
      toast.error("Lỗi khi tải danh sách combo!");
    } finally {
      setLoading(false);
    }
  };

  // Filter client-side mỗi khi search, status hoặc combos thay đổi
  useEffect(() => {
    let data = [...combos];

    if (search.trim()) {
      data = data.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== "all") {
      data = data.filter((c) => Number(c.is_active) === Number(status));
    }

    setFilteredCombos(data);

    setMeta((prev) => ({
      ...prev,
      total: data.length,
      totalPage: Math.max(1, Math.ceil(data.length / prev.perPage)),
      page: 1,
    }));
  }, [search, status, combos]);


  useEffect(() => {
    if (activeTab === "list") fetchCombos();
  }, [activeTab]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= meta.totalPage) {
      setMeta((prev) => ({ ...prev, page: pageNumber }));
    }
  };

  const resetNewCombo = () => {
    setNewCombo({
      name: "",
      selling_price: "",
      is_active: 1,
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
        is_active: combo.is_active === 1 ? 1 : 0,
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
      fetchCombos();
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
      if (tab === "list") fetchCombos();
    }
  };

  const handleAddDish = (comboId) => {
    setCurrentComboId(comboId);
    setShowAddDishModal(true);
  };

  // Chia trang client-side
  const startIndex = (meta.page - 1) * meta.perPage;
  const endIndex = startIndex + meta.perPage;
  const paginatedCombos = filteredCombos.slice(startIndex, endIndex);

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
                onSearchChange={(val) => setSearch(val)}
                statusValue={status}
                onStatusChange={(val) => setStatus(val)}
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
                    data={paginatedCombos}
                    onDetail={async (comboId) => {
                      try {
                        const res = await getComboDetail(comboId);
                        const combo = res.data.data.combo || {};
                        const items = res.data.data.items || [];
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
                      if (currentComboId) fetchCombos();
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
        {/* Nội dung modal chi tiết giữ nguyên như cũ */}
      </Modal>
    </div>
  );
};
export default ComboIndex;
