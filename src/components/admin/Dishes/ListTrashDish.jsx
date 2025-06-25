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
import { Link } from "react-router-dom";
import { getTrashedDish, deleteForceDish, restoreDish } from "@services/admin/dishService";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ROWS_PER_PAGE = 10;
const fullUrl = "http://localhost:8000/storage/";

const ListTrashDish = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: ROWS_PER_PAGE,
    total: 0,
    last_page: 1,
  });

  const fetchTrashedDishes = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: ROWS_PER_PAGE,
      };

      const res = await getTrashedDish(params);
      const items = res.data?.data?.items;
      if (Array.isArray(items)) {
        setDishes(items);
        setMeta({
          current_page: res.data.data.meta?.current_page || 1,
          per_page: res.data.data.meta?.per_page || ROWS_PER_PAGE,
          total: res.data.data.meta?.total || 0,
          last_page: res.data.data.meta?.last_page || 1,
        });
      } else {
        console.error("API response structure is incorrect:", res.data);
        setDishes([]);
        toast.error("Lỗi khi tải danh sách món ăn trong thùng rác!");
      }
    } catch (error) {
      console.error("Error fetching trashed dishes:", error.response || error);
      setDishes([]);
      setMeta({
        current_page: 1,
        per_page: ROWS_PER_PAGE,
        total: 0,
        last_page: 1,
      });
      toast.error("Lỗi khi tải danh sách món ăn trong thùng rác!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashedDishes(meta.current_page);
  }, [meta.current_page]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= meta.last_page) {
      setMeta((prev) => ({ ...prev, current_page: pageNumber }));
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreDish(id);
      toast.success("Khôi phục món ăn thành công!");
      fetchTrashedDishes(meta.current_page);
    } catch (error) {
      console.error("Error restoring dish:", error.response || error);
      toast.error("Lỗi khi khôi phục món ăn!");
    }
  };

  const handlePermanentDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xóa vĩnh viễn món ăn?",
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
        await deleteForceDish(id);
        toast.success("Xóa vĩnh viễn món ăn thành công!");
        fetchTrashedDishes(meta.current_page);
      } catch (error) {
        console.error("Error permanently deleting dish:", error.response || error);
        toast.error("Lỗi khi xóa vĩnh viễn món ăn!");
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
                  <th>Tên món ăn</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Đơn vị</th>
                  <th>Trạng thái</th>
                  <th style={{ width: 120 }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {dishes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  dishes.map((dish, idx) => (
                    <tr key={dish.id}>
                      <td>{(meta.current_page - 1) * meta.per_page + idx + 1}</td>
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
                        <Link
                          to={`/dish/restore/${dish.id}`}
                          className="btn btn-success btn-sm me-2"
                          onClick={(e) => {
                            e.preventDefault();
                            handleRestore(dish.id);
                          }}
                        >
                          <FaUndo />
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handlePermanentDelete(dish.id)}
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

export default ListTrashDish;