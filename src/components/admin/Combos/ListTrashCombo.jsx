import React, { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    Table,
    Pagination,
    PaginationItem,
    PaginationLink,
    Spinner,
} from "reactstrap";
import { FaTrash, FaUndo } from "react-icons/fa";
import { getTrashedCombos, forceDeleteCombo, restoreCombo } from "@services/admin/comboService";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ROWS_PER_PAGE = 10;
const fullUrl = "http://localhost:8000/storage/";

const ListTrashCombo = () => {
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({
        current_page: 1,
        per_page: ROWS_PER_PAGE,
        total: 0,
        last_page: 1,
    });

    const fetchTrashedCombos = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                per_page: ROWS_PER_PAGE,
            };
            const res = await getTrashedCombos(params);
            const items = res.data?.data?.items;
            if (Array.isArray(items)) {
                setCombos(items);
                setMeta({
                    current_page: res.data.data.meta?.page || 1,
                    per_page: res.data.data.meta?.perPage || ROWS_PER_PAGE,
                    total: res.data.data.meta?.total || 0,
                    last_page: res.data.data.meta?.totalPage || 1,
                });
            } else {
                setCombos([]);
                toast.error("Lỗi khi tải danh sách combo trong thùng rác!");
            }
        } catch {
            setCombos([]);
            toast.error("Lỗi khi tải danh sách combo trong thùng rác!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrashedCombos(meta.current_page);
    }, [meta.current_page]);

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= meta.last_page) {
            setMeta((prev) => ({ ...prev, current_page: pageNumber }));
        }
    };

    const handleRestore = async (id) => {
        try {
            await restoreCombo(id);
            toast.success("Khôi phục combo thành công!");
            fetchTrashedCombos(meta.current_page);
        } catch {
            toast.error("Lỗi khi khôi phục combo!");
        }
    };

    const handlePermanentDelete = async (id) => {
        const result = await Swal.fire({
            title: "Xóa vĩnh viễn combo?",
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa vĩnh viễn",
            cancelButtonText: "Hủy",
        });
        if (result.isConfirmed) {
            try {
                await forceDeleteCombo(id);
                toast.success("Xóa vĩnh viễn combo thành công!");
                fetchTrashedCombos(meta.current_page);
            } catch {
                toast.error("Lỗi khi xóa vĩnh viễn combo!");
            }
        }
    };

    return (
        <>
            <Card>
                <CardBody>
                    {loading ? (
                        <div className="text-center my-5">
                            <Spinner color="primary" />
                        </div>
                    ) : (
                        <Table bordered responsive hover className="mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: 60 }}>#</th>
                                    <th>Ảnh</th>
                                    <th>Tên combo</th>
                                    <th>Giá</th>
                                    <th>Trạng thái</th>
                                    <th>Danh sách món</th>
                                    <th style={{ width: 120 }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {combos.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center text-muted">
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                ) : (
                                    combos.map((combo, idx) => (
                                        <tr key={combo.id}>
                                            <td>{(meta.current_page - 1) * meta.per_page + idx + 1}</td>
                                            <td>
                                                {combo.image_url ? (
                                                    <img
                                                        src={`${fullUrl}${combo.image_url}`}
                                                        alt={combo.name}
                                                        style={{ width: 50, height: 50, objectFit: "cover" }}
                                                    />
                                                ) : (
                                                    <span>Không có ảnh</span>
                                                )}
                                            </td>
                                            <td>{combo.name}</td>
                                            <td>
                                                <strong style={{ color: "#28a745", fontSize: "1.1em" }}>
                                                    {combo.price ? `${combo.price.toLocaleString()} VNĐ` : "N/A"}
                                                </strong>
                                            </td>
                                            <td>
                                                {combo.status === "active" ? (
                                                    <span className="badge bg-success">Đang bán</span>
                                                ) : (
                                                    <span className="badge bg-danger">Ngưng bán</span>
                                                )}
                                            </td>
                                            <td>
                                                {combo.items && combo.items.length > 0 ? (
                                                    <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
                                                        {combo.items.map(item => (
                                                            <li key={item.id}>{item.name} {item.quantity ? `x${item.quantity}` : ''}</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span style={{ color: "#bdbdbd", fontStyle: "italic" }}>Chưa có món</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-success btn-sm me-2"
                                                    onClick={() => handleRestore(combo.id)}
                                                >
                                                    <FaUndo />
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handlePermanentDelete(combo.id)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    )}
                </CardBody>
                {meta.last_page > 1 && (
                    <CardBody className="d-flex justify-content-end">
                        <Pagination aria-label="pagination">
                            <PaginationItem disabled={meta.current_page === 1}>
                                <PaginationLink first onClick={() => handlePageChange(1)} />
                            </PaginationItem>
                            <PaginationItem disabled={meta.current_page === 1}>
                                <PaginationLink
                                    previous
                                    onClick={() => handlePageChange(meta.current_page - 1)}
                                />
                            </PaginationItem>
                            {Array.from({ length: meta.last_page }, (_, i) => (
                                <PaginationItem active={meta.current_page === i + 1} key={i}>
                                    <PaginationLink onClick={() => handlePageChange(i + 1)}>
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem disabled={meta.current_page === meta.last_page}>
                                <PaginationLink
                                    next
                                    onClick={() => handlePageChange(meta.current_page + 1)}
                                />
                            </PaginationItem>
                            <PaginationItem disabled={meta.current_page === meta.last_page}>
                                <PaginationLink
                                    last
                                    onClick={() => handlePageChange(meta.last_page)}
                                />
                            </PaginationItem>
                        </Pagination>
                    </CardBody>
                )}
            </Card>
        </>
    );
};

export default ListTrashCombo; 