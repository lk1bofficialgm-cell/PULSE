"use client";

import { useEffect, useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { BadgeChip } from "@/components/ui/badge-chip";
import { WorkoutsPerWeekChart } from "@/components/charts/workouts-per-week-chart";
import { StreakHistoryChart } from "@/components/charts/streak-history-chart";
import { cn } from "@/lib/cn";

interface StatsData {
  totals: { totalPoints: number; totalWorkouts: number; longestStreak: number; currentStreak: number };
  thisWeek: { plannedDays: number; trainedDays: number; waterGoalsHit: number };
  workoutsPerWeek: { week: string; count: number }[];
  activityDays: string[];
  badges: { id: string; key: string; name: string; description: string; icon: string }[];
}

interface LeaderboardEntry {
  id: string;
  username: string;
  avatarUrl: string | null;
  totalPoints: number;
  weeklyPoints: number;
  rank: number;
}

type View = "you" | "leaderboard";
type Scope = "weekly" | "alltime";

export default function ProgressPage() {
  const [view, setView] = useState<View>("you");
  const [data, setData] = useState<StatsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError("Couldn't load your stats. Check your connection."));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-center">
        <Tabs
          tabs={[
            { key: "you", label: "You" },
            { key: "leaderboard", label: "Leaderboard" },
          ]}
          active={view}
          onChange={setView}
        />
      </div>

      {view === "you" ? (
        error ? (
          <p className="py-10 text-center text-sm text-red-400">{error}</p>
        ) : !data ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-3xl bg-surface" />
            ))}
          </div>
        ) : (
          <YouView data={data} />
        )
      ) : (
        <LeaderboardView />
      )}
    </div>
  );
}

function YouView({ data }: { data: StatsData }) {
  const { plannedDays, trainedDays, waterGoalsHit } = data.thisWeek;
  const weekPct = plannedDays > 0 ? Math.min(1, trainedDays / plannedDays) : 0;

  return (
    <div className="stagger flex flex-col gap-5">
      <Card title="This week">
        <div className="flex items-center gap-5">
          <WeekRing pct={weekPct} />
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold text-white">
              {trainedDays} of {plannedDays} workouts
            </p>
            <p className="text-sm text-muted">
              {trainedDays >= plannedDays && plannedDays > 0
                ? "Week complete — outstanding."
                : `${plannedDays - trainedDays} more to hit your plan`}
            </p>
            <p className="text-sm text-muted">{waterGoalsHit} water goal{waterGoalsHit === 1 ? "" : "s"} hit</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <StatTile value={data.totals.totalWorkouts} label="Workouts" />
        <StatTile value={data.totals.totalPoints} label="Points" />
        <StatTile value={data.totals.longestStreak} label="Best streak" />
      </div>

      <Card title="Workouts per week">
        <WorkoutsPerWeekChart data={data.workoutsPerWeek} />
      </Card>

      <Card title="Last 30 days">
        <StreakHistoryChart activityDays={data.activityDays} />
      </Card>

      <Card title="Badges">
        {data.badges.length === 0 ? (
          <p className="text-sm text-muted">No badges yet — your first is a 7-day streak away.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {data.badges.map((b) => (
              <BadgeChip key={b.id} icon={b.icon} name={b.name} description={b.description} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function LeaderboardView() {
  const [scope, setScope] = useState<Scope>("weekly");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [me, setMe] = useState<LeaderboardEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/leaderboard?scope=${scope}`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries);
        setMe(data.me);
      })
      .catch(() => setError("Couldn't load the leaderboard. Check your connection."));
  }, [scope]);

  const points = (e: LeaderboardEntry) => (scope === "weekly" ? e.weeklyPoints : e.totalPoints);
  const meInTop = me && entries.some((e) => e.id === me.id);

  return (
    <div className="stagger flex flex-col gap-4">
      <div className="flex justify-center">
        <Tabs
          tabs={[
            { key: "weekly", label: "This Week" },
            { key: "alltime", label: "All-Time" },
          ]}
          active={scope}
          onChange={setScope}
        />
      </div>

      {error && <p className="text-center text-sm text-red-400">{error}</p>}

      <Card>
        <div className="flex flex-col">
          {entries.map((e) => (
            <LeaderboardRow key={e.id} entry={e} points={points(e)} highlight={e.id === me?.id} />
          ))}
          {entries.length === 0 && !error && (
            <p className="py-6 text-center text-sm text-muted">Loading rankings…</p>
          )}
        </div>
      </Card>

      {me && !meInTop && (
        <Card title="Your rank">
          <LeaderboardRow entry={me} points={points(me)} highlight />
        </Card>
      )}
    </div>
  );
}

function LeaderboardRow({
  entry,
  points,
  highlight,
}: {
  entry: LeaderboardEntry;
  points: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl px-2 py-2.5",
        highlight && "bg-white/[0.06]"
      )}
    >
      <span className="w-7 text-center text-sm font-black text-muted">{entry.rank}</span>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-2">
        {entry.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entry.avatarUrl} alt={entry.username} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-muted">☺</span>
        )}
      </div>
      <span className="flex-1 truncate text-sm font-semibold text-white">@{entry.username}</span>
      <span className="text-sm font-bold text-white">{points.toLocaleString()} pts</span>
    </div>
  );
}

function WeekRing({ pct }: { pct: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" aria-label={`${Math.round(pct * 100)}% of weekly plan`}>
      <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <circle
        cx="38"
        cy="38"
        r={r}
        fill="none"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform="rotate(-90 38 38)"
        style={{ transition: "stroke-dashoffset 800ms cubic-bezier(0.21,1.02,0.73,1)" }}
      />
      <text x="38" y="43" textAnchor="middle" className="fill-white text-[15px] font-black">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <Card className="p-4 text-center">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted">{label}</p>
    </Card>
  );
}
