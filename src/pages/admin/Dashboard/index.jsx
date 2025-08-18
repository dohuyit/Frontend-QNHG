import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { Link } from "react-router-dom";
import classNames from "classnames";

import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import StackedColumnChart from "./StackedColumnChart";

import {
  getReservationStatusStats,
  getReservationTimeStats,
  getOrderRevenueStats,
} from "@services/admin/dashboardService";

const Dashboard = ({ t = (key) => key })  => {
  // Modal State
  const [modal, setModal] = useState(false);

  // Data state
  const [reservationStatusStats, setReservationStatusStats] = useState({});
  const [reservationTimeStats, setReservationTimeStats] = useState([]);
  const [orderRevenueStats, setOrderRevenueStats] = useState([]);
  const [periodType, setPeriodType] = useState("Year");

  useEffect(() => {
    fetchAllStats(periodType);
  }, [periodType]);
  const fetchAllStats = async (period) => {
    try {
      const resStatus = await getReservationStatusStats();
      setReservationStatusStats(resStatus.data.data || {});

      const resTime = await getReservationTimeStats({ periodType: period });
      setReservationTimeStats(resTime.data.data || []);

      const resRevenue = await getOrderRevenueStats({ periodType: period });
      setOrderRevenueStats(resRevenue.data.data || []);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };




  // Tổng đơn đặt bàn tính từ reservationTimeStats (sum count)
  const totalOrders = reservationTimeStats.reduce(
      (acc, cur) => acc + (cur.count || 0),
      0
  );

  // Tổng doanh thu tính từ orderRevenueStats (sum revenue)
  const totalRevenue = orderRevenueStats.reduce(
      (acc, cur) => acc + (cur.revenue || 0),
      0
  );

  // Giá trung bình
  const averagePrice = totalOrders ? (totalRevenue / totalOrders).toFixed(2) : 0;

  // Dữ liệu báo cáo tổng quan
  const reports = [
    {
      title: t("Đơn đặt bàn"),
      iconClass: "bx-copy-alt",
      description: totalOrders.toLocaleString(),
      color: "primary",
    },
    {
      title: t("Doanh thu"),
      iconClass: "bx-archive-in",
      description: `$${totalRevenue.toFixed(2)}`,
      color: "success",
    },
    {
      title: t("Giá trung bình"),
      iconClass: "bx-purchase-tag-alt",
      description: `$${averagePrice}`,
      color: "warning",
    },
  ];

  // Merge dữ liệu thời gian để biểu đồ stacked column
  // Các ngày có thể không trùng nhau, nên lấy tất cả ngày
  const allDates = new Set([
    ...reservationTimeStats.map((r) => r.time),
    ...orderRevenueStats.map((r) => r.time),
  ]);

  const chartDataFormatted = Array.from(allDates)
      .sort()
      .map((date) => {
        const revenueObj = orderRevenueStats.find((r) => r.time === date);
        const reservationObj = reservationTimeStats.find((r) => r.time === date);
        return {
          name: date,
          bookings: reservationObj ? reservationObj.count : 0,
          revenue: revenueObj ? revenueObj.revenue : 0,
        };
      });
  console.log("periodType:", periodType);
  console.log("reservationTimeStats:", reservationTimeStats);
  console.log("orderRevenueStats:", orderRevenueStats);
  console.log("chartDataFormatted:", chartDataFormatted);
  const statusColorMap = {
    cancelled: "danger",
    confirmed: "success",
    pending: "warning",
    completed: "info",
  };

  const statusLabelMap = {
    cancelled: "Đã hủy",
    confirmed: "Đã xác nhận",
    pending: "Đang chờ",
    completed: "Hoàn tất",
  };

  return (
      <>
        <div className="page-content">
          <Container fluid>
            {/* Breadcrumb */}
            <Breadcrumbs title={t("Dashboard")} breadcrumbItem={t("Tổng quan")} />

            {/* Báo cáo tổng quan */}
            <Row className="mb-4">
              {reports.map(({ title, iconClass, description, color }, i) => (
                  <Col md={4} key={i}>
                    <Card className={`mini-stats-wid border border-${color}`}>
                      <CardBody>
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <p className="text-muted fw-medium mb-1">{title}</p>
                            <h4 className={`mb-0 text-${color}`}>{description}</h4>
                          </div>
                          <div
                              className={`avatar-sm rounded-circle bg-${color} align-self-center mini-stat-icon`}
                          >
                        <span className={`avatar-title rounded-circle bg-${color}`}>
                          <i className={`bx ${iconClass} font-size-24`} />
                        </span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
              ))}
            </Row>

            {/* Thống kê trạng thái đặt bàn */}
            <Row className="mb-4">
              {Object.entries(reservationStatusStats).map(([status, count]) => (
                  <Col md={3} key={status}>
                    <Card className={`mini-stats-wid border border-${statusColorMap[status] || "secondary"}`}>
                      <CardBody className="text-center">
                        <p className="text-muted fw-medium">{statusLabelMap[status] || status}</p>
                        <h4 className={`text-${statusColorMap[status] || "secondary"}`}>{count}</h4>
                      </CardBody>
                    </Card>
                  </Col>
              ))}
            </Row>

            {/* Biểu đồ đặt bàn và doanh thu theo thời gian */}
            <Row className="mb-4">
              <Col xl={12}>
                <Card>
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4 className="card-title mb-0">{t("Xu hướng đặt bàn & doanh thu")}</h4>
                      <ul className="nav nav-pills">
                        {["Week", "Month", "Year"].map((p) => (
                            <li className="nav-item" key={p}>
                              <Link
                                  to="#"
                                  className={classNames({ active: periodType === p }, "nav-link")}
                                  onClick={() => setPeriodType(p)}
                              >
                                {p}
                              </Link>
                            </li>
                        ))}
                      </ul>
                    </div>
                    <StackedColumnChart
                        periodData={chartDataFormatted}
                        dataColors={["--bs-primary", "--bs-success"]}
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>

        {/* Modal nếu cần */}
        <Modal
            isOpen={modal}
            toggle={() => setModal(!modal)}
            centered
            size="lg"
        >
          <ModalHeader toggle={() => setModal(!modal)}>{t("Chi tiết đơn đặt bàn")}</ModalHeader>
          <ModalBody>
            <p>{t("Thông tin chi tiết đơn đặt bàn sẽ hiển thị ở đây.")}</p>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setModal(false)}>
              {t("Đóng")}
            </Button>
          </ModalFooter>
        </Modal>
      </>
  );
};

Dashboard.propTypes = {
  t: PropTypes.func.isRequired,
};

export default React.memo(Dashboard);
