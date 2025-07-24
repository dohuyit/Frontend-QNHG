import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    Row,
    Col,
    Button,
    Badge,
    Input,
    Offcanvas,
    OffcanvasHeader,
    OffcanvasBody,
    Form,
    FormGroup,
    Label,
} from "reactstrap";
import Swal from "sweetalert2";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import CreateUser from "./CreateUser";
import {
    getUsers,
    deleteUser,
    blockUser,
    unblockUser,
    countUsersByStatus, // ✅ mới thêm
} from "@services/admin/userService";

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
        pending_activation: 0,
    }); // ✅ mới thêm

    useEffect(() => {
        fetchUsers();
        fetchUserStatusCounts(); // ✅ gọi đếm trạng thái
    }, [keyword, filterStatus]);

    const fetchUsers = (page = 1) => {
        setLoading(true);
        const params = { page, keyword };

        if (filterStatus !== "all") {
            params.status = filterStatus;
        }

        if (filterUsername) {
            params.username = filterUsername;
        }

        if (filterEmail) {
            params.email = filterEmail;
        }

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
            .then((res) => {
                setUserStatusCounts(res.data.data || {});
            })
            .catch((err) => {
                console.error("Lỗi khi lấy thống kê trạng thái user:", err);
            });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Xác nhận xóa",
            text: "Bạn có chắc chắn muốn xóa người dùng này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xóa",
        }).then((res) => {
            if (res.isConfirmed) {
                deleteUser(id).then(() => {
                    Swal.fire("Đã xóa!", "", "success");
                    fetchUsers();
                    fetchUserStatusCounts();
                });
            }
        });
    };

    const handleBlock = (id) => {
        Swal.fire({
            title: "Khóa người dùng?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Khóa",
        }).then((res) => {
            if (res.isConfirmed) {
                blockUser(id).then(() => {
                    Swal.fire("Đã khóa người dùng", "", "success");
                    fetchUsers();
                    fetchUserStatusCounts();
                });
            }
        });
    };

    const handleUnblock = (id) => {
        Swal.fire({
            title: "Mở khóa người dùng?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Mở khóa",
        }).then((res) => {
            if (res.isConfirmed) {
                unblockUser(id).then(() => {
                    Swal.fire("Đã mở khóa người dùng", "", "success");
                    fetchUsers();
                    fetchUserStatusCounts();
                });
            }
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
                    <Row className="align-items-center">
                        <Col md="8" sm="12" className="mb-2 mb-md-0 d-flex flex-wrap gap-2">
                            {userStatusOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFilterStatus(opt.value)}
                                    className="btn btn-light border"
                                    style={{
                                        fontWeight: filterStatus === opt.value ? "bold" : "normal",
                                        borderColor: filterStatus === opt.value ? "#0d6efd" : "#ccc",
                                        color: filterStatus === opt.value ? "#0d6efd" : "#333",
                                    }}
                                >
                                    {opt.label}
                                    <Badge
                                        color={opt.badgeColor}
                                        pill
                                        className="ms-2"
                                        style={{ fontSize: 13 }}
                                    >
                                        {
                                            opt.value === "all"
                                                ? Object.values(userStatusCounts).reduce((a, b) => a + b, 0)
                                                : userStatusCounts[opt.value] || 0
                                        }
                                    </Badge>
                                </button>
                            ))}
                        </Col>
                        <Col md="4" sm="12" className="d-flex justify-content-md-end justify-content-start gap-2">
                            <Input
                                type="search"
                                placeholder="Tìm kiếm người dùng..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                style={{ maxWidth: 250 }}
                            />
                            <Button
                                color="light"
                                className="border"
                                onClick={() => setShowFilter(true)}
                            >
                                <i className="mdi mdi-filter-variant me-1"></i> Lọc nâng cao
                            </Button>
                        </Col>
                    </Row>
                </CardHeader>
            </Card>

            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ảnh đại diện</th>
                            <th>Tên đăng nhập</th>
                            <th>Họ và tên</th>
                            <th>Email</th>
                            <th>Phone</th>
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
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                }}
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
                                            <Badge color="secondary">Dừng hoạt động</Badge>
                                        ) : (
                                            <Badge color="success">Hoạt động</Badge>
                                        )}
                                    </td>
                                    <td>
                                        {user.status === "inactive" ? (
                                            <span className="text-muted">Đã xóa</span>
                                        ) : user.status === "blocked" ? (
                                            <Button
                                                color="success"
                                                size="sm"
                                                onClick={() => handleUnblock(user.id)}
                                                title="Mở khóa"
                                            >
                                                <i className="bi bi-unlock"></i>
                                            </Button>
                                        ) : (
                                            <div className="d-flex gap-2">
                                                <Button
                                                    color="light"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingUser(user);
                                                        setShowModal(true);
                                                    }}
                                                    title="Sửa"
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </Button>
                                                <Button
                                                    color="light"
                                                    size="sm"
                                                    onClick={() => handleDelete(user.id)}
                                                    title="Xóa"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                                <Button
                                                    color="light"
                                                    size="sm"
                                                    onClick={() => handleBlock(user.id)}
                                                    title="Khóa"
                                                >
                                                    <i className="bi bi-lock"></i>
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {meta.total > meta.per_page && (
                <div className="d-flex justify-content-end mt-3 align-items-center gap-2">
                    <Button
                        color="light"
                        disabled={!meta.prev_page_url}
                        onClick={() => fetchUsers(meta.current_page - 1)}
                    >
                        Trước
                    </Button>
                    <span>
                        Trang {meta.current_page} / {meta.last_page}
                    </span>
                    <Button
                        color="light"
                        disabled={!meta.next_page_url}
                        onClick={() => fetchUsers(meta.current_page + 1)}
                    >
                        Sau
                    </Button>
                </div>
            )}

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
                            <Label for="filterName">Tên đăng nhập</Label>
                            <Input
                                id="filterName"
                                placeholder="Nhập tên đăng nhập..."
                                value={filterUsername}
                                onChange={(e) => setFilterUsername(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="filterEmail">Email</Label>
                            <Input
                                id="filterEmail"
                                placeholder="Nhập email..."
                                value={filterEmail}
                                onChange={(e) => setFilterEmail(e.target.value)}
                            />
                        </FormGroup>
                        <Button
                            color="primary"
                            className="mt-3"
                            block
                            onClick={() => {
                                setShowFilter(false);
                                fetchUsers(1);
                            }}
                        >
                            Áp dụng lọc
                        </Button>
                    </Form>
                </OffcanvasBody>
            </Offcanvas>

            {showModal && (
                <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingUser ? "Cập nhật người dùng" : "Thêm người dùng"}
                                </h5>
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
