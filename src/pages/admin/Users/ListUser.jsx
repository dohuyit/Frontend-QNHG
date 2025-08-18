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
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import CreateUser from "./CreateUser";
import {
    getUsers,
    countUsersByStatus,
    blockUser,
    unblockUser,
    getUserDetail,
} from "@services/admin/userService";
import SearchAndStatusFilterBar from "@components/admin/ui/SearchAndStatusFilterBar";
import "@pages/admin/KitchenOrders/KitchenOrdersKanban.css";
import StatusFilterGroup from "@components/admin/ui/StatusFilterGroup";

const userStatusOptions = [
    { label: "Tất cả", value: "all", badgeColor: "secondary" },
    { label: "Đang hoạt động", value: "active", badgeColor: "success" },
    { label: "Dừng hoạt động", value: "inactive", badgeColor: "secondary" },
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
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [alertModal, setAlertModal] = useState({
        show: false,
        message: "",
    });
    const handleEditUser = async (userId) => {
        try {
            const res = await getUserDetail(userId);
            const userDetail = {
                ...res.data.data.user,
                role: res.data.data.role
            };
            setEditingUser(userDetail);
            setShowModal(true);
        } catch (err) {
            console.error("Lỗi load user detail:", err);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
        fetchUserStatusCounts();
    }, [keyword, filterStatus, currentPage]);

    useEffect(() => {
        fetchUsers(1);
        setCurrentPage(1);
    }, [filterUsername, filterEmail]);

    const fetchUsers = (page = 1) => {
        const params = { page, keyword };
        if (filterStatus !== "all") params.status = filterStatus;
        if (filterUsername) params.username = filterUsername;
        if (filterEmail) params.email = filterEmail;

        getUsers(params)
            .then((res) => {
                console.log("fetchUsers response:", res.data);
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
            .catch((error) => {
                console.error("fetchUsers error:", error.response?.data || error.message);
            });
    };

    const fetchUserStatusCounts = () => {
        countUsersByStatus()
            .then((res) => {
                console.log("fetchUserStatusCounts response:", res.data);
                setUserStatusCounts(res.data.data || { active: 0, inactive: 0 });
            })
            .catch((error) => {
                console.error("fetchUserStatusCounts error:", error.response?.data || error.message);
            });
    };

    const handleToggleBlockUser = async (user) => {
        try {
            console.log(`Toggling status for user ${user.id}, current status: ${user.status}`);
            const action = user.status === "inactive" ? unblockUser : blockUser;
            const response = await action(user.id);
            console.log(`API response for user ${user.id}:`, response.data);
            setAlertModal({
                show: true,
                message: response.data.message || `Đã ${user.status === "inactive" ? "mở khóa" : "khóa"} tài khoản thành công`,
            });
            await Promise.all([fetchUsers(currentPage), fetchUserStatusCounts()]);
            console.log("User list and status counts updated");
        } catch (error) {
            console.error(`Error toggling status for user ${user.id}:`, error.response?.data || error.message);
            setAlertModal({
                show: true,
                message: error.response?.data?.error || `Lỗi khi ${user.status === "inactive" ? "mở khóa" : "khóa"} người dùng`,
            });
        }
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
                                    {user.status === "inactive" ? (
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
                                                console.log('User data being passed to edit modal:', user);
                                                setEditingUser(user);
                                                setShowModal(true);
                                            }}
                                        >
                                            <i className="bi bi-pencil-square"></i>
                                        </Button>

                                        <Button
                                            size="sm"
                                            color="light"
                                            onClick={() => handleToggleBlockUser(user)}
                                            title={
                                                user.status === "inactive"
                                                    ? "Mở khóa người dùng"
                                                    : "Khóa người dùng"
                                            }
                                        >
                                            {user.status === "inactive" ? (
                                                <i className="bi bi-unlock-fill text-success"></i>
                                            ) : (
                                                <i className="bi bi-lock-fill text-danger"></i>
                                            )}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>

                {renderPagination()}
            </div>

            {/* Bộ lọc nâng cao */}
            <Offcanvas
                direction="end"
                isOpen={showFilter}
                toggle={() => setShowFilter(false)}
            >
                <OffcanvasHeader toggle={() => setShowFilter(false)}>
                    <span>Bộ lọc nâng cao</span>
                    <Button
                        color="light"
                        size="sm"
                        style={{
                            position: "absolute",
                            right: 48,
                            top: 12,
                            boxShadow: "none",
                            zIndex: 1,
                        }}
                        onClick={() => {
                            setFilterUsername("");
                            setFilterEmail("");
                            setCurrentPage(1);
                            fetchUsers(1);
                        }}
                        title="Làm mới bộ lọc"
                    >
                        <i className="bi bi-arrow-clockwise"></i>
                    </Button>
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

            {/* Modal thông báo */}
            <Modal isOpen={alertModal.show} toggle={() => setAlertModal({ show: false, message: "" })}>
                <ModalHeader toggle={() => setAlertModal({ show: false, message: "" })}>
                    Thông báo
                </ModalHeader>
                <ModalBody>{alertModal.message}</ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        onClick={() => setAlertModal({ show: false, message: "" })}
                    >
                        Đóng
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}