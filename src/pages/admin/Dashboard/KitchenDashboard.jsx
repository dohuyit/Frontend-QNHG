import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, Badge, Spinner, Table, Input, Label, Button } from "reactstrap";
import Breadcrumbs from "@components/admin/ui/Breadcrumb";
import { getKitchenDashboard } from "@services/admin/dashboardService";
import ReactApexChart from "react-apexcharts";

// TODO: Kết nối API thật cho số liệu bếp
export default function KitchenDashboard() {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        counts: { pending: 0, preparing: 0, ready: 0 },
        high_priority_count: 0,
        ready_count: 0,
    });
    const [priorityItems, setPriorityItems] = useState([]);
    const [readyItems, setReadyItems] = useState([]);
    const [topDishes, setTopDishes] = useState([]);
    const [timeCounts, setTimeCounts] = useState({ on_time: null, late: null });
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [inited, setInited] = useState(false);
    const [rangeError, setRangeError] = useState("");

    const formatYMD = (d) => {
        const pad = (n) => String(n).padStart(2, '0');
        const y = d.getFullYear();
        const m = pad(d.getMonth() + 1);
        const da = pad(d.getDate());
        return `${y}-${m}-${da}`;
    };

    // Khởi tạo khoảng ngày từ query string hoặc mặc định: hôm nay
    useEffect(() => {
        const qs = new URLSearchParams(window.location.search);
        const qFrom = qs.get('date_from');
        const qTo = qs.get('date_to');
        const today = formatYMD(new Date());
        setDateFrom(qFrom || today);
        setDateTo(qTo || today);
        setInited(true);
    }, []);

    const fetchDashboard = async (params = {}) => {
        try {
            setLoading(true);
            const res = await getKitchenDashboard(params);
            const data = res?.data?.data || {};
            // Log payload để đối chiếu mapping backend-frontend
            // eslint-disable-next-line no-console
            console.log("[KitchenDashboard] payload:", data);
            const counts = data.order_status_counts || {};
            const priority = Array.isArray(data.priority_items) ? data.priority_items : [];
            const ready = Array.isArray(data.ready_items) ? data.ready_items : [];
            const tops = Array.isArray(data.top_dishes) ? data.top_dishes : [];

            setStats({
                counts: {
                    pending: counts.pending || 0,
                    preparing: counts.preparing || 0,
                    ready: counts.ready || 0,
                },
                high_priority_count: priority.length,
                ready_count: ready.length,
            });
            setPriorityItems(priority);
            setReadyItems(ready);
            setTopDishes(tops);
            // Lấy số liệu đúng giờ/trễ giờ từ BE nếu có
            setTimeCounts({
                on_time: typeof data.on_time_count === 'number' ? data.on_time_count : null,
                late: typeof data.late_count === 'number' ? data.late_count : null,
            });
        } catch (e) {
            console.error("Lỗi tải dữ liệu dashboard bếp:", e);
        } finally {
            setLoading(false);
        }
    };

    // Đồng bộ URL khi thay đổi khoảng ngày và tự fetch số liệu
    useEffect(() => {
        if (!inited) return;
        // Validate khoảng ngày
        if (dateFrom && dateTo && dateFrom > dateTo) {
            setRangeError("Khoảng ngày không hợp lệ: 'Từ ngày' phải nhỏ hơn hoặc bằng 'Đến ngày'");
            return;
        }
        setRangeError("");
        const url = new URL(window.location.href);
        if (dateFrom) url.searchParams.set('date_from', dateFrom);
        if (dateTo) url.searchParams.set('date_to', dateTo);
        window.history.replaceState({}, '', url);
        fetchDashboard({ date_from: dateFrom, date_to: dateTo });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateFrom, dateTo, inited]);

    // Chart configs
    const donutSeries = [
        stats.counts.pending || 0,
        stats.counts.preparing || 0,
        stats.counts.ready || 0,
    ];
    const donutOptions = {
        labels: ["Chờ", "Đang chế biến", "Sẵn sàng"],
        // High-contrast colors
        colors: ["#F59E0B", "#2563EB", "#16A34A"], // amber-500, blue-600, green-600
        legend: {
            position: "bottom",
            markers: { width: 12, height: 12, radius: 12 },
        },
        dataLabels: {
            enabled: true,
            style: { fontWeight: 700, colors: ["#ffffff"] },
            dropShadow: { enabled: false },
        },
        stroke: { width: 4, colors: ['#ffffff'] },
        fill: { type: 'solid', opacity: 0.95 },
        plotOptions: { pie: { donut: { size: '70%' } } },
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
        colors: ["#2563EB"], // blue-600
        plotOptions: { bar: { horizontal: true, borderRadius: 6 } },
        dataLabels: { enabled: false },
        grid: { strokeDashArray: 3, borderColor: '#eceff3' },
        tooltip: {
            y: { formatter: (v) => `${v} lần gọi` },
        },
    };

    // Tính toán tỷ lệ hoàn thành đúng giờ vs trễ giờ từ danh sách readyItems
    const onTimeLateStats = React.useMemo(() => {
        let onTime = 0;
        let late = 0;
        let considered = 0;
        (readyItems || []).forEach((it) => {
            const cookingMin = typeof it.cooking_time === 'number' ? it.cooking_time : (it?.cooking_time ? parseInt(it.cooking_time, 10) : null);
            if (!cookingMin || Number.isNaN(cookingMin)) return;
            // Fallback: nếu thiếu mốc thời gian, dùng created_at/updated_at của kitchen_order
            const startStr = it.received_at || it.created_at;
            const doneStr = it.completed_at || it.updated_at;
            if (!startStr || !doneStr) return;
            const start = new Date(startStr);
            const done = new Date(doneStr);
            if (Number.isNaN(start.getTime()) || Number.isNaN(done.getTime())) return;
            const diffMin = Math.max(0, Math.round((done - start) / 60000));
            if (diffMin <= cookingMin) onTime += 1; else late += 1;
            considered += 1;
        });
        return { onTime, late, considered };
    }, [readyItems]);

    // Ưu tiên số liệu từ BE nếu tổng > 0; nếu BE = 0 thì fallback sang số liệu FE (considered > 0)
    const beOn = typeof timeCounts.on_time === 'number' ? timeCounts.on_time : null;
    const beLate = typeof timeCounts.late === 'number' ? timeCounts.late : null;
    const beTotal = (beOn ?? 0) + (beLate ?? 0);
    const feTotal = (onTimeLateStats?.onTime ?? 0) + (onTimeLateStats?.late ?? 0);
    const useBE = beTotal > 0;
    const useFE = !useBE && feTotal > 0;
    const provisional = !useBE && !useFE && (stats?.counts?.ready ?? 0) > 0;
    const finalOnTime = useBE
      ? beOn
      : useFE
      ? onTimeLateStats.onTime
      : (provisional ? (stats.counts.ready || 0) : 0);
    const finalLate = useBE
      ? beLate
      : useFE
      ? onTimeLateStats.late
      : (provisional ? 0 : 0);
    const timeDonutSeries = [finalOnTime, finalLate];
    const timeDonutOptions = {
        labels: ["Đúng giờ", "Trễ giờ"],
        colors: ["#10B981", "#EF4444"], // emerald-500, red-500
        legend: { position: "bottom", markers: { width: 12, height: 12, radius: 12 } },
        dataLabels: { enabled: true, style: { fontWeight: 700, colors: ["#ffffff"] }, dropShadow: { enabled: false } },
        stroke: { width: 4, colors: ['#ffffff'] },
        fill: { type: 'solid', opacity: 0.95 },
        plotOptions: { pie: { donut: { size: '70%' } } },
        tooltip: {
            y: {
                formatter: (val) => `${val} đơn`,
            },
        },
    };

    return (
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Dashboard" breadcrumbItem="Bếp" />

          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          ) : (
            <>
              <Row className="mb-3">
                <Col md={4}>
                  <Card className="shadow-sm border border-warning">
                    <CardBody className="text-center">
                      <div className="text-muted mb-1">Chờ</div>
                      <h4 className="text-dark">{stats.counts.pending}</h4>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="shadow-sm border border-info">
                    <CardBody className="text-center">
                      <div className="text-muted mb-1">Đang chế biến</div>
                      <h4 className="text-dark">{stats.counts.preparing}</h4>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="shadow-sm border border-success">
                    <CardBody className="text-center">
                      <div className="text-muted mb-1">Sẵn sàng</div>
                      <h4 className="text-dark">{stats.counts.ready}</h4>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              {/* Bộ lọc ngày + preset nhanh */}
              <Row className="mb-3 align-items-end">
                <Col md={3} sm={6} className="mb-2">
                  <Label className="form-label">Từ ngày</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </Col>
                <Col md={3} sm={6} className="mb-2">
                  <Label className="form-label">Đến ngày</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </Col>
                <Col md={3} sm={6} className="d-flex align-items-end mb-2">
                  <Button
                    color="secondary"
                    onClick={() => {
                      const t = formatYMD(new Date());
                      setDateFrom(t);
                      setDateTo(t);
                    }}
                  >
                    Hôm nay
                  </Button>
                </Col>
              </Row>
              {/* Biểu đồ trạng thái và Top món */}
              <Row className="mb-4">
                <Col lg={6} className="mb-4 mb-lg-0">
                  <Card className="h-100">
                    <CardBody>
                      <h5 className="mb-3">Tỉ lệ trạng thái món bếp</h5>
                      <ReactApexChart
                        options={donutOptions}
                        series={donutSeries}
                        type="donut"
                        height={260}
                      />
                    </CardBody>
                  </Card>
                </Col>
                <Col lg={6}>
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

              <Row className="mb-4">
                <Col md={12}>
                  <Card className="h-100 border border-success">
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">
                          Tỉ lệ đơn hoàn thành đúng giờ vs trễ giờ
                        </h5>
                        <Badge color={finalLate > 0 ? "danger" : "success"}>
                          Tổng {finalOnTime + finalLate} đơn
                        </Badge>
                      </div>
                      {finalOnTime + finalLate === 0 ? (
                        <div className="text-muted text-center py-3">
                          Chưa có dữ liệu
                        </div>
                      ) : (
                        <ReactApexChart
                          options={timeDonutOptions}
                          series={timeDonutSeries}
                          type="donut"
                          height={280}
                        />
                      )}
                      <div className="text-muted small mt-2">
                        {
                          "• Đúng giờ: thời gian thực tế ≤ thời gian chế biến tiêu chuẩn. • Trễ giờ: thời gian thực tế > tiêu chuẩn."
                        }
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Container>
      </div>
    );
}
