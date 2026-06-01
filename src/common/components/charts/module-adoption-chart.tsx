"use client";

import ReactECharts from "echarts-for-react";

export interface ModuleAdoptionChartProps {
  data: Record<string, number>;
}

export function ModuleAdoptionChart({ data }: ModuleAdoptionChartProps) {
  const entries = Object.entries(data).filter(([, value]) => value > 0);

  if (entries.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
        No module adoption data is available yet.
      </div>
    );
  }

  const option = {
    tooltip: { trigger: "item" },
    legend: { bottom: 0 },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        data: entries.map(([name, value]) => ({ name, value })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 320 }} />;
}
