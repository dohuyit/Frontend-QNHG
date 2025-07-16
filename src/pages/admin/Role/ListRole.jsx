import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
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
import CreateRole from "./CreateRole";
import { getRoles, deleteRole } from "@services/admin/roleService";
import CustomerFilterBar from "@components/admin/CustomerFilterBar"; // ✅ import component tái sử dụng

export default function ListRole() {
    const [roles, setRoles] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);

    const [keyword, setKeyword] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [showFilter, setShowFilter] = useState(false);
    const [filterName, setFilterName] = useState("");

    useEffect(() => {
        fetchRoles();
    }, [keyword, filterStatus]);

    const fetchRoles = (page = 1) => {
        setLoading(true);
        const params = { page, keyword };

        if (filterStatus !== "all") {
            params.status = filterStatus;
        }

        if (filterName) {
            params.role_name = filterName;
        }

        getRoles(params)
            .then((res) => {
                const result = res.data.data;
                setRoles(result.items || []);
                setMeta(result.meta || {});
            })
            .finally(() => setLoading(false));
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
            cancelButtonText: "Hủy",
        }).then((result) => {
            if (result.isConfirmed) {
                deleteRole(id)
                    .then(() => {
                        Swal.fire("Đã xóa!", "Vai trò đã được xóa thành công.", "success");
                        fetchRoles();
                    })
                    .catch((err) => {
                        const message = err?.response?.data?.message || "Xóa thất bại.";
                        Swal.fire("Lỗi!", message, "error");
                    });
            }
        });
    };

    return (
        <div className="page-content">
            <Breadcrumbs title="Danh sách vai trò" breadcrumbItem="Quản lý vai trò" />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button color="primary" onClick={() => {
                    setEditingRole(null);
                    setShowModal(true);
                }}>
                    + Thêm mới
                </Button>
            </div>

            <Card className="mb-4">
                <CardHeader className="bg-white border-bottom-0">
                    {/* ✅ Sử dụng lại FilterBar */}
                    <CustomerFilterBar
                        searchKeyword={keyword}
                        onSearchChange={(val) => {
                            setKeyword(val);
                        }}
                        placeholder="Tìm kiếm vai trò..."
                        showDropdown={false}
                        onOpenAdvancedFilter={() => setShowFilter(true)}
                        buttonLabel="Lọc nâng cao"
                    />
                </CardHeader>
            </Card>

            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table table-bordered align-middle">
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
                                    <td colSpan="7" className="text-center">Không có dữ liệu</td>
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
                                                <Badge color="danger">Đã xóa</Badge>
                                            ) : (
                                                <Badge color="success">Hoạt động</Badge>
                                            )}
                                        </td>
                                        <td>
                                            {!role.deleted_at && (
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        color="light"
                                                        title="Sửa"
                                                        onClick={() => {
                                                            setEditingRole(role);
                                                            setShowModal(true);
                                                        }}
                                                    >
                                                        <i className="bi bi-pencil-square"></i>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        color="light"
                                                        title="Xóa"
                                                        onClick={() => handleDelete(role.id)}
                                                    >
                                                        <i className="bi bi-trash"></i>
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

                    {meta.total > meta.per_page && (
                        <div className="d-flex justify-content-end mt-3 align-items-center gap-2">
                            <Button
                                color="light"
                                disabled={!meta.prev_page_url}
                                onClick={() => fetchRoles(meta.current_page - 1)}
                            >
                                Trước
                            </Button>
                            <span>
                                Trang {meta.current_page} / {meta.last_page}
                            </span>
                            <Button
                                color="light"
                                disabled={!meta.next_page_url}
                                onClick={() => fetchRoles(meta.current_page + 1)}
                            >
                                Sau
                            </Button>
                        </div>
                    )}
                </>
            )}

            <Offcanvas direction="end" isOpen={showFilter} toggle={() => setShowFilter(false)}>
                <OffcanvasHeader toggle={() => setShowFilter(false)}>
                    Bộ lọc nâng cao
                </OffcanvasHeader>
                <OffcanvasBody>
                    <Form>
                        <FormGroup>
                            <Label for="filterRole">Tên vai trò</Label>
                            <Input
                                id="filterRole"
                                placeholder="Nhập tên vai trò..."
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                            />
                        </FormGroup>
                        <Button
                            color="primary"
                            className="mt-3"
                            block
                            onClick={() => {
                                setShowFilter(false);
                                fetchRoles(1);
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
                                    {editingRole ? "Cập nhật vai trò" : "Thêm vai trò"}
                                </h5>
                                <button className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <CreateRole
                                    role={editingRole}
                                    onSuccess={() => {
                                        fetchRoles();
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
