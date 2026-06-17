"use client";

import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import type { MetricPoint } from "@/lib/types";

/** Mini gráfico de linha neon usado nos cards de KPI. */
export function MiniLineChart({
  data,
  color = "#B6FF00",
  height = 44,
}: {
  data: MetricPoint[];
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, bottom: 4, left: 0, right: 0 }}>
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
