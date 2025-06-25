import React, { useEffect, useState } from "react";
import {
    getUsers,
    deleteUser,
    blockUser,
    unblockUser,
} from "@services/admin/userService.js";
import Swal from "sweetalert2";
import CreateUser from "./CreateUser";
import Breadcrumbs from "@components/admin/ui/Breadcrumb.jsx";

export default function ListUser() {
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [keyword, setKeyword] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        fetchUsers();
    }, [keyword, filterStatus]);

    const fetchUsers = () => {
        setLoading(true);
        const params = { keyword };
        if (filterStatus !== "all") {
            params.status = filterStatus;
        }

        getUsers(params)
            .then((res) => {
                const result = res.data.data;
                setUsers(result.items || []);
                setMeta(result.meta || {});
            })
            .finally(() => setLoading(false));
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
                });
            }
        });
    };

    return (
        <div className="page-content">
            <Breadcrumbs title="Danh sách nhân viên" breadcrumbItem="Danh sách nhân viên" />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingUser(null);
                        setShowModal(true);
                    }}
                >
                    + Thêm mới
                </button>
            </div>

            {/* Tabs lọc trạng thái */}
            <ul className="nav nav-tabs mb-3">
                {["all", "active", "inactive", "blocked"].map((status) => (
                    <li className="nav-item" key={status}>
                        <button
                            className={`nav-link ${filterStatus === status ? "active" : ""}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {{
                                all: "Tất cả",
                                active: "Đang hoạt động",
                                inactive: "Dừng hoạt động",
                                blocked: "Đã khóa",
                            }[status]}
                        </button>
                    </li>
                ))}
            </ul>

            {/* Tìm kiếm */}
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Tìm kiếm người dùng..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
            />

            {/* Danh sách người dùng */}
            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <table className="table table-bordered">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Ảnh đại diện</th>
                        <th>Tên</th>
                        <th>Họ Và Tên</th>
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
                                        <span className="badge bg-danger">Đã khóa</span>
                                    ) : user.status === "inactive" ? (
                                        <span className="badge bg-secondary">Dừng hoạt động</span>
                                    ) : (
                                        <span className="badge bg-success">Hoạt động</span>
                                    )}
                                </td>
                                <td>
                                    {user.status === "inactive" ? (
                                        <span className="text-muted">Đã xóa</span>
                                    ) : user.status === "blocked" ? (
                                        <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => handleUnblock(user.id)}
                                        >
                                            Mở khóa
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                className="btn btn-sm btn-warning me-2"
                                                onClick={() => {
                                                    setEditingUser(user);
                                                    setShowModal(true);
                                                }}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger me-2"
                                                onClick={() => handleDelete(user.id)}
                                            >
                                                Xóa
                                            </button>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => handleBlock(user.id)}
                                            >
                                                Khóa
                                            </button>
                                        </>
                                    )}
                                </td>

                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            )}

            {/* Modal thêm/sửa */}
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
