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
import { getTrashedCategory, deleteForceCategory, restoreCategory } from "@services/admin/categoryService";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ROWS_PER_PAGE = 10;
const fullUrl = "http://localhost:8000/storage/";

const ListTrashCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: ROWS_PER_PAGE,
    total: 0,
    last_page: 1,
  });

  const fetchTrashedCategories = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: ROWS_PER_PAGE,
      };

      const res = await getTrashedCategory(params);
      const items = res.data?.data?.items;
      if (Array.isArray(items)) {
        setCategories(items);
        setMeta({
          current_page: res.data.data.meta?.current_page || 1,
          per_page: res.data.data.meta?.per_page || ROWS_PER_PAGE,
          total: res.data.data.meta?.total || 0,
          last_page: res.data.data.meta?.last_page || 1,
        });
      } else {
        console.error("API response structure is incorrect:", res.data);
        setCategories([]);
        toast.error("Lỗi khi tải danh sách danh mục trong thùng rác!");
      }
    } catch (error) {
      console.error("Error fetching trashed categories:", error.response || error);
      setCategories([]);
      setMeta({
        current_page: 1,
        per_page: ROWS_PER_PAGE,
        total: 0,
        last_page: 1,
      });
      toast.error("Lỗi khi tải danh sách danh mục trong thùng rác!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashedCategories(meta.current_page);
  }, [meta.current_page]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= meta.last_page) {
      setMeta((prev) => ({ ...prev, current_page: pageNumber }));
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreCategory(id);
      toast.success("Khôi phục danh mục thành công!");
      fetchTrashedCategories(meta.current_page);
    } catch (error) {
      console.error("Error restoring category:", error.response || error);
      toast.error("Lỗi khi khôi phục danh mục!");
    }
  };

  const handlePermanentDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xóa vĩnh viễn danh mục?",
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
        await deleteForceCategory(id);
        toast.success("Xóa vĩnh viễn danh mục thành công!");
        fetchTrashedCategories(meta.current_page);
      } catch (error) {
        console.error("Error permanently deleting category:", error.response || error);
        toast.error("Lỗi khi xóa vĩnh viễn danh mục!");
      }
    }
  };

  return (
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
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>Danh mục cha</th>
                <th>Trạng thái</th>
                <th style={{ width: 120 }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                categories.map((category, idx) => (
                  <tr key={category.id}>
                    <td>{(meta.current_page - 1) * meta.per_page + idx + 1}</td>
                    <td>
                      {category.image_url ? (
                        <img
                          src={`${fullUrl}${category.image_url}`}
                          alt={category.name}
                          style={{ width: 50, height: 50, objectFit: "cover" }}
                          onError={(e) => { e.target.src = "/images/placeholder.jpg"; }}
                        />
                      ) : (
                        <span>Không có ảnh</span>
                      )}
                    </td>
                    <td>{category.name}</td>
                    <td>{category.description || "N/A"}</td>
                    <td>{category.parent?.name || "Không có"}</td>
                    <td>
                      {category.is_active ? (
                        <span className="badge bg-success">Hoạt động</span>
                      ) : (
                        <span className="badge bg-danger">Không hoạt động</span>
                      )}
                    </td>
                    <td>
                      <Link
                        to={`/category/restore/${category.id}`}
                        className="btn btn-success btn-sm me-2"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRestore(category.id);
                        }}
                      >
                        <FaUndo />
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handlePermanentDelete(category.id)}
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
  );
};

export default ListTrashCategory;