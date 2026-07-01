"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function PointsOverTimeChart({ data }: { data: { day: string; points: number }[] }) {
  const chartData = data.map((d) => ({
    label: new Date(d.day).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    points: d.points,
  }));

  if (chartData.length === 0) {
    return <p className="py-8 text-center text-sm text-pulse-muted">No points earned yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} width={24} />
        <Tooltip
          contentStyle={{ background: "#16141f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
          labelStyle={{ color: "#fff" }}
        />
        <Area type="monotone" dataKey="points" stroke="#ec4899" strokeWidth={2} fill="url(#pointsGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
