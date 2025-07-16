import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    Button,
    Offcanvas,
    OffcanvasHeader,
    OffcanvasBody,
    Form,
    FormGroup,
    Label,
    Input,
} from "reactstrap";
import Swal from "sweetalert2";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import CreatePermissionGroup from "./CreatePermissionGroup";
import CustomerFilterBar from "@components/admin/CustomerFilterBar"; // ✅ đúng đường dẫn theo cấu trúc của bạn
import { getPermissionGroups, deletePermissionGroup } from "@services/admin/permissiongroupService";

export default function ListPermissionGroup() {
    const [groups, setGroups] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);

    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState("");
    const [filterGroupName, setFilterGroupName] = useState("");
    const [showFilter, setShowFilter] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, [page, keyword]);

    const fetchGroups = () => {
        setLoading(true);
        const params = {
            page,
            keyword,
            ...(filterGroupName && { group_name: filterGroupName }),
        };

        getPermissionGroups(params)
            .then((res) => {
                const result = res.data.data;
                setGroups(result.items || []);
                setMeta(result.meta || {});
            })
            .finally(() => setLoading(false));
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Xác nhận xóa",
            text: "Bạn có chắc chắn muốn xóa nhóm quyền này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
        }).then((res) => {
            if (res.isConfirmed) {
                deletePermissionGroup(id).then(() => {
                    Swal.fire("Đã xóa!", "", "success");
                    fetchGroups();
                });
            }
        });
    };

    return (
        <div className="page-content">
            <Breadcrumbs title="Danh sách nhóm quyền" breadcrumbItem="Quản lý nhóm quyền" />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button
                    color="primary"
                    onClick={() => {
                        setEditingGroup(null);
                        setShowModal(true);
                    }}
                >
                    + Thêm mới
                </Button>
            </div>

            <Card className="mb-4">
                <CardHeader className="bg-white border-bottom-0">
                    {/* ✅ Sử dụng lại component filter bar */}
                    <CustomerFilterBar
                        searchKeyword={keyword}
                        onSearchChange={(val) => {
                            setPage(1);
                            setKeyword(val);
                        }}
                        placeholder="Tìm kiếm nhóm quyền..."
                        showDropdown={false}
                        onOpenAdvancedFilter={() => setShowFilter(true)}
                        buttonLabel="Lọc nâng cao"
                    />
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
                            <th>Tên nhóm quyền</th>
                            <th>Mô tả</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {groups.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    Không có nhóm quyền nào.
                                </td>
                            </tr>
                        ) : (
                            groups.map((group) => (
                                <tr key={group.id}>
                                    <td>{group.id}</td>
                                    <td>{group.group_name}</td>
                                    <td>{group.description}</td>
                                    <td>{group.created_at}</td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <Button
                                                size="sm"
                                                color="light"
                                                title="Sửa"
                                                onClick={() => {
                                                    setEditingGroup(group);
                                                    setShowModal(true);
                                                }}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </Button>
                                            <Button
                                                size="sm"
                                                color="light"
                                                title="Xóa"
                                                onClick={() => handleDelete(group.id)}
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

            {/* Pagination */}
            {meta.total > meta.per_page && (
                <div className="d-flex justify-content-end mt-3 align-items-center gap-2">
                    <Button
                        color="light"
                        disabled={!meta.prev_page_url}
                        onClick={() => setPage(meta.current_page - 1)}
                    >
                        Trước
                    </Button>
                    <span>
            Trang {meta.current_page} / {meta.last_page}
          </span>
                    <Button
                        color="light"
                        disabled={!meta.next_page_url}
                        onClick={() => setPage(meta.current_page + 1)}
                    >
                        Sau
                    </Button>
                </div>
            )}

            {/* Offcanvas: Lọc nâng cao */}
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
                            <Label for="filterGroupName">Tên nhóm quyền</Label>
                            <Input
                                id="filterGroupName"
                                placeholder="Nhập tên nhóm quyền..."
                                value={filterGroupName}
                                onChange={(e) => setFilterGroupName(e.target.value)}
                            />
                        </FormGroup>
                        <Button
                            color="primary"
                            className="mt-3"
                            block
                            onClick={() => {
                                setPage(1);
                                setShowFilter(false);
                                fetchGroups();
                            }}
                        >
                            Áp dụng lọc
                        </Button>
                    </Form>
                </OffcanvasBody>
            </Offcanvas>

            {/* Modal thêm/sửa */}
            {showModal && (
                <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
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
