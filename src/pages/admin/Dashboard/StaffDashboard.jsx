import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, Badge, Spinner, Table } from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import { getStaffDashboard } from "@services/admin/dashboardService";
import ReactApexChart from "react-apexcharts";

// TODO: Kết nối API thật cho số liệu nhân viên phục vụ
export default function StaffDashboard() {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        active_tables: 0,
        reservations: { pending: 0, confirmed: 0, cancelled: 0, completed: 0, no_show: 0, seated: 0 },
        ready_count: 0,
    });
    const [serveQueue, setServeQueue] = useState([]); // Danh sách món sẵn sàng
    const [alerts, setAlerts] = useState([]);
    const [topDishes, setTopDishes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await getStaffDashboard();
                const data = res?.data?.data || {};
                // Log payload để đối chiếu mapping backend-frontend
                // eslint-disable-next-line no-console
                console.log("[StaffDashboard] payload:", data);
                const reservationCounts = data.reservation_status_counts || {};
                const queue = Array.isArray(data.serve_queue) ? data.serve_queue : [];
                const _alerts = Array.isArray(data.alerts) ? data.alerts : [];
                const tops = Array.isArray(data.top_dishes) ? data.top_dishes : [];

                setStats({
                    active_tables: data.active_tables_count || 0,
                    reservations: {
                        pending: reservationCounts.pending || 0,
                        confirmed: reservationCounts.confirmed || 0,
                        cancelled: reservationCounts.cancelled || 0,
                        completed: reservationCounts.completed || 0,
                        no_show: reservationCounts.no_show || 0,
                        seated: reservationCounts.seated || 0,
                    },
                    ready_count: queue.length,
                });
                setServeQueue(queue);
                setAlerts(_alerts);
                setTopDishes(tops);
            } catch (e) {
                console.error("Lỗi tải dữ liệu dashboard nhân viên:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Chart configs
    const donutSeries = [
        stats.reservations.pending || 0,
        stats.reservations.confirmed || 0,
        stats.reservations.seated || 0,
        stats.reservations.completed || 0,
        stats.reservations.cancelled || 0,
        stats.reservations.no_show || 0,
    ];
    const donutOptions = {
        labels: ["Chờ", "Xác nhận", "Đang ngồi", "Hoàn tất", "Hủy", "No-show"],
        colors: ["#f7b84b", "#556ee6", "#50a5f1", "#34c38f", "#f46a6a", "#74788d"],
        legend: { position: "bottom" },
        dataLabels: { enabled: true },
    };

    const barSeries = [
        {
            name: "Số lượng",
            data: (topDishes || []).map((d) => d.total_quantity ?? d.quantity ?? 0),
        },
    ];
    const barOptions = {
        chart: { toolbar: { show: false } },
        xaxis: {
            categories: (topDishes || []).map((d) => d.name ?? d.dish_name ?? ""),
            labels: { rotate: -15 },
        },
        colors: ["#556ee6"],
        plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
        dataLabels: { enabled: false },
    };

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Dashboard" breadcrumbItem="Nhân viên phục vụ" />

                {loading ? (
                    <div className="text-center py-5"><Spinner color="primary" /></div>
                ) : (
                    <>
                        <Row className="mb-4">
                            <Col md={4}>
                                <Card className="border border-info"><CardBody className="text-center">
                                    <div className="text-muted mb-1">Bàn đang hoạt động</div>
                                    <h4 className="text-info">🧍‍♂️ {stats.active_tables}</h4>
                                </CardBody></Card>
                            </Col>
                            <Col md={4}>
                                <Card className="border border-primary"><CardBody className="text-center">
                                    <div className="text-muted mb-1">Đặt bàn (chờ/xác nhận)</div>
                                    <h6 className="mb-0 text-primary">⏳ {stats.reservations.pending} • ✅ {stats.reservations.confirmed}</h6>
                                </CardBody></Card>
                            </Col>
                            <Col md={4}>
                                <Card className="border border-success"><CardBody className="text-center">
                                    <div className="text-muted mb-1">Món sẵn sàng</div>
                                    <h4 className="text-success">🍽️ {stats.ready_count}</h4>
                                </CardBody></Card>
                            </Col>
                        </Row>

                        {/* Biểu đồ trạng thái đặt bàn và Top món */}
                        <Row className="mb-4">
                            <Col lg={6} className="mb-4 mb-lg-0">
                                <Card className="h-100"><CardBody>
                                    <h5 className="mb-3">Tỉ lệ trạng thái đặt bàn</h5>
                                    <ReactApexChart options={donutOptions} series={donutSeries} type="donut" height={260} />
                                </CardBody></Card>
                            </Col>
                            <Col lg={6}>
                                <Card className="h-100"><CardBody>
                                    <h5 className="mb-3">Top món gọi nhiều</h5>
                                    {topDishes.length === 0 ? (
                                        <div className="text-muted text-center py-3">Chưa có dữ liệu</div>
                                    ) : (
                                        <ReactApexChart options={barOptions} series={barSeries} type="bar" height={260} />
                                    )}
                                </CardBody></Card>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6} className="mb-4">
                                <Card className="border border-warning"><CardBody>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5 className="mb-0">Món sẵn sàng để phục vụ</h5>
                                        <Badge color="success">{serveQueue.length}</Badge>
                                    </div>
                                    <Table responsive size="sm" className="mb-0">
                                        <thead><tr><th>#</th><th>Bàn</th><th>Món</th><th>Mã đơn</th></tr></thead>
                                        <tbody>
                                            {serveQueue.length === 0 ? (
                                                <tr><td colSpan="4" className="text-center text-muted py-3">Chưa có món sẵn sàng</td></tr>
                                            ) : serveQueue.map((it, idx) => (
                                                <tr key={it.id}>
                                                    <td>{idx + 1}</td>
                                                    <td>{Array.isArray(it.table_numbers) ? it.table_numbers.join(', ') : ''}</td>
                                                    <td>{it.item_name || it.combo_name}</td>
                                                    <td>{it.order_code ? `#${it.order_code}` : ''}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </CardBody></Card>
                            </Col>

                            <Col md={6} className="mb-4">
                                <Card className="border border-primary"><CardBody>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5 className="mb-0">Top món gọi nhiều</h5>
                                        <Badge color="primary">{topDishes.length}</Badge>
                                    </div>
                                    {/* Đã có biểu đồ ở trên, tránh trùng lặp bảng chi tiết */}
                                    <div className="text-muted small">Xem biểu đồ "Top món gọi nhiều" ở khung bên trái.</div>
                                </CardBody></Card>
                            </Col>

                            <Col md={12} className="mb-4">
                                <Card className="border border-danger"><CardBody>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5 className="mb-0">Cảnh báo (Đơn hủy / No-show)</h5>
                                        <Badge color="danger">{alerts.length}</Badge>
                                    </div>
                                    <Table responsive size="sm" className="mb-0">
                                        <thead><tr><th>#</th><th>Loại</th><th>Bàn</th><th>Ghi chú</th></tr></thead>
                                        <tbody>
                                            {alerts.length === 0 ? (
                                                <tr><td colSpan="4" className="text-center text-muted py-3">Không có cảnh báo</td></tr>
                                            ) : alerts.map((it, idx) => (
                                                <tr key={idx}>
                                                    <td>{idx + 1}</td>
                                                    <td>{it.type === 'no-show' ? 'No-show' : 'Đã hủy'}</td>
                                                    <td>{it.table || '-'}</td>
                                                    <td>{it.note || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </CardBody></Card>
                            </Col>
                        </Row>

                        {/* Optional: biểu đồ hiệu suất phục vụ */}
                    </>
                )}
            </Container>
        </div>
    );
}
