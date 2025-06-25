import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getPermissionGroups, deletePermissionGroup } from "@services/admin/permissiongroupService.js";
import CreatePermissionGroup from "./CreatePermissionGroup";
import Breadcrumbs from "@components/admin/ui/Breadcrumb.jsx";

export default function ListPermissionGroup() {
    const [groups, setGroups] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [keyword, setKeyword] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);

    useEffect(() => {
        fetchGroups();
    }, [page, perPage, keyword]);

    const fetchGroups = () => {
        setLoading(true);
        getPermissionGroups({ page, perPage, keyword })
            .then((res) => {
                const result = res.data.data;
                setGroups(result.items || []);
                setMeta(result.meta || {});
                setLoading(false);
            })
            .catch((err) => {
                console.error("Lỗi lấy nhóm quyền:", err);
                setLoading(false);
            });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            text: "Thao tác này sẽ xóa nhóm quyền!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {
                deletePermissionGroup(id)
                    .then(() => {
                        Swal.fire("Đã xóa!", "Nhóm quyền đã được xóa.", "success");
                        fetchGroups();
                    })
                    .catch((err) => {
                        const message = err?.response?.data?.message || "Xóa thất bại.";
                        const errors = err?.response?.data?.errors;

                        let errorDetail = "";

                        if (errors && typeof errors === "object") {
                            const allErrors = Object.values(errors).flat();
                            errorDetail = allErrors.length > 0 ? `\n- ${allErrors.join("\n- ")}` : "";
                        }

                        Swal.fire("Lỗi!", `${message}${errorDetail}`, "error");
                    });

            }
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchGroups();
    };

    return (
        <div className="page-content">
            <Breadcrumbs
                title="Danh sách nhóm quyền"
                breadcrumbItem="Danh sách nhóm quyền"
            />
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingGroup(null);
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
                        placeholder="Tìm kiếm nhóm quyền..."
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
                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Tên nhóm quyền</th>
                        <th>Mô tả</th>
                        <th>Ngày tạo</th>
                        <th>Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    {groups.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="text-center">Không có nhóm quyền nào.</td>
                        </tr>
                    ) : (
                        groups.map((group) => (
                            <tr key={group.id}>
                                <td>{group.id}</td>
                                <td>{group.group_name}</td>
                                <td>{group.description}</td>
                                <td>{group.created_at}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-warning me-2"
                                        onClick={() => {
                                            setEditingGroup(group);
                                            setShowModal(true);
                                        }}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(group.id)}
                                    >
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
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingGroup ? "Sửa Nhóm Quyền" : "Thêm Nhóm Quyền"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingGroup(null);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <CreatePermissionGroup
                                    group={editingGroup}
                                    onSuccess={() => {
                                        fetchGroups();
                                        setShowModal(false);
                                        setEditingGroup(null);
                                    }}
                                    onClose={() => {
                                        setShowModal(false);
                                        setEditingGroup(null);
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
