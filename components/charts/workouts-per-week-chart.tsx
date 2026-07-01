"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function WorkoutsPerWeekChart({ data }: { data: { week: string; count: number }[] }) {
  const chartData = data.map((d) => ({
    label: new Date(d.week).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    count: d.count,
  }));

  if (chartData.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">Finish your first workout to see this chart.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} barCategoryGap="35%">
        <XAxis
          dataKey="label"
          stroke="transparent"
          tick={{ fill: "#9a9a9a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          allowDecimals={false}
          stroke="transparent"
          tick={{ fill: "#5c5c5c", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={20}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
          contentStyle={{
            background: "#1e1e1e",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            fontSize: 12,
          }}
          labelStyle={{ color: "#f5f5f5", fontWeight: 600 }}
          itemStyle={{ color: "#9a9a9a" }}
          formatter={(value) => [`${value} workout${value === 1 ? "" : "s"}`, null]}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={28}>
          {chartData.map((_, i) => (
            <Cell key={i} fill="#ffffff" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
