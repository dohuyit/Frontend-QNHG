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
import { Link } from "react-router-dom";
import SwitchUI from "@components/admin/ui/SwitchUI";

const ROWS_PER_PAGE = 10;
const fullUrl = `http://localhost:8000/storage/`;

const ListDish = ({ paginate = {}, data = [], onDelete, onPageChange, onEdit, onFeatureToggle }) => {
  const currentPage = paginate.page || 1;
  const perPage = paginate.perPage || ROWS_PER_PAGE;
  const totalPages = paginate.totalPage || 1;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && onPageChange) {
      onPageChange(page);
    }
  };

  console.log("Paginate data:", paginate); // Log to verify the structure

  return (
    <>
      <Card>
        <CardBody>
          <Table bordered responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Ảnh</th>
                <th>Tên món ăn</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Đơn vị</th>
                <th>Trạng thái</th>
                <th>Nổi bật</th>
                <th style={{ width: 120 }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-muted">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                data.map((dish, idx) => (
                  <tr key={dish.id}>
                    <td>{(currentPage - 1) * perPage + idx + 1}</td>
                    <td>
                      {dish.image_url ? (
                        <img
                          src={`${fullUrl}${dish.image_url}`}
                          alt={dish.name}
                          style={{ width: 50, height: 50, objectFit: "cover" }}
                        />
                      ) : (
                        <span>Không có ảnh</span>
                      )}
                    </td>
                    <td>{dish.name}</td>
                    <td>{dish.category?.name || "Đang tải..."}</td>
                    <td>
                      <div>
                        <span
                          style={{
                            textDecoration: "line-through",
                            color: "#6c757d",
                            fontSize: "0.9em",
                          }}
                        >
                          {dish.original_price
                            ? `${dish.original_price.toLocaleString()} VNĐ`
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <strong
                          style={{
                            color: "#28a745",
                            fontSize: "1.1em",
                          }}
                        >
                          {dish.selling_price
                            ? `${dish.selling_price.toLocaleString()} VNĐ`
                            : "N/A"}
                        </strong>
                      </div>
                    </td>
                    <td>{dish.unit}</td>
                    <td>
                      {dish.status === "active" ? (
                        <span className="badge bg-success">Đang bán</span>
                      ) : (
                        <span className="badge bg-danger">Ngưng bán</span>
                      )}
                    </td>
                    <td>
                      <SwitchUI
                        id={`featured-${dish.id}`}
                        checked={!!dish.is_featured}
                        onChange={() => {
                          if (onFeatureToggle) {
                            onFeatureToggle(dish.id, !dish.is_featured);
                          }
                        }}
                      />
                    </td>
                    <td>
                      <Link
                        to={`/dish/edit/${dish.id}`}
                        className="btn btn-primary btn-sm me-2"
                        onClick={(e) => {
                          e.preventDefault();
                          if (onEdit) onEdit(dish.id);
                        }}
                      >
                        <MdModeEdit />
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (onDelete) onDelete(dish.id);
                        }}
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

export default ListDish;