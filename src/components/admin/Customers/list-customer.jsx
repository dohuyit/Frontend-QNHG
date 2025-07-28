import React, { useState, useEffect } from "react";
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
import DeleteModal from "@components/admin/ui/DeleteModal";
import {
  getProvinceNameById,
  getDistrictNameById,
  getWardNameById,
} from "@helpers/admin/administrative";
import { Link } from "react-router-dom";

const ROWS_PER_PAGE = 10;
const fullUrl = `http://localhost:8000/storage/`;

const ListCustomer = ({ paginate = {}, data = [], onDelete, onPageChange }) => {
  const [showDelete, setShowDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [locationMap, setLocationMap] = useState({});

  const currentPage = paginate.page || 1;
  const totalPages = paginate.totalPage || 1;

  useEffect(() => {
    const fetchLocations = async () => {
      const newMap = {};
      for (const customer of data) {
        const province = await getProvinceNameById(customer.city_id);
        const district = await getDistrictNameById(customer.district_id);
        const ward = await getWardNameById(customer.ward_id);
        newMap[customer.id] = { province, district, ward };
      }
      setLocationMap(newMap);
    };

    fetchLocations();
  }, [data]);

  const handleDelete = () => {
    if (onDelete && selectedId !== null) {
      onDelete(selectedId);
    }
    setShowDelete(false);
    setSelectedId(null);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && onPageChange) {
      onPageChange(page);
    }
  };

  // 🔽 Tạo danh sách số trang hiển thị giới hạn 3 số
  const getVisiblePages = () => {
    const delta = 1;
    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, currentPage + delta);

    if (currentPage === 1) {
      end = Math.min(3, totalPages);
    } else if (currentPage === totalPages) {
      start = Math.max(1, totalPages - 2);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
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
                <th>Tên khách hàng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Khu vực</th>
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
                  data.map((customer, idx) => {
                    const location = locationMap[customer.id] || {};
                    return (
                        <tr key={customer.id}>
                          <td>{(currentPage - 1) * (paginate.perPage || ROWS_PER_PAGE) + idx + 1}</td>
                          <td>
                            <img
                                src={`${fullUrl}${customer.avatar}`}
                                alt="Ảnh khách hàng"
                                style={{ width: 50, height: 50, objectFit: 'cover' }}
                            />
                          </td>
                          <td>{customer.full_name}</td>
                          <td>{customer.email}</td>
                          <td>{customer.phone_number}</td>
                          <td>
                            <p><strong>Thành phố:</strong> {location.province || "Đang tải..."}</p>
                            <p><strong>Quận/Huyện:</strong> {location.district || "Đang tải..."}</p>
                            <p><strong>Phường/Xã:</strong> {location.ward || "Đang tải..."}</p>
                          </td>
                          <td>
                            <Link
                                to={`/customer/edit/${customer.id}`}
                                className="btn btn-primary btn-sm me-2"
                            >
                              <MdModeEdit />
                            </Link>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => {
                                  setSelectedId(customer.id);
                                  setShowDelete(true);
                                }}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                    );
                  })
              )}
              </tbody>
            </Table>
          </CardBody>

          {totalPages > 1 && (
              <CardBody className="d-flex justify-content-end">
                <Pagination aria-label="pagination">
                  <PaginationItem disabled={currentPage === 1}>
                    <PaginationLink onClick={() => handlePageChange(1)}>
                      &laquo;
                    </PaginationLink>
                  </PaginationItem>

                  {getVisiblePages().map((page) => (
                      <PaginationItem active={currentPage === page} key={page}>
                        <PaginationLink onClick={() => handlePageChange(page)}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                  ))}

                  <PaginationItem disabled={currentPage === totalPages}>
                    <PaginationLink onClick={() => handlePageChange(totalPages)}>
                      &raquo;
                    </PaginationLink>
                  </PaginationItem>
                </Pagination>
              </CardBody>
          )}
        </Card>

        <DeleteModal
            show={showDelete}
            onDeleteClick={handleDelete}
            onCloseClick={() => setShowDelete(false)}
        />
      </>
  );
};

export default ListCustomer;
