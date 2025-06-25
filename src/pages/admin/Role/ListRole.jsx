import React, { useEffect, useState } from "react";
import { getRoles, deleteRole } from "@services/admin/roleService";
import { Link } from "react-router-dom";
import CreateRole from "./CreateRole";
import Swal from "sweetalert2";
import Breadcrumbs from "@components/admin/ui/Breadcrumb.jsx";


export default function ListRole() {
    const [roles, setRoles] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [keyword, setKeyword] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null); // ✅ lưu vai trò đang sửa

    useEffect(() => {
        fetchRoles();
    }, [page, perPage, keyword]);

    const fetchRoles = () => {
        setLoading(true);
        getRoles({ page, perPage, keyword })
            .then((res) => {
                const result = res.data.data;
                setRoles(result.items || []);
                setMeta(result.meta || {});
                setLoading(false);
            })
            .catch((err) => {
                console.error("Lỗi lấy danh sách vai trò:", err);
                setLoading(false);
            });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            text: "Thao tác này sẽ xóa vai trò!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {
                deleteRole(id)
                    .then(() => {
                        Swal.fire("Đã xóa!", "Vai trò đã được xóa thành công.", "success");
                        fetchRoles();
                    })
                    .catch((err) => {
                        const response = err?.response;
                        const message = response?.data?.message || "Xóa thất bại.";
                        const errors = response?.data?.errors;

                        let detailMessage = message;

                        if (errors?.role_id && Array.isArray(errors.role_id)) {
                            detailMessage += "\n" + errors.role_id.join("\n");
                        }

                        Swal.fire("Lỗi!", detailMessage, "error");
                        console.error("Xóa thất bại:", err);
                    });
            }
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchRoles();
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= meta.totalPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`btn btn-sm me-1 ${page === i ? "btn-primary" : "btn-outline-primary"}`}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                    Trang {meta.page} / {meta.totalPage} — Tổng cộng: {meta.total} vai trò
                </div>
                <div>
                    <button
                        className="btn btn-sm btn-outline-secondary me-1"
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                    >
                        &laquo;
                    </button>

                    {pages}

                    <button
                        className="btn btn-sm btn-outline-secondary ms-1"
                        disabled={page >= meta.totalPage}
                        onClick={() => setPage(page + 1)}
                    >
                        &raquo;
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="page-content">
            <Breadcrumbs
                title="Danh sách vai trò"
                breadcrumbItem="Danh sách vai trò"
            />
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingRole(null); // ✅ để phân biệt với sửa
                        setShowModal(true);
                    }}
                >
                    + Thêm mới
                </button>
            </div>

            <form className="row g-3 align-items-center mb-3" onSubmit={handleSearch}>
                <div className="col-auto">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm vai trò..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
                <div className="col-auto">
                    <select
                        className="form-select"
                        value={perPage}
                        onChange={(e) => {
                            setPerPage(Number(e.target.value));
                            setPage(1);
                        }}
                    >
                        <option value="5">5 dòng/trang</option>
                        <option value="10">10 dòng/trang</option>
                        <option value="20">20 dòng/trang</option>
                    </select>
                </div>
                <div className="col-auto">
                    <button className="btn btn-outline-primary" type="submit">Tìm</button>
                </div>
            </form>

            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <>
                    <table className="table table-bordered table-hover">
                        <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Tên vai trò</th>
                            <th>Mô tả</th>
                            <th>Ngày tạo</th>
                            <th>Ngày cập nhật</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {roles.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center">Không tìm thấy vai trò nào.</td>
                            </tr>
                        ) : (
                            roles.map((role) => (
                                <tr key={role.id}>
                                    <td>{role.id}</td>
                                    <td>{role.role_name}</td>
                                    <td>{role.description}</td>
                                    <td>{role.created_at}</td>
                                    <td>{role.updated_at}</td>
                                    <td>
                                        {role.deleted_at ? (
                                            <span className="badge bg-danger">Đã xóa</span>
                                        ) : (
                                            <span className="badge bg-success">Hoạt động</span>
                                        )}
                                    </td>
                                    <td>
                                        {!role.deleted_at && (
                                            <>
                                                <button
                                                    className="btn btn-sm btn-warning me-2"
                                                    onClick={() => {
                                                        setEditingRole(role); // ✅ set role cần sửa
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(role.id)}
                                                    className="btn btn-sm btn-danger"
                                                >
                                                    Xóa
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>

                    {meta.totalPage > 1 && renderPagination()}
                </>
            )}

            {showModal && (
                <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingRole ? "Cập Nhật Vai Trò" : "Thêm Vai Trò Mới"}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => {
                                    setShowModal(false);
                                    setEditingRole(null);
                                }}></button>
                            </div>
                            <div className="modal-body">
                                <CreateRole
                                    role={editingRole}
                                    onSuccess={() => {
                                        fetchRoles();
                                        setShowModal(false);
                                        setEditingRole(null);
                                    }}
                                    onClose={() => {
                                        setShowModal(false);
                                        setEditingRole(null);
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
