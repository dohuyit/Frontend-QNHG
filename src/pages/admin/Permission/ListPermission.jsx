import React, { useEffect, useState } from "react";
import { getPermissions, deletePermission } from "@services/admin/permissionService.js";
import Swal from "sweetalert2";
import CreatePermission from "./CreatePermission";
import Breadcrumbs from "@components/admin/ui/Breadcrumb.jsx";

export default function ListPermission() {
    const [permissions, setPermissions] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [keyword, setKeyword] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingPermission, setEditingPermission] = useState(null);

    useEffect(() => {
        fetchPermissions();
    }, [page, perPage, keyword]);

    const fetchPermissions = () => {
        setLoading(true);
        getPermissions({ page, perPage, keyword })
            .then((res) => {
                const result = res.data.data;
                setPermissions(result.items || []);
                setMeta(result.meta || {});
                setLoading(false);
            })
            .catch((err) => {
                console.error("Lỗi lấy danh sách quyền:", err);
                setLoading(false);
            });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            text: "Thao tác này sẽ xóa quyền!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {
                deletePermission(id)
                    .then(() => {
                        Swal.fire("Đã xóa!", "Quyền đã được xóa.", "success");
                        fetchPermissions();
                    })
                    .catch((err) => {
                        const message = err?.response?.data?.message || "Không thể xóa.";
                        const errors = err?.response?.data?.errors;

                        let errorDetail = "";

                        if (errors && typeof errors === "object") {
                            const allErrors = Object.values(errors).flat();
                            errorDetail = allErrors.length > 0 ? `\n- ${allErrors.join("\n- ")}` : "";
                        }

                        Swal.fire("Lỗi!", `${message}${errorDetail}`, "error");
                        console.error("Xóa thất bại:", err);
                    });

            }
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchPermissions();
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
                    Trang {meta.page} / {meta.totalPage} — Tổng: {meta.total} quyền
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
                title="Danh sách quyền"
                breadcrumbItem="Danh sách quyền"
            />
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingPermission(null);
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
                        placeholder="Tìm kiếm quyền..."
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
                            <th>Tên quyền</th>
                            <th>Tên nhóm quyền</th>
                            <th>Mô tả nhóm quyền</th>
                            <th>Mô tả quyền</th>
                            <th>Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {permissions.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center">Không có quyền nào.</td>
                            </tr>
                        ) : (
                            permissions.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.permission_name}</td>
                                    <td>{item.permission_group_name}</td>
                                    <td>{item.permission_group_description}</td>
                                    <td>{item.description}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-warning me-2"
                                            onClick={() => {
                                                setEditingPermission(item);
                                                setShowModal(true);
                                            }}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            Xóa
                                        </button>
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
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editingPermission ? "Cập nhật quyền" : "Thêm quyền"}</h5>
                                <button type="button" className="btn-close" onClick={() => {
                                    setShowModal(false);
                                    setEditingPermission(null);
                                }}></button>
                            </div>
                            <div className="modal-body">
                                <CreatePermission
                                    permission={editingPermission}
                                    onSuccess={() => {
                                        fetchPermissions();
                                        setShowModal(false);
                                        setEditingPermission(null);
                                    }}
                                    onClose={() => {
                                        setShowModal(false);
                                        setEditingPermission(null);
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
