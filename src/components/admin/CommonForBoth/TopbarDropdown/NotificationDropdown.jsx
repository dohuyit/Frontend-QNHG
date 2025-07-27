import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Dropdown, DropdownToggle, DropdownMenu, Row, Col, Badge } from "reactstrap";
import SimpleBar from "simplebar-react";
import Pusher from "pusher-js";
import axios from "axios";

import { withTranslation } from "react-i18next";

const NotificationDropdown = (props) => {
  // Declare a new state variable, which we'll call "menu"
  const [menu, setMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Lấy danh sách notification từ API
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/api/admin/notifications/list?limit=10");
        if (res.data && res.data.data) {
          const notis = res.data.data.map(n => ({
            id: n.id,
            type: n.type,
            title: getTitleByType(n.type),
            message: n.message,
            customer_name: n.customer_name,
            customer_phone: n.customer_phone,
            reservation_date: n.reservation_date,
            reservation_time: n.reservation_time,
            number_of_guests: n.number_of_guests,
            old_status: n.old_status,
            new_status: n.new_status,
            order_code: n.order_code,
            table_number: n.table_number,
            dish_name: n.dish_name,
            item_name: n.item_name,
            bill_id: n.bill_id,
            timestamp: new Date(n.created_at),
            unread: !n.read_at,
          }));
          setNotifications(notis);
          setUnreadCount(notis.filter(n => n.unread).length);
        }
      } catch {/* ignore */}
    };
    fetchNotifications();

    // Khởi tạo Pusher
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
      encrypted: true,
    });

    // Subscribe to public channel reservations
    const channel = pusher.subscribe('reservations');
    // Subscribe to public channel orders
    const orderChannel = pusher.subscribe('orders');
    // Subscribe to kitchen-orders
    const kitchenOrderChannel = pusher.subscribe('kitchen-orders');
    // Subscribe to tables
    const tableChannel = pusher.subscribe('tables');

    // Khi có notification realtime thì gọi lại API để đồng bộ
    const refreshOnEvent = () => {
      fetchNotifications();
    };
    channel.bind('reservation.created', refreshOnEvent);
    channel.bind('reservation.status.updated', refreshOnEvent);
    orderChannel.bind('order.created', refreshOnEvent);
    orderChannel.bind('order.updated', refreshOnEvent);
    kitchenOrderChannel.bind('orderitem.updated', refreshOnEvent);
    tableChannel.bind('table.status.updated', refreshOnEvent);

    // Cleanup
    return () => {
      channel.unbind_all();
      pusher.unsubscribe('reservations');
      orderChannel.unbind_all();
      pusher.unsubscribe('orders');
      kitchenOrderChannel.unbind_all();
      pusher.unsubscribe('kitchen-orders');
      tableChannel.unbind_all();
      pusher.unsubscribe('tables');
      pusher.disconnect();
    };
  }, []);

  const markAsRead = async () => {
    try {
      await axios.post("/api/admin/notifications/mark-all-read");
      setNotifications(prev => prev.map(notif => ({ ...notif, unread: false })));
      setUnreadCount(0);
    } catch {/* ignore */}
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reservation_created':
        return 'bx bx-calendar-plus';
      case 'reservation_status_updated':
        return 'bx bx-refresh';
      case 'order_created':
        return 'bx bx-receipt';
      case 'order_updated':
        return 'bx bx-edit';
      case 'orderitem_updated':
        return 'bx bx-food-menu';
      case 'table_status_updated':
        return 'bx bx-table';
      default:
        return 'bx bx-bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'reservation_created':
        return 'primary';
      case 'reservation_status_updated':
        return 'success';
      case 'order_created':
        return 'warning';
      case 'order_updated':
        return 'info';
      case 'orderitem_updated':
        return 'warning';
      case 'table_status_updated':
        return 'primary';
      default:
        return 'info';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const getTitleByType = (type) => {
    switch (type) {
      case 'reservation':
      case 'reservation_created':
        return 'Đơn đặt bàn mới';
      case 'reservation_status_updated':
        return 'Cập nhật trạng thái đơn đặt bàn';
      case 'order':
      case 'order_created':
        return 'Đơn hàng mới';
      case 'order_updated':
        return 'Cập nhật đơn hàng';
      case 'orderitem_updated':
        return 'Cập nhật món ăn';
      case 'table_status_updated':
        return 'Cập nhật trạng thái bàn';
      default:
        return 'Thông báo';
    }
  };

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => {
          setMenu(!menu);
          if (!menu) {
            markAsRead();
          }
        }}
        className="dropdown d-inline-block"
        tag="li"
      >
        <DropdownToggle
          className="btn header-item noti-icon position-relative"
          tag="button"
          id="page-header-notifications-dropdown"
        >
          <i className="bx bx-bell bx-tada" />
          {unreadCount > 0 && (
            <span className="badge bg-danger rounded-pill">{unreadCount}</span>
          )}
        </DropdownToggle>

        <DropdownMenu className="dropdown-menu dropdown-menu-lg p-0 dropdown-menu-end">
          <div className="p-3">
            <Row className="align-items-center">
              <Col>
                <h6 className="m-0"> {props.t("Notifications")} </h6>
              </Col>
              <div className="col-auto">
                <a href="#" className="small">
                  {" "}
                  View All
                </a>
              </div>
            </Row>
          </div>

          <SimpleBar style={{ height: "230px" }}>
            {notifications.length === 0 ? (
              <div className="text-center py-4">
                <i className="bx bx-bell font-size-24 text-muted"></i>
                <p className="text-muted mt-2 mb-0">Không có thông báo mới</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Link to="/admin/reservations" className="text-reset notification-item" key={notification.id}>
                  <div className="d-flex">
                    <div className="avatar-xs me-3">
                      <span className={`avatar-title bg-${getNotificationColor(notification.type)} rounded-circle font-size-16`}>
                        <i className={getNotificationIcon(notification.type)} />
                      </span>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mt-0 mb-1">
                        {notification.title}
                        {notification.unread && (
                          <Badge color="danger" size="sm" className="ms-2">Mới</Badge>
                        )}
                      </h6>
                      <div className="font-size-12 text-muted">
                        <p className="mb-1">{notification.message}</p>
                        {/* Hiển thị chi tiết hơn cho từng loại */}
                        {notification.type === 'reservation' || notification.type === 'reservation_created' ? (
                          <>
                            {notification.customer_name && (
                              <p className="mb-1"><strong>Khách hàng:</strong> {notification.customer_name}{notification.customer_phone && ` (${notification.customer_phone})`}</p>
                            )}
                            {notification.reservation_date && (
                              <p className="mb-1"><strong>Ngày đặt:</strong> {new Date(notification.reservation_date).toLocaleDateString('vi-VN')}{notification.reservation_time && ` - ${notification.reservation_time}`}</p>
                            )}
                            {notification.number_of_guests && (
                              <p className="mb-1"><strong>Số khách:</strong> {notification.number_of_guests} người</p>
                            )}
                          </>
                        ) : null}
                        {notification.type === 'reservation_status_updated' ? (
                          <>
                            {notification.customer_name && (
                              <p className="mb-1"><strong>Khách hàng:</strong> {notification.customer_name}</p>
                            )}
                            {notification.old_status && notification.new_status && (
                              <p className="mb-1"><strong>Trạng thái:</strong> {notification.old_status} → {notification.new_status}</p>
                            )}
                          </>
                        ) : null}
                        {notification.type === 'order' || notification.type === 'order_created' ? (
                          <>
                            {notification.order_code && (
                              <p className="mb-1"><strong>Mã đơn hàng:</strong> {notification.order_code}</p>
                            )}
                          </>
                        ) : null}
                        {notification.type === 'order_updated' ? (
                          <>
                            {notification.order_code && (
                              <p className="mb-1"><strong>Mã đơn hàng:</strong> {notification.order_code}</p>
                            )}
                            {notification.new_status && (
                              <p className="mb-1"><strong>Trạng thái mới:</strong> {notification.new_status}</p>
                            )}
                          </>
                        ) : null}
                        {notification.type === 'orderitem_updated' ? (
                          <>
                            {notification.item_name && (
                              <p className="mb-1"><strong>Món:</strong> {notification.item_name}</p>
                            )}
                            {notification.order_id && (
                              <p className="mb-1"><strong>Đơn hàng:</strong> #{notification.order_id}</p>
                            )}
                            {notification.new_status && (
                              <p className="mb-1"><strong>Trạng thái mới:</strong> {notification.new_status}</p>
                            )}
                          </>
                        ) : null}
                        {notification.type === 'table_status_updated' ? (
                          <>
                            {notification.table_number && (
                              <p className="mb-1"><strong>Bàn số:</strong> {notification.table_number}</p>
                            )}
                            {notification.new_status && (
                              <p className="mb-1"><strong>Trạng thái mới:</strong> {notification.new_status}</p>
                            )}
                          </>
                        ) : null}
                        <p className="mb-0">
                          <i className="mdi mdi-clock-outline" />
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </SimpleBar>
          <div className="p-2 border-top d-grid">
            <Link
              className="btn btn-sm btn-link font-size-14 btn-block text-center"
              to="/admin/reservations"
            >
              <i className="mdi mdi-arrow-right-circle me-1"></i>{" "}
              {props.t("View all")} {" "}
            </Link>
          </div>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default withTranslation()(NotificationDropdown);

NotificationDropdown.propTypes = {
  t: PropTypes.any,
};
