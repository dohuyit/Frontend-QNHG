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
import {
    getUsers,
    deleteUser,
    blockUser,
    unblockUser,
    countUsersByStatus,
} from "@services/admin/userService";

import CustomerFilterBar from "@components/admin/CustomerFilterBar"; // import đây

const userStatusOptions = [
    { label: "Tất cả", value: "all", badgeColor: "secondary" },
    { label: "Đang hoạt động", value: "active", badgeColor: "success" },
    { label: "Dừng hoạt động", value: "inactive", badgeColor: "secondary" },
    { label: "Đã khóa", value: "blocked", badgeColor: "danger" },
];

export default function ListUser() {
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        fetchUsers();
        fetchUserStatusCounts();
    }, [keyword, filterStatus]);

    const fetchUsers = (page = 1) => {
        setLoading(true);
        const params = { page, keyword };

        if (filterStatus !== "all") params.status = filterStatus;
        if (filterUsername) params.username = filterUsername;
        if (filterEmail) params.email = filterEmail;

        getUsers(params)
            .then((res) => {
                const result = res.data.data;
                setUsers(result.items || []);
                setMeta(result.meta || {});
            })
            .finally(() => setLoading(false));
    };

    const fetchUserStatusCounts = () => {
        countUsersByStatus()
            .then((res) => setUserStatusCounts(res.data.data || {}))
            .catch(console.error);
    };

    const handleDelete = (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
        deleteUser(id).then(() => {
            fetchUsers();
            fetchUserStatusCounts();
        });
    };

    const handleBlock = (id) => {
        blockUser(id).then(() => {
            fetchUsers();
            fetchUserStatusCounts();
        });
    };

    const handleUnblock = (id) => {
        unblockUser(id).then(() => {
            fetchUsers();
            fetchUserStatusCounts();
        });
    };

    return (
        <div className="page-content">
            <Breadcrumbs title="Danh sách nhân viên" breadcrumbItem="Quản lý người dùng" />

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
                    {/* Hàng nút lọc trạng thái */}
                    <div className="d-flex flex-wrap gap-2 mb-3">
                        {userStatusOptions.map((opt) => (
                            <Button
                                key={opt.value}
                                color={filterStatus === opt.value ? opt.badgeColor : "light"}
                                onClick={() => setFilterStatus(opt.value)}
                            >
                                {opt.label}
                                <Badge
                                    color={opt.badgeColor}
                                    pill
                                    className="ms-2"
                                    style={{ fontSize: 13 }}
                                >
                                    {opt.value === "all"
                                        ? Object.values(userStatusCounts).reduce((a, b) => a + b, 0)
                                        : userStatusCounts[opt.value] || 0}
                                </Badge>
                            </Button>
                        ))}
                    </div>

                    {/* Tái sử dụng filter bar */}
                    <CustomerFilterBar
                        searchKeyword={keyword}
                        onSearchChange={setKeyword}
                        selectedStatus={filterStatus}
                        onStatusChange={setFilterStatus}
                        statusOptions={userStatusOptions}
                        showDropdown={true}
                        onOpenAdvancedFilter={() => setShowFilter(true)}
                        placeholder="Tìm kiếm theo tên, SĐT, email..."
                    />
                </CardHeader>
            </Card>

            {/* Table hiển thị người dùng */}
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
                            <td colSpan="8" className="text-center">Không có dữ liệu</td>
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
                                        <Button size="sm" color="light" onClick={() => {
                                            setEditingUser(user);
                                            setShowModal(true);
                                        }}>
                                            <i className="bi bi-pencil-square"></i>
                                        </Button>
                                        <Button size="sm" color="light" onClick={() => handleDelete(user.id)}>
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                        {user.status === "blocked" ? (
                                            <Button size="sm" color="success" onClick={() => handleUnblock(user.id)}>
                                                <i className="bi bi-unlock"></i>
                                            </Button>
                                        ) : (
                                            <Button size="sm" color="light" onClick={() => handleBlock(user.id)}>
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
            </div>

            {/* Offcanvas lọc nâng cao */}
            <Offcanvas direction="end" isOpen={showFilter} toggle={() => setShowFilter(false)}>
                <OffcanvasHeader toggle={() => setShowFilter(false)}>Bộ lọc nâng cao</OffcanvasHeader>
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
                <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editingUser ? "Cập nhật" : "Thêm người dùng"}</h5>
                                <button className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <CreateUser
                                    user={editingUser}
                                    onSuccess={() => {
                                        fetchUsers();
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
        </div>
    );
}
