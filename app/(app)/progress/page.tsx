"use client";

import { useEffect, useState } from "react";
import { NeonCard } from "@/components/ui/neon-card";
import { BadgeChip } from "@/components/ui/badge-chip";
import { WorkoutsPerWeekChart } from "@/components/charts/workouts-per-week-chart";
import { PointsOverTimeChart } from "@/components/charts/points-over-time-chart";
import { WaterGoalsChart } from "@/components/charts/water-goals-chart";
import { StreakHistoryChart } from "@/components/charts/streak-history-chart";

interface StatsData {
  totals: { totalPoints: number; totalWorkouts: number; longestStreak: number; currentStreak: number };
  workoutsPerWeek: { week: string; count: number }[];
  pointsOverTime: { day: string; points: number }[];
  waterGoalsPerWeek: { week: string; count: number }[];
  activityDays: string[];
  badges: { id: string; key: string; name: string; description: string; icon: string }[];
}

export default function ProgressPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError("Couldn't load your stats. Check your connection."));
  }, []);

  if (error) return <p className="text-center text-sm text-red-400">{error}</p>;
  if (!data) return <p className="text-center text-sm text-pulse-muted">Loading your progress…</p>;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        <StatTile value={data.totals.totalWorkouts} label="Workouts" />
        <StatTile value={data.totals.totalPoints} label="Points" />
        <StatTile value={data.totals.longestStreak} label="Best Streak" />
      </div>

      <NeonCard>
        <p className="mb-2 text-xs uppercase tracking-wide text-pulse-muted">Workouts per Week</p>
        <WorkoutsPerWeekChart data={data.workoutsPerWeek} />
      </NeonCard>

      <NeonCard>
        <p className="mb-2 text-xs uppercase tracking-wide text-pulse-muted">Points Over Time</p>
        <PointsOverTimeChart data={data.pointsOverTime} />
      </NeonCard>

      <NeonCard>
        <p className="mb-2 text-xs uppercase tracking-wide text-pulse-muted">Water Goals Hit per Week</p>
        <WaterGoalsChart data={data.waterGoalsPerWeek} />
      </NeonCard>

      <NeonCard>
        <p className="mb-2 text-xs uppercase tracking-wide text-pulse-muted">Last 30 Days</p>
        <StreakHistoryChart activityDays={data.activityDays} />
      </NeonCard>

      <NeonCard glow="purple">
        <p className="mb-3 text-xs uppercase tracking-wide text-pulse-muted">Badges</p>
        {data.badges.length === 0 ? (
          <p className="text-sm text-pulse-muted">No badges yet — keep going!</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {data.badges.map((b) => (
              <BadgeChip key={b.id} icon={b.icon} name={b.name} description={b.description} />
            ))}
          </div>
        )}
      </NeonCard>
    </div>
  );
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <NeonCard glow="pink" className="text-center">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-[11px] text-pulse-muted">{label}</p>
    </NeonCard>
  );
}
