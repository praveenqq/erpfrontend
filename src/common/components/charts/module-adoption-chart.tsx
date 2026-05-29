"use client";

import ReactECharts from "echarts-for-react";

export interface ModuleAdoptionChartProps {
  data: Record<string, number>;
}

export function ModuleAdoptionChart({ data }: ModuleAdoptionChartProps) {
  const option = {
    tooltip: { trigger: "item" },
    legend: { bottom: 0 },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        data: Object.entries(data).map(([name, value]) => ({ name, value })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 320 }} />;
}
