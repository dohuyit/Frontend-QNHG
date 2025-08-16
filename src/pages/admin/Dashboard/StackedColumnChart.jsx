import React from "react";
import PropTypes from "prop-types";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "@components/admin/ui/ChartsDynamicColor";

const StackedColumnChart = ({ dataColors, periodData }) => {
  const stackedColumnChartColors = getChartColorsArray(dataColors);

  // Tạo series theo định dạng ApexCharts
  const series = [
    {
      name: "Bookings",
      data: periodData.map((item) => item.bookings),
    },
    {
      name: "Revenue",
      data: periodData.map((item) => item.revenue),
    },
  ];

  // categories lấy từ periodData
  const categories = periodData.map((item) => item.name);

  const options = {
    chart: {
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: true,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "15%",
        // endingShape: "rounded"
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      labels: {
        show: true,
      },
    },
    colors: stackedColumnChartColors,
    legend: {
      position: "bottom",
    },
    fill: {
      opacity: 1,
    },
  };

  return (
      <React.Fragment>
        <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height="359"
            className="apex-charts"
        />
      </React.Fragment>
  );
};

StackedColumnChart.propTypes = {
  periodData: PropTypes.array.isRequired,
  dataColors: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
};

export default StackedColumnChart;
