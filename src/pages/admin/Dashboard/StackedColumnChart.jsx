import React from "react";
import PropTypes from "prop-types";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "@components/admin/ui/ChartsDynamicColor";

const StackedColumnChart = ({ dataColors, periodData }) => {
  const stackedColumnChartColors = getChartColorsArray(dataColors);
  const options = {
    chart: {
      stacked: !0,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: !0,
      },
    },
    plotOptions: {
      bar: {
        horizontal: !1,
        columnWidth: "15%",
        // endingShape: "rounded"
      },
    },
    dataLabels: {
      enabled: !1,
    },
    xaxis: {
      show: true,
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
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
        series={[...periodData]}
        type="bar"
        height="359"
        className="apex-charts"
      />
    </React.Fragment>
  );
};

StackedColumnChart.propTypes = {
  periodData: PropTypes.any,
};
export default StackedColumnChart;
