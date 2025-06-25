import React, { useEffect, useState } from "react";
import {
    getUserRoleList,
    deleteUserRole
} from "@services/admin/userRoleService";
import Swal from "sweetalert2";
import CreateUserRole from "./CreateUserRole";
import Breadcrumbs from "@components/admin/ui/Breadcrumb.jsx";

export default function ListUserRole() {
    const [userRoles, setUserRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUserRole, setEditingUserRole] = useState(null);

    useEffect(() => {
        fetchUserRoles();
    }, []);

    const fetchUserRoles = () => {
        setLoading(true);
        getUserRoleList()
            .then((res) => {
                console.log("Dữ liệu phân quyền:", res.data);
                setUserRoles(res.data?.data?.items || []); // ✅ lấy đúng mảng items
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
                deleteUserRole(id).then(() => {
                    Swal.fire("Đã xóa!", "", "success");
                    fetchUserRoles();
                });
            }
        });
    };

    return (
        <div className="page-content">
            <Breadcrumbs title="Phân quyền" breadcrumbItem="Danh sách phân quyền" />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingUserRole(null);
                        setShowModal(true);
                    }}
                >
                    + Thêm phân quyền
                </button>
            </div>

            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <table className="table table-bordered">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Mô tả vai trò</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {userRoles.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="text-center">Không có dữ liệu</td>
                        </tr>
                    ) : (
                        userRoles.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.username}</td>
                                <td>{item.email}</td>
                                <td>{item.role_name}</td>
                                <td>{item.role_description}</td>
                                <td>{item.status === 'active' ? 'Hoạt động' : 'Đã khóa'}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-warning me-2"
                                        onClick={() => {
                                            setEditingUserRole(item); // set item đang sửa
                                            setShowModal(true);       // mở modal
                                        }}
                                    >
                                        Sửa
                                    </button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            )}

            {showModal && (
                <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
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
