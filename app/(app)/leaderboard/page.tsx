"use client";

import { useEffect, useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { NeonCard } from "@/components/ui/neon-card";
import { cn } from "@/lib/cn";

interface Entry {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  totalPoints: number;
  weeklyPoints: number;
  rank: number;
}

type Scope = "alltime" | "weekly";

export default function LeaderboardPage() {
  const [scope, setScope] = useState<Scope>("alltime");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [me, setMe] = useState<Entry | null>(null);
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

  const points = (e: Entry) => (scope === "weekly" ? e.weeklyPoints : e.totalPoints);
  const meInTop = me && entries.some((e) => e.id === me.id);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-center">
        <Tabs
          tabs={[
            { key: "alltime", label: "All-Time" },
            { key: "weekly", label: "Weekly" },
          ]}
          active={scope}
          onChange={setScope}
        />
      </div>

      {error && <p className="text-center text-sm text-red-400">{error}</p>}

      <NeonCard glow="purple">
        <div className="flex flex-col gap-2">
          {entries.map((e) => (
            <LeaderboardRow key={e.id} entry={e} points={points(e)} highlight={e.id === me?.id} />
          ))}
        </div>
      </NeonCard>

      {me && !meInTop && (
        <NeonCard glow="pink">
          <p className="mb-2 text-xs uppercase tracking-wide text-pulse-muted">Your Rank</p>
          <LeaderboardRow entry={me} points={points(me)} highlight />
        </NeonCard>
      )}
    </div>
  );
}

function LeaderboardRow({ entry, points, highlight }: { entry: Entry; points: number; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5",
        highlight && "bg-gradient-to-r from-pulse-pink/20 to-pulse-purple/20"
      )}
    >
      <span className="w-6 text-center text-sm font-bold text-pulse-muted">#{entry.rank}</span>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pulse-surface-2">
        {entry.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entry.avatarUrl} alt={entry.username} className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm">🙂</span>
        )}
      </div>
      <span className="flex-1 truncate text-sm font-medium text-white">@{entry.username}</span>
      <span className="text-sm font-bold text-pulse-pink-light">{points} pts</span>
    </div>
  );
}
