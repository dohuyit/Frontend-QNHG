import React, { useState } from "react";
import {
  Card,
  CardBody,
  Pagination,
  PaginationItem,
  PaginationLink,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Button,
  Alert,
  Badge,
} from "reactstrap";
import { toast } from "react-toastify";
import { MdPrint } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import OrderCard from "./card-order";
import PrintableReceipt from "./printable-receipt";
import { updateOrder } from "@services/admin/orderService";
import "./grid-order.css";
import OrderDetailModal from "./OrderDetailModal";

const OrderGrid = ({ data = [], onDelete, onUpdate, onEdit }) => {
  const [showDelete, setShowDelete] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [printableOrder, setPrintableOrder] = useState(null);

  const handleDelete = async () => {
    try {
      // Implement delete order logic
      toast.success("Đã xóa đơn hàng thành công");
      if (onDelete) onDelete(selectedItem.id);
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Không thể xóa đơn hàng");
    }
    setShowDelete(false);
    setSelectedItem(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const payload = {
        status: newStatus,
      };

      await updateOrder(id, payload);
      toast.success("Đã cập nhật trạng thái thành công");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật trạng thái"
      );
    }
  };

  const handlePrint = (order) => {
    setPrintableOrder(order);
  };

  const openViewModal = (item) => {
    setSelectedItem(item);
    setShowView(true);
  };

  const handleCardDelete = (item) => {
    setSelectedItem(item);
    setShowDelete(true);
  };

  return (
    <>
      <PrintableReceipt
        order={printableOrder}
        onPrinted={() => setPrintableOrder(null)}
      />

      {/* Grid Layout */}
      <div className="order-grid">
        {data.length === 0 ? (
          <Alert color="info" className="text-center">
            Không có đơn hàng nào
          </Alert>
        ) : (
          <Row className="g-4">
            {data.map((order) => (
              <Col key={order.id} xs={12} sm={6} md={4} lg={3} xl={3}>
                <OrderCard
                  order={order}
                  onEdit={() => onEdit(order)}
                  onView={openViewModal}
                  onDelete={handleCardDelete}
                  onStatusChange={handleStatusChange}
                />
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Modal Xóa */}
      <Modal isOpen={showDelete} toggle={() => setShowDelete(false)}>
        <ModalHeader toggle={() => setShowDelete(false)}>
          Xác nhận xóa
        </ModalHeader>
        <ModalBody>
          Bạn có chắc chắn muốn xóa đơn hàng{" "}
          <strong>#{selectedItem?.order_code || selectedItem?.id}</strong>{" "}
          không?
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowDelete(false)}>
            Hủy
          </Button>
          <Button color="danger" onClick={handleDelete}>
            Xóa
          </Button>
        </ModalFooter>
      </Modal>
      <OrderDetailModal
        isOpen={showView}
        toggle={() => setShowView(false)}
        order={selectedItem}
        onPrint={handlePrint}
      />
    </>
  );
};

export default OrderGrid;
