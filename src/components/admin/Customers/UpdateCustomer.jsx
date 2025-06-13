import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerForm from '../../../pages/admin/Customers/CustomerForm';
import Breadcrumbs from '@components/admin/ui/Breadcrumb';
import { getCustomerDetail, updateCustomer } from '@services/admin/customerService';
import { Spinner } from 'reactstrap';
import { toast } from 'react-toastify';

const UpdateCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dataCustomer, setDataCustomer] = useState(null);
  const [loadingFetch, setLoadingFetch] = useState(true); // Loading khi fetch dữ liệu
  const [loadingSubmit, setLoadingSubmit] = useState(false); // Loading khi submit form
  const [apiErrors, setApiErrors] = useState({}); // State để lưu trữ lỗi từ API

  useEffect(() => {
    const fetchCustomerData = async () => {
      setLoadingFetch(true);
      setApiErrors({}); // Reset lỗi API khi tải dữ liệu mới
      try {
        const res = await getCustomerDetail(id);
        setDataCustomer(res.data.data.customer); // Điều chỉnh tùy theo cấu trúc API của bạn
      } catch (error) {
        console.error("Error fetching customer:", error);
        toast.error("Không thể tải dữ liệu khách hàng. Vui lòng thử lại.");
      } finally {
        setLoadingFetch(false);
      }
    };

    fetchCustomerData();
  }, [id]);

  const handleUpdateSubmit = async (formData) => {
    const dataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "avatar") {
        if (value instanceof File) {
          dataToSend.append("avatar", value);
        } else if (value === null) {
          dataToSend.append("avatar", ""); // Gửi chuỗi rỗng hoặc null để xóa ảnh trên server
        }
      } else if (key === "password") { // Thêm logic cho password nếu có
        if (value) {
          dataToSend.append(key, value);
        }
      } else {
        dataToSend.append(key, value);
      }
    });

    setLoadingSubmit(true);
    setApiErrors({}); // Reset lỗi API trước khi submit mới
    try {
      await updateCustomer(id, dataToSend);
      toast.success("Cập nhật khách hàng thành công!");
      navigate("/customer");
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      if (error.response && error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;
        const formattedErrors = {};
        for (const key in errors) {
          // Lấy tin nhắn lỗi đầu tiên cho mỗi trường
          formattedErrors[key] = errors[key];
        }
        setApiErrors(formattedErrors); // Lưu lỗi API vào state
        toast.error("Có lỗi xảy ra trong quá trình cập nhật. Vui lòng kiểm tra lại thông tin.");
      } else {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingFetch) {
    return (
      <div className="page-content text-center my-5">
        <Spinner color="primary" />
        <p className="mt-2">Đang tải dữ liệu khách hàng...</p>
      </div>
    );
  }

  if (!dataCustomer) {
    return (
      <div className="page-content text-center my-5">
        <p className="text-danger">Không tìm thấy khách hàng này.</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <Breadcrumbs title="Cập nhật khách hàng" breadcrumbItem="Quản lí khách hàng" />
      <CustomerForm
        initialValues={dataCustomer}
        isEdit={true}
        onSubmit={handleUpdateSubmit}
        loading={loadingSubmit}
        apiErrors={apiErrors} // Truyền lỗi từ API xuống CustomerForm
      />
    </div>
  );
};

export default UpdateCustomer;