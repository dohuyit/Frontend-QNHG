import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, Badge, Spinner, Table, Button, Input, Label } from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import { getStaffDashboard, getOrderRevenueStats, getReservationTimeStats } from "@services/admin/dashboardService";
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
    // Filter serve queue
    const [statusFilter, setStatusFilter] = useState("ready"); // pending|preparing|ready|cancelled
    const [limit] = useState(10);
    const [loadingQueue, setLoadingQueue] = useState(false);
    // Doanh thu
    const [revMode, setRevMode] = useState("last30"); // last30 | month | year
    const [revenue, setRevenue] = useState({ labels: [], data: [] });
    const [loadingRevenue, setLoadingRevenue] = useState(false);
    // Sparkline đặt bàn 7 ngày
    const [resvSpark, setResvSpark] = useState({ labels: [], data: [], delta: 0 });

    // Style dùng lại cho 3 KPI để đồng đều chiều cao
    const kpiCardStyle = { minHeight: 140 };

    // Fetch tổng (chạy 1 lần khi mở trang)
    useEffect(() => {
        const initialFetch = async () => {
            try {
                setLoading(true);
                const res = await getStaffDashboard({ status: statusFilter, limit });
                const data = res?.data?.data || {};
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
        initialFetch();
        // không kèm interval ở đây để tránh reload toàn trang
        // interval dành riêng cho serve_queue bên dưới
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Hàm chỉ lấy serve_queue + cập nhật ready_count
    const fetchServeQueue = async () => {
        try {
            setLoadingQueue(true);
            const res = await getStaffDashboard({ status: statusFilter, limit });
            const data = res?.data?.data || {};
            const queue = Array.isArray(data.serve_queue) ? data.serve_queue : [];
            setServeQueue(queue);
            setStats((prev) => ({ ...prev, ready_count: queue.length }));
        } catch (e) {
            console.error('Lỗi cập nhật hàng đợi phục vụ:', e);
        } finally {
            setLoadingQueue(false);
        }
    };

    // Auto-refresh chỉ cho serve_queue mỗi 15s
    useEffect(() => {
        const timer = setInterval(fetchServeQueue, 15000);
        return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, limit]);

    // Khi đổi statusFilter/limit: fetch serve_queue ngay, không chạm loading toàn trang
    useEffect(() => {
        fetchServeQueue();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, limit]);

    // Helpers thời gian
    const formatYMD = (d) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    // Fetch doanh thu theo chế độ
    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                setLoadingRevenue(true);
                let start_date, end_date, group_by;
                const today = new Date();

                if (revMode === 'last30') {
                    const start = new Date(today);
                    start.setDate(start.getDate() - 29);
                    start_date = formatYMD(start);
                    end_date = formatYMD(today);
                    group_by = 'day';
                } else if (revMode === 'month') {
                    // 12 tháng gần nhất tính đến tháng hiện tại
                    const start = new Date(today.getFullYear(), today.getMonth() - 11, 1);
                    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    start_date = formatYMD(start);
                    end_date = formatYMD(end);
                    group_by = 'month';
                } else {
                    // 5 năm gần nhất tính đến năm hiện tại
                    const start = new Date(today.getFullYear() - 4, 0, 1);
                    const end = new Date(today.getFullYear(), 11, 31);
                    start_date = formatYMD(start);
                    end_date = formatYMD(end);
                    group_by = 'year';
                }

                const res = await getOrderRevenueStats({ start_date, end_date, group_by });
                const items = Array.isArray(res?.data?.data) ? res.data.data : [];
                setRevenue({
                    labels: items.map((i) => i.time),
                    data: items.map((i) => i.revenue ?? 0),
                });
            } catch (err) {
                console.error('Lỗi lấy thống kê doanh thu:', err);
                setRevenue({ labels: [], data: [] });
            } finally {
                setLoadingRevenue(false);
            }
        };
        fetchRevenue();
    }, [revMode]);

    // Sparkline 7 ngày gần nhất cho KPI đặt bàn
    useEffect(() => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(start.getDate() - 6);
        const start_date = formatYMD(start);
        const end_date = formatYMD(today);
        getReservationTimeStats({ start_date, end_date, group_by: 'day' })
            .then((res) => {
                const arr = Array.isArray(res?.data?.data) ? res.data.data : [];
                const labels = arr.map(i => i.time);
                const data = arr.map(i => (i?.count ?? i?.total ?? 0));
                // delta = (hôm nay - hôm qua) / hôm qua
                const n = data.length;
                let delta = 0;
                if (n >= 2 && data[n-2] > 0) delta = ((data[n-1] - data[n-2]) / data[n-2]) * 100;
                setResvSpark({ labels, data, delta });
            })
            .catch((e) => console.error('Lỗi lấy sparkline đặt bàn:', e));
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
    const totalTop = (topDishes || []).reduce((s, d) => s + (d.total_quantity ?? d.quantity ?? 0), 0) || 0;
    const barOptions = {
        chart: { toolbar: { show: false } },
        xaxis: {
            categories: (topDishes || []).map((d) => d.name ?? d.dish_name ?? ""),
            labels: { rotate: -15 },
        },
        colors: ["#556ee6"],
        plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
        dataLabels: {
            enabled: true,
            formatter: (val) => {
                if (!totalTop) return val;
                const pct = Math.round((val / totalTop) * 100);
                return `${val} (${pct}%)`;
            },
            style: { colors: ['#333'] }
        },
    };

    // Line chart doanh thu
    const revenueSeries = [{ name: "Doanh thu", data: revenue.data }];
    const revenueOptions = {
        chart: { toolbar: { show: false } },
        stroke: { curve: 'smooth', width: 3 },
        xaxis: { categories: revenue.labels },
        yaxis: { labels: { formatter: (v) => v.toLocaleString('vi-VN') } },
        dataLabels: { enabled: false },
        colors: ['#34c38f'],
        tooltip: { y: { formatter: (v) => `${(v || 0).toLocaleString('vi-VN')} đ` } },
    };

    return (
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Dashboard" breadcrumbItem="Nhân viên phục vụ" />

          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          ) : (
            <>
              {/* Top row: KPI */}
              <Row className="mb-4">
                <Col md={4}>
                  <Card className="border border-info h-100">
                    <CardBody
                      className="text-center d-flex flex-column justify-content-between"
                      style={kpiCardStyle}
                    >
                      <div className="fw-semibold text-uppercase text-muted">
                        Bàn đang hoạt động
                      </div>
                      <div className="display-6 fw-bold text-info mb-2">
                        {stats.active_tables}
                      </div>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="border border-primary h-100">
                    <CardBody
                      className="text-center d-flex flex-column justify-content-between"
                      style={kpiCardStyle}
                    >
                      <div className="fw-semibold text-uppercase text-muted">
                        Đặt bàn (chờ/xác nhận)
                      </div>
                      <div>
                        <div className="h5 mb-2 text-primary fw-bold">
                          {stats.reservations.pending} •{" "}
                          {stats.reservations.confirmed}
                        </div>
                        <ReactApexChart
                          type="area"
                          height={60}
                          series={[{ name: "7 ngày", data: resvSpark.data }]}
                          options={{
                            chart: { sparkline: { enabled: true } },
                            stroke: { curve: "smooth", width: 2 },
                            colors: ["#50a5f1"],
                            tooltip: { enabled: true },
                          }}
                        />
                        <div className="small text-muted mt-1">
                          {resvSpark.delta >= 0 ? "▲" : "▼"}{" "}
                          {Math.abs(resvSpark.delta).toFixed(1)}% so với hôm qua
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="border border-success h-100">
                    <CardBody
                      className="text-center d-flex flex-column justify-content-between"
                      style={kpiCardStyle}
                    >
                      <div className="fw-semibold text-uppercase text-muted">
                        Món sẵn sàng
                      </div>
                      <div className="display-6 fw-bold text-success mb-2">
                        {stats.ready_count}
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              {/* Middle row: Donut + Top items */}
              <Row className="mb-4">
                <Col lg={8} className="mb-4 mb-lg-0">
                  <Card className="h-100">
                    <CardBody>
                      <h5 className="mb-3">Tỉ lệ trạng thái đặt bàn</h5>
                      <ReactApexChart
                        options={donutOptions}
                        series={donutSeries}
                        type="donut"
                        height={260}
                      />
                      <div className="d-flex flex-wrap gap-2 justify-content-center mt-2 small text-muted">
                        <span>
                          Chờ: <b>{stats.reservations.pending}</b>
                        </span>
                        <span>
                          Xác nhận: <b>{stats.reservations.confirmed}</b>
                        </span>
                        <span>
                          Đang ngồi: <b>{stats.reservations.seated}</b>
                        </span>
                        <span>
                          Hoàn tất: <b>{stats.reservations.completed}</b>
                        </span>
                        <span>
                          Hủy: <b>{stats.reservations.cancelled}</b>
                        </span>
                        <span>
                          No-show: <b>{stats.reservations.no_show}</b>
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg={4}>
                  <Card className="h-100">
                    <CardBody>
                      <h5 className="mb-3">Top món gọi nhiều</h5>
                      {topDishes.length === 0 ? (
                        <div className="text-muted text-center py-3">
                          Chưa có dữ liệu
                        </div>
                      ) : (
                        <ReactApexChart
                          options={barOptions}
                          series={barSeries}
                          type="bar"
                          height={260}
                        />
                      )}
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              {/* Lower row: Revenue (2/3) + Serve queue (1/3) */}
              <Row>
                <Col lg={8} className="order-lg-1 mb-4">
                  <Card className="border border-success h-100">
                    <CardBody>
                      <div className="d-flex flex-wrap justify-content-between align-items-center mb-2">
                        <h5 className="mb-2 mb-sm-0">Doanh thu</h5>
                        <div className="btn-group">
                          <Button
                            color={
                              revMode === "last30" ? "success" : "secondary"
                            }
                            size="sm"
                            onClick={() => setRevMode("last30")}
                          >
                            30 ngày
                          </Button>
                          <Button
                            color={
                              revMode === "month" ? "success" : "secondary"
                            }
                            size="sm"
                            onClick={() => setRevMode("month")}
                          >
                            Tháng
                          </Button>
                          <Button
                            color={revMode === "year" ? "success" : "secondary"}
                            size="sm"
                            onClick={() => setRevMode("year")}
                          >
                            Năm
                          </Button>
                        </div>
                      </div>
                      {loadingRevenue ? (
                        <div className="text-center py-3">
                          <Spinner color="success" />
                        </div>
                      ) : revenue.data.length === 0 ? (
                        <div className="text-muted text-center py-3">
                          Chưa có dữ liệu
                        </div>
                      ) : (
                        <ReactApexChart
                          options={revenueOptions}
                          series={revenueSeries}
                          type="area"
                          height={300}
                        />
                      )}
                    </CardBody>
                  </Card>
                </Col>
                <Col lg={4} className="order-lg-2 mb-4">
                  <Card className="border border-warning h-100">
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">Món sẵn sàng để phục vụ</h5>
                        <Badge color="success">{serveQueue.length}</Badge>
                      </div>
                      <Row className="g-2 mb-2">
                        <Col xs={7}>
                          <Label className="form-label mb-1">Trạng thái</Label>
                          <Input
                            type="select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                          >
                            <option value="pending">Chờ</option>
                            <option value="preparing">Đang chế biến</option>
                            <option value="ready">Sẵn sàng</option>
                            <option value="cancelled">Đã hủy</option>
                          </Input>
                        </Col>
                        <Col
                          xs={5}
                          className="d-flex align-items-end justify-content-end"
                        >
                          {loadingQueue ? (
                            <div className="text-muted small d-flex align-items-center gap-1">
                              <Spinner size="sm" color="warning" /> Đang cập
                              nhật…
                            </div>
                          ) : (
                            <div className="text-muted small">
                              Tự động cập nhật mỗi 15s
                            </div>
                          )}
                        </Col>
                      </Row>
                      <Table responsive size="sm" className="mb-0">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Bàn</th>
                            <th>Món</th>
                            <th>Đơn</th>
                          </tr>
                        </thead>
                        <tbody>
                          {serveQueue.length === 0 ? (
                            <tr>
                              <td
                                colSpan="4"
                                className="text-center text-muted py-3"
                              >
                                Không có dữ liệu
                              </td>
                            </tr>
                          ) : (
                            serveQueue.map((it, idx) => (
                              <tr key={it.id}>
                                <td>{idx + 1}</td>
                                <td>
                                  {Array.isArray(it.table_numbers)
                                    ? it.table_numbers.join(", ")
                                    : ""}
                                </td>
                                <td>{it.item_name || it.combo_name}</td>
                                <td>
                                  {it.order_code ? `#${it.order_code}` : ""}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              {/* Alerts */}
            </>
          )}
        </Container>
      </div>
    );
}
