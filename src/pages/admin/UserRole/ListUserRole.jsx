import React, { useEffect, useState } from "react";
import {
    Button,
    Input,
    Card,
    CardHeader,
    InputGroup,
    InputGroupText,
} from "reactstrap";
import Swal from "sweetalert2";
import { getUserRoleList, deleteUserRole } from "@services/admin/userRoleService";
import CreateUserRole from "./CreateUserRole";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";

export default function ListUserRole() {
    const [userRoles, setUserRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUserRole, setEditingUserRole] = useState(null);
    const [keyword, setKeyword] = useState("");

    useEffect(() => {
        fetchUserRoles();
    }, [keyword]);

    const fetchUserRoles = () => {
        setLoading(true);
        getUserRoleList({ keyword })
            .then((res) => {
                setUserRoles(res.data?.data?.items || []);
            })
            .finally(() => setLoading(false));
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Xác nhận xóa?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xóa"
        }).then((result) => {
            if (result.isConfirmed) {
                deleteUserRole(id)
                    .then((res) => {
                        if (res.data?.code === "SUCCESS") {
                            Swal.fire("Đã xóa!", "", "success");
                            fetchUserRoles();
                        } else {
                            Swal.fire("Không thể xóa", res.data?.message || "Đã xảy ra lỗi", "error");
                        }
                    })
                    .catch((error) => {
                        const message = error.response?.data?.message || "Lỗi kết nối hoặc server.";
                        Swal.fire("Không thể xóa", message, "error");
                    });
            }
        });
    };

    return (
        <div className="page-content">
            <Breadcrumbs title="Phân quyền người dùng" breadcrumbItem="Danh sách phân quyền" />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button color="primary" onClick={() => {
                    setEditingUserRole(null);
                    setShowModal(true);
                }}>
                    + Thêm phân quyền
                </Button>
            </div>

            <Card className="mb-4">
                <CardHeader className="bg-white border-bottom-0">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <div style={{ width: 320 }}>
                            <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-search" />
          </span>
                                <Input
                                    type="search"
                                    placeholder="Tìm theo username hoặc email..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>


            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                        <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Mô tả vai trò</th>
                            <th>Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        {userRoles.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center">Không có dữ liệu</td>
                            </tr>
                        ) : (
                            userRoles.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.username}</td>
                                    <td>{item.email}</td>
                                    <td>{item.role_name}</td>
                                    <td>{item.role_description}</td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <Button
                                                size="sm"
                                                color="light"
                                                title="Sửa"
                                                onClick={() => {
                                                    setEditingUserRole(item);
                                                    setShowModal(true);
                                                }}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </Button>
                                            <Button
                                                size="sm"
                                                color="light"
                                                title="Xóa"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingUserRole ? "Cập nhật phân quyền" : "Thêm phân quyền"}
                                </h5>
                                <button className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <CreateUserRole
                                    userRole={editingUserRole}
                                    onSuccess={() => {
                                        fetchUserRoles();
                                        setShowModal(false);
                                        setEditingUserRole(null);
                                    }}
                                    onClose={() => {
                                        setShowModal(false);
                                        setEditingUserRole(null);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
