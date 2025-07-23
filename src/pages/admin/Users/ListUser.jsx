import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  Button,
  Badge,
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import CreateUser from "./CreateUser";
import { Modal } from "reactstrap";

import {
  getUsers,
  deleteUser,
  blockUser,
  unblockUser,
  countUsersByStatus,
} from "@services/admin/userService";
import SearchAndStatusFilterBar from "@components/admin/ui/SearchAndStatusFilterBar";
import "@pages/admin/KitchenOrders/KitchenOrdersKanban.css";
import StatusFilterGroup from "@components/admin/ui/StatusFilterGroup";

const userStatusOptions = [
  { label: "Tất cả", value: "all", badgeColor: "secondary" },
  { label: "Đang hoạt động", value: "active", badgeColor: "success" },
  { label: "Dừng hoạt động", value: "inactive", badgeColor: "secondary" },
  { label: "Đã khóa", value: "blocked", badgeColor: "danger" },
];

export default function ListUser() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [showFilter, setShowFilter] = useState(false);
  const [filterUsername, setFilterUsername] = useState("");
  const [filterEmail, setFilterEmail] = useState("");

  const [userStatusCounts, setUserStatusCounts] = useState({
    active: 0,
    inactive: 0,
    blocked: 0,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteError, setShowDeleteError] = useState(false);

  useEffect(() => {
    fetchUsers(currentPage);
    fetchUserStatusCounts();
  }, [keyword, filterStatus, currentPage]);

  const fetchUsers = (page = 1) => {
    const params = { page, keyword };

    if (filterStatus !== "all") params.status = filterStatus;
    if (filterUsername) params.username = filterUsername;
    if (filterEmail) params.email = filterEmail;

    getUsers(params)
      .then((res) => {
        const result = res.data.data;
        const pagination = result.meta || {};

        setMeta({
          current_page: pagination.page,
          last_page: pagination.totalPage,
          per_page: pagination.perPage,
          total: pagination.total,
        });

        setUsers(result.items || []);
        setCurrentPage(pagination.page || 1);
      })
      .finally(() => {});
  };

  const fetchUserStatusCounts = () => {
    countUsersByStatus()
      .then((res) => setUserStatusCounts(res.data.data || {}))
      .catch(console.error);
  };

  const handleDeleteConfirm = (id) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
  };

  const handleBlock = (id) => {
    blockUser(id).then(() => {
      fetchUsers(currentPage);
      fetchUserStatusCounts();
    });
  };

  const handleUnblock = (id) => {
    unblockUser(id).then(() => {
      fetchUsers(currentPage);
      fetchUserStatusCounts();
    });
  };

  const renderPagination = () => {
    if (!meta || meta.last_page <= 1) return null;

    const pages = [];
    const current = meta.current_page;
    const last = meta.last_page;

    let start = Math.max(current - 1, 1);
    let end = Math.min(current + 1, last);

    if (current === 1) {
      end = Math.min(3, last);
    } else if (current === last) {
      start = Math.max(last - 2, 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <nav className="d-flex justify-content-center mt-3">
        <ul className="pagination mb-0">
          <li className={`page-item ${current === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage(current - 1)}
            >
              &laquo;
            </button>
          </li>
          {pages.map((page) => (
            <li
              key={page}
              className={`page-item ${page === current ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            </li>
          ))}
          <li className={`page-item ${current === last ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage(current + 1)}
            >
              &raquo;
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="page-content">
      <Breadcrumbs
        title="Danh sách nhân viên"
        breadcrumbItem="Quản lý người dùng"
      />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button
          color="primary"
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
        >
          + Thêm mới
        </Button>
      </div>

      <Card className="mb-4">
        <CardHeader className="bg-white border-bottom-0">
          <StatusFilterGroup
            options={userStatusOptions.map((opt) => ({
              ...opt,
              badgeCount:
                opt.value === "all"
                  ? Object.values(userStatusCounts).reduce((a, b) => a + b, 0)
                  : userStatusCounts[opt.value] || 0,
            }))}
            value={filterStatus}
            onChange={(val) => {
              setFilterStatus(val);
              setCurrentPage(1);
            }}
            className="mb-3"
          />
          <SearchAndStatusFilterBar
            searchValue={keyword}
            onSearchChange={setKeyword}
            statusValue={filterStatus}
            onStatusChange={(val) => {
              setFilterStatus(val);
              setCurrentPage(1);
            }}
            statusOptions={userStatusOptions}
            searchPlaceholder="Tìm kiếm theo tên, SĐT, email..."
            statusPlaceholder="Tất cả trạng thái"
            rightContent={
              <Button
                color="light"
                className="border"
                onClick={() => setShowFilter(true)}
                style={{ minWidth: 140 }}
              >
                <i className="mdi mdi-filter-variant me-1"></i> Lọc nâng cao
              </Button>
            }
          />
        </CardHeader>
      </Card>

      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ảnh</th>
              <th>Tài khoản</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    {user.avatar ? (
                      <img
                        src={`http://localhost:8000/storage/${user.avatar}`}
                        alt="avatar"
                        style={{ width: 40, height: 40, borderRadius: "50%" }}
                      />
                    ) : (
                      <span className="text-muted">Không có</span>
                    )}
                  </td>
                  <td>{user.username}</td>
                  <td>{user.full_name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone_number}</td>
                  <td>
                    {user.status === "blocked" ? (
                      <Badge color="danger">Đã khóa</Badge>
                    ) : user.status === "inactive" ? (
                      <Badge color="secondary">Dừng</Badge>
                    ) : (
                      <Badge color="success">Hoạt động</Badge>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        color="light"
                        onClick={() => {
                          setEditingUser(user);
                          setShowModal(true);
                        }}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </Button>
                      <Button
                        size="sm"
                        color="light"
                        onClick={() => handleDeleteConfirm(user.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                      {user.status === "blocked" ? (
                        <Button
                          size="sm"
                          color="success"
                          onClick={() => handleUnblock(user.id)}
                        >
                          <i className="bi bi-unlock"></i>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          color="light"
                          onClick={() => handleBlock(user.id)}
                        >
                          <i className="bi bi-lock"></i>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Phân trang */}
        {renderPagination()}
      </div>

      {/* Bộ lọc nâng cao */}
      <Offcanvas
        direction="end"
        isOpen={showFilter}
        toggle={() => setShowFilter(false)}
      >
        <OffcanvasHeader toggle={() => setShowFilter(false)}>
          Bộ lọc nâng cao
        </OffcanvasHeader>
        <OffcanvasBody>
          <Form>
            <FormGroup>
              <Label for="filterUsername">Tên đăng nhập</Label>
              <Input
                id="filterUsername"
                value={filterUsername}
                onChange={(e) => setFilterUsername(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label for="filterEmail">Email</Label>
              <Input
                id="filterEmail"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
              />
            </FormGroup>
            <Button
              color="primary"
              className="mt-3"
              block
              onClick={() => {
                fetchUsers(1);
                setCurrentPage(1);
                setShowFilter(false);
              }}
            >
              Áp dụng lọc
            </Button>
          </Form>
        </OffcanvasBody>
      </Offcanvas>

      {/* Modal thêm/sửa người dùng */}
      {showModal && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUser ? "Cập nhật" : "Thêm người dùng"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <CreateUser
                  user={editingUser}
                  onSuccess={() => {
                    fetchUsers(currentPage);
                    fetchUserStatusCounts();
                    setShowModal(false);
                  }}
                  onClose={() => setShowModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa người dùng */}
      {showDeleteModal && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận xóa</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn xóa người dùng này không?</p>
              </div>
              <div className="modal-footer">
                <Button
                  color="secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={() => {
                    deleteUser(userToDelete)
                      .then(() => {
                        fetchUsers();
                        setShowDeleteModal(false);
                      })
                      .catch((err) => {
                        console.error("Lỗi khi gọi API xóa user:", err);

                        const response = err?.response?.data;
                        const errors = response?.errors;
                        const message = response?.message;

                        let errorMessage = "";

                        if (typeof errors === "string") {
                          errorMessage = errors;
                        } else if (
                          typeof errors === "object" &&
                          errors !== null
                        ) {
                          errorMessage = Object.values(errors)?.[0];
                        }

                        errorMessage =
                          errorMessage ||
                          message ||
                          "Xảy ra lỗi không xác định.";

                        setDeleteError(errorMessage);
                        setShowDeleteError(true);

                        setShowDeleteModal(false);
                      });
                  }}
                >
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Modal
        isOpen={showDeleteError}
        toggle={() => setShowDeleteError(false)}
        centered
      >
        <div className="modal-header">
          <h5 className="modal-title">Lỗi</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowDeleteError(false)}
          ></button>
        </div>
        <div className="modal-body">
          <p>{deleteError}</p>
        </div>
        <div className="modal-footer">
          <Button color="secondary" onClick={() => setShowDeleteError(false)}>
            Đóng
          </Button>
        </div>
      </Modal>
    </div>
  );
}
