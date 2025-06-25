import React from "react";
import {
    Card,
    CardBody,
    Table,
    Pagination,
    PaginationItem,
    PaginationLink,
} from "reactstrap";
import { MdModeEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";

const ROWS_PER_PAGE = 10;
const fullUrl = `http://localhost:8000/storage/`;

const ListCombo = ({ paginate = {}, data = [], onDelete, onPageChange, onEdit }) => {
    const currentPage = paginate.page || 1;
    const perPage = paginate.perPage || ROWS_PER_PAGE;
    const totalPages = paginate.totalPage || 1;

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && onPageChange) {
            onPageChange(page);
        }
    };

    return (
        <>
            <Card>
                <CardBody>
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
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center text-muted">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                data.map((combo, idx) => (
                                    <tr key={combo.id}>
                                        <td>{(currentPage - 1) * perPage + idx + 1}</td>
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
                                                className="btn btn-primary btn-sm me-2"
                                                onClick={() => onEdit && onEdit(combo.id)}
                                            >
                                                <MdModeEdit />
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => onDelete && onDelete(combo.id)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </CardBody>
                {totalPages > 1 && (
                    <CardBody className="d-flex justify-content-end">
                        <Pagination aria-label="pagination">
                            <PaginationItem disabled={currentPage === 1}>
                                <PaginationLink first onClick={() => handlePageChange(1)} />
                            </PaginationItem>
                            <PaginationItem disabled={currentPage === 1}>
                                <PaginationLink
                                    previous
                                    onClick={() => handlePageChange(currentPage - 1)}
                                />
                            </PaginationItem>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <PaginationItem active={currentPage === i + 1} key={i}>
                                    <PaginationLink onClick={() => handlePageChange(i + 1)}>
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem disabled={currentPage === totalPages}>
                                <PaginationLink
                                    next
                                    onClick={() => handlePageChange(currentPage + 1)}
                                />
                            </PaginationItem>
                            <PaginationItem disabled={currentPage === totalPages}>
                                <PaginationLink
                                    last
                                    onClick={() => handlePageChange(totalPages)}
                                />
                            </PaginationItem>
                        </Pagination>
                    </CardBody>
                )}
            </Card>
        </>
    );
};

export default ListCombo; 