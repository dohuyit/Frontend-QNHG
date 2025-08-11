import React from "react";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";
import "./CustomPaginate.scss";

const CustomPaginate = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  // Hiển thị tối đa 5 trang, có ... nếu nhiều hơn
  const getPages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={`custom-paginate d-flex justify-content-center my-3 ${className}`}>
      <Pagination>
        <PaginationItem disabled={currentPage === 1}>
          <PaginationLink previous onClick={() => onPageChange(currentPage - 1)} />
        </PaginationItem>
        {getPages().map((page, idx) =>
          page === "..." ? (
            <PaginationItem key={idx} disabled>
              <PaginationLink>...</PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={page} active={currentPage === page}>
              <PaginationLink onClick={() => onPageChange(page)}>
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem disabled={currentPage === totalPages}>
          <PaginationLink next onClick={() => onPageChange(currentPage + 1)} />
        </PaginationItem>
      </Pagination>
    </div>
  );
};

export default CustomPaginate;