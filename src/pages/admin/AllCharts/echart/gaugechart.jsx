import React from "react";
import ReactEcharts from "echarts-for-react";
import getChartColorsArray from "@components/admin/ui/ChartsDynamicColor";

const Guage = ({ dataColors }) => {
  const guageEChartColors = getChartColorsArray(dataColors);

  const options = {
    tooltip: {
      formatter: "{a} <br/>{b} : {c}%",
    },
    color: guageEChartColors,
    toolbox: {
      feature: {
        restore: {},
        saveAsImage: {},
      },
    },
    series: [
      {
        name: "Business indicator",
        type: "gauge",
        detail: { formatter: "{value}%" },
        axisLine: {
          lineStyle: {
            color: [
              [0.2, "#34c38f"],
              [0.8, "#556ee6"],
              [1, "#f46a6a"],
            ],
            width: 20,
          },
        },
        data: [{ value: 50, name: "Completion rate" }],
      },
    ],
  };
  return (
    <React.Fragment>
      <ReactEcharts style={{ height: "350px" }} option={options} />
    </React.Fragment>
  );
};

export default Guage;
