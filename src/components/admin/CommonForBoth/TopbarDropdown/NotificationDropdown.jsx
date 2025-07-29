import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Dropdown, DropdownToggle, DropdownMenu, Row, Col, Badge } from "reactstrap";
import SimpleBar from "simplebar-react";
import Pusher from "pusher-js";

import { withTranslation } from "react-i18next";
import { getNotificationList, markAllNotificationsRead } from "../../../../services/admin/notificationService";

const NotificationDropdown = (props) => {
  const [menu, setMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Refs để tránh memory leak
  const pusherRef = useRef(null);
  const channelsRef = useRef({});
  const isMountedRef = useRef(true);

  // Function fetch notifications (không cần useCallback)
  const fetchNotifications = async () => {
    if (loading || !isMountedRef.current) return;

    try {
      setLoading(true);
      const res = await getNotificationList({ limit: 10 });

      if (res?.data?.data && isMountedRef.current) {
        const notis = res.data.data.map(n => ({
          id: n.id,
          type: n.type,
          title: getTitleByType(n.type),
          message: n.message || '',
          customer_name: n.customer_name,
          customer_phone: n.customer_phone,
          reservation_date: n.reservation_date,
          reservation_time: n.reservation_time,
          number_of_guests: n.number_of_guests,
          old_status: n.old_status,
          new_status: n.new_status,
          order_code: n.order_code,
          order_id: n.order_id,
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
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Đánh dấu component đã mount
    isMountedRef.current = true;

    // Fetch notifications lần đầu
    fetchNotifications();

    // Setup Pusher chỉ nếu có config
    if (import.meta.env.VITE_PUSHER_APP_KEY && import.meta.env.VITE_PUSHER_APP_CLUSTER) {
      try {
        // Cleanup pusher cũ nếu có
        if (pusherRef.current) {
          pusherRef.current.disconnect();
        }

        // Khởi tạo Pusher mới
        pusherRef.current = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
          cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
          encrypted: true,
          enabledTransports: ['ws', 'wss'],
        });

        // Subscribe to channels
        const channelNames = ['reservations', 'orders', 'kitchen-orders', 'tables'];
        channelNames.forEach(channelName => {
          channelsRef.current[channelName] = pusherRef.current.subscribe(channelName);
        });

        // Event handler wrapper để tránh gọi khi component unmount
        const safeRefreshOnEvent = () => {
          if (isMountedRef.current) {
            fetchNotifications();
          }
        };

        // Bind events
        const events = [
          { channel: 'reservations', event: 'reservation.created' },
          { channel: 'reservations', event: 'reservation.status.updated' },
          { channel: 'orders', event: 'order.created' },
          { channel: 'orders', event: 'order.updated' },
          { channel: 'kitchen-orders', event: 'orderitem.updated' },
          { channel: 'tables', event: 'table.status.updated' }
        ];

        events.forEach(({ channel, event }) => {
          if (channelsRef.current[channel]) {
            channelsRef.current[channel].bind(event, safeRefreshOnEvent);
          }
        });

      } catch (error) {
        console.error('Error initializing Pusher:', error);
      }
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;

      try {
        // Unbind tất cả events và unsubscribe channels
        Object.entries(channelsRef.current).forEach(([channelName, channel]) => {
          if (channel) {
            channel.unbind_all();
            if (pusherRef.current) {
              pusherRef.current.unsubscribe(channelName);
            }
          }
        });

        // Disconnect pusher
        if (pusherRef.current) {
          pusherRef.current.disconnect();
          pusherRef.current = null;
        }

        // Clear channels ref
        channelsRef.current = {};

      } catch (error) {
        console.error('Error cleaning up Pusher:', error);
      }
    };
  }, []); // Empty dependency array - chỉ chạy 1 lần

  const markAsRead = async () => {
    try {
      await markAllNotificationsRead();
      if (isMountedRef.current) {
        setNotifications(prev => prev.map(notif => ({ ...notif, unread: false })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleDropdownToggle = () => {
    const newMenuState = !menu;
    setMenu(newMenuState);

    // Mark as read when opening dropdown
    if (newMenuState && unreadCount > 0) {
      markAsRead();
    }
  };

  // Helper functions (không thay đổi)
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
      case 'kitchen':
      case 'kitchen_order':
        return 'Đơn bếp';
      case 'table_status_updated':
        return 'Cập nhật trạng thái bàn';
      case 'bill':
        return 'Hóa đơn';
      case 'system':
        return 'Thông báo hệ thống';
      default:
        return 'Thông báo';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reservation_created':
      case 'reservation':
        return 'bx bx-calendar-plus';
      case 'reservation_status_updated':
        return 'bx bx-calendar-check';
      case 'order_created':
      case 'order':
        return 'bx bx-cart-alt';
      case 'order_updated':
        return 'bx bx-cart';
      case 'orderitem_updated':
        return 'bx bx-food-menu';
      case 'kitchen':
      case 'kitchen_order':
        return 'bx bx-restaurant';
      case 'table_status_updated':
        return 'bx bx-table';
      case 'bill':
        return 'bx bx-receipt';
      case 'system':
        return 'bx bx-cog';
      default:
        return 'bx bx-bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'reservation_created':
      case 'reservation':
      case 'reservation_status_updated':
        return 'primary';
      case 'order_created':
      case 'order':
        return 'success';
      case 'order_updated':
        return 'info';
      case 'orderitem_updated':
        return 'warning';
      case 'kitchen':
      case 'kitchen_order':
        return 'warning';
      case 'table_status_updated':
        return 'primary';
      case 'bill':
        return 'danger';
      case 'system':
        return 'secondary';
      default:
        return 'info';
    }
  };

  const getNotificationLink = (type) => {
    switch (type) {
      case 'reservation_created':
      case 'reservation':
      case 'reservation_status_updated':
        return '/reservations';
      case 'order_created':
      case 'order':
      case 'order_updated':
        return '/orders';
      case 'kitchen':
      case 'kitchen_order':
      case 'orderitem_updated':
        return '/kitchen-orders';
      case 'table_status_updated':
        return '/tables';
      case 'bill':
        return '/bills';
      case 'system':
        return '/admin/dashboard';
      default:
        return '#';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp || !(timestamp instanceof Date)) {
      return 'Không xác định';
    }

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

  const renderNotificationDetails = (notification) => {
    const { type } = notification;

    switch (type) {
      case 'reservation':
      case 'reservation_created':
        return (
          <>
            {notification.customer_name && (
              <p className="mb-1">
                <strong>Khách hàng:</strong> {notification.customer_name}
                {notification.customer_phone && ` (${notification.customer_phone})`}
              </p>
            )}
            {notification.reservation_date && (
              <p className="mb-1">
                <strong>Ngày đặt:</strong> {new Date(notification.reservation_date).toLocaleDateString('vi-VN')}
                {notification.reservation_time && ` - ${notification.reservation_time}`}
              </p>
            )}
            {notification.number_of_guests && (
              <p className="mb-1"><strong>Số khách:</strong> {notification.number_of_guests} người</p>
            )}
          </>
        );

      case 'reservation_status_updated':
        return (
          <>
            {notification.customer_name && (
              <p className="mb-1"><strong>Khách hàng:</strong> {notification.customer_name}</p>
            )}
            {notification.old_status && notification.new_status && (
              <p className="mb-1"><strong>Trạng thái:</strong> {notification.old_status} → {notification.new_status}</p>
            )}
          </>
        );

      case 'order':
      case 'order_created':
      case 'order_updated':
        return (
          <>
            {notification.order_code && (
              <p className="mb-1"><strong>Mã đơn hàng:</strong> {notification.order_code}</p>
            )}
            {notification.new_status && type === 'order_updated' && (
              <p className="mb-1"><strong>Trạng thái mới:</strong> {notification.new_status}</p>
            )}
          </>
        );

      case 'kitchen':
      case 'kitchen_order':
      case 'orderitem_updated':
        return (
          <>
            {notification.item_name && (
              <p className="mb-1"><strong>Món:</strong> {notification.item_name}</p>
            )}
            {notification.order_id && (
              <p className="mb-1"><strong>Đơn hàng:</strong> #{notification.order_id}</p>
            )}
            {notification.new_status && type === 'orderitem_updated' && (
              <p className="mb-1"><strong>Trạng thái mới:</strong> {notification.new_status}</p>
            )}
          </>
        );

      case 'table_status_updated':
        return (
          <>
            {notification.table_number && (
              <p className="mb-1"><strong>Bàn số:</strong> {notification.table_number}</p>
            )}
            {notification.new_status && (
              <p className="mb-1"><strong>Trạng thái mới:</strong> {notification.new_status}</p>
            )}
          </>
        );

      case 'bill':
        return (
          <>
            {notification.bill_id && (
              <p className="mb-1"><strong>Mã hóa đơn:</strong> #{notification.bill_id}</p>
            )}
            {notification.order_id && (
              <p className="mb-1"><strong>Đơn hàng:</strong> #{notification.order_id}</p>
            )}
          </>
        );

      case 'system':
        return (
          <>
            <p className="mb-1"><strong>Thông báo hệ thống</strong></p>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={handleDropdownToggle}
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
                <h6 className="m-0">{props.t("Notifications")}</h6>
              </Col>
              <div className="col-auto">
                <Link to="/reservations" className="small">
                  View All
                </Link>
              </div>
            </Row>
          </div>

          <SimpleBar style={{ height: "230px" }}>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="text-muted mt-2 mb-0">Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-4">
                <i className="bx bx-bell font-size-24 text-muted"></i>
                <p className="text-muted mt-2 mb-0">Không có thông báo mới</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const linkTo = getNotificationLink(notification.type);
                return (
                  <Link
                    to={linkTo}
                    className="text-reset notification-item d-block"
                    style={{ minHeight: '80px' }}
                    key={notification.id}
                  >
                    <div className="d-flex" style={{ marginTop: '10px' }}>
                      <div className="avatar-xs me-3" style={{ marginTop: '15px' }}>
                        <span className={`avatar-title bg-${getNotificationColor(notification.type)} rounded-circle font-size-20`} style={{ 
                          width: '30px', 
                          height: '30px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          <i className={getNotificationIcon(notification.type)} style={{ fontSize: '20px' }} />
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
                          {notification.message && (
                            <p className="mb-1">{notification.message}</p>
                          )}

                          {renderNotificationDetails(notification)}

                          <p className="mb-0">
                            <i className="mdi mdi-clock-outline me-1" />
                            {formatTimeAgo(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </SimpleBar>

          <div className="p-2 border-top d-grid">
            <Link
              className="btn btn-sm btn-link font-size-14 btn-block text-center"
              to="/admin/reservations"
            >
              <i className="mdi mdi-arrow-right-circle me-1"></i>
              {props.t("View all")}
            </Link>
          </div>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

NotificationDropdown.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation()(NotificationDropdown);