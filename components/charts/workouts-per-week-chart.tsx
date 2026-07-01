"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function WorkoutsPerWeekChart({ data }: { data: { week: string; count: number }[] }) {
  const chartData = data.map((d) => ({
    label: new Date(d.week).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    count: d.count,
  }));

  if (chartData.length === 0) {
    return <p className="py-8 text-center text-sm text-pulse-muted">No workouts finished yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData}>
        <defs>
          <linearGradient id="workoutsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} width={24} />
        <Tooltip
          contentStyle={{ background: "#16141f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
          labelStyle={{ color: "#fff" }}
        />
        <Bar dataKey="count" fill="url(#workoutsGradient)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
