"use client";

import { useEffect, useMemo, useState } from "react";
import { NeonCard } from "@/components/ui/neon-card";
import { GlowButton } from "@/components/ui/glow-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Toast } from "@/components/ui/toast";

const REMINDER_MS = 2 * 60 * 60 * 1000;
const RECHECK_MS = 60 * 1000;

interface WaterLog {
  glasses: number;
  lastLoggedAt: string | null;
}
interface HabitLog {
  stretch: boolean;
  sleep8h: boolean;
  proteinGoal: boolean;
}

const HABIT_LABELS: { key: keyof HabitLog; label: string; icon: string }[] = [
  { key: "stretch", label: "Stretch", icon: "🧘" },
  { key: "sleep8h", label: "Slept 8 hrs", icon: "😴" },
  { key: "proteinGoal", label: "Hit protein goal", icon: "🍗" },
];

export default function WaterPage() {
  const [water, setWater] = useState<WaterLog | null>(null);
  const [habits, setHabits] = useState<HabitLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [dismissedReminder, setDismissedReminder] = useState(false);

  function loadWater() {
    return fetch("/api/water")
      .then((res) => res.json())
      .then((data) => setWater(data.waterLog))
      .catch(() => setError("Couldn't load water data. Check your connection."));
  }

  function loadHabits() {
    return fetch("/api/habits")
      .then((res) => res.json())
      .then((data) => setHabits(data.habitLog))
      .catch(() => setError("Couldn't load habit data. Check your connection."));
  }

  useEffect(() => {
    loadWater();
    loadHabits();
    const interval = setInterval(() => setNow(Date.now()), RECHECK_MS);
    return () => clearInterval(interval);
  }, []);

  const shouldRemind = useMemo(() => {
    if (!water || dismissedReminder) return false;
    if (water.glasses >= 8 || !water.lastLoggedAt) return false;
    return now - new Date(water.lastLoggedAt).getTime() >= REMINDER_MS;
  }, [water, now, dismissedReminder]);

  async function addGlass() {
    setError(null);
    try {
      const res = await fetch("/api/water", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setWater(data.waterLog);
      setDismissedReminder(false);
    } catch {
      setError("Couldn't log water — check your connection.");
    }
  }

  async function toggleHabit(key: keyof HabitLog) {
    if (!habits) return;
    const next = { ...habits, [key]: !habits[key] };
    setHabits(next);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next[key] }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setHabits(data.habitLog);
    } catch {
      setError("Couldn't save habit — check your connection.");
      setHabits(habits);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Toast
        message="💧 It's been 2+ hours since your last glass — stay hydrated!"
        visible={shouldRemind}
        onDismiss={() => setDismissedReminder(true)}
      />
      <Toast message={error ?? ""} visible={!!error} onDismiss={() => setError(null)} variant="error" />

      <NeonCard glow="pink">
        <p className="mb-2 text-xs uppercase tracking-wide text-pulse-muted">Water Tracker</p>
        {water ? (
          <>
            <ProgressBar value={water.glasses} max={8} label="Glasses today" />
            <GlowButton onClick={addGlass} className="mt-4 w-full" size="lg">
              + 1 Glass
            </GlowButton>
          </>
        ) : (
          <p className="text-sm text-pulse-muted">Loading…</p>
        )}
      </NeonCard>

      <NeonCard glow="purple">
        <p className="mb-3 text-xs uppercase tracking-wide text-pulse-muted">Daily Habits</p>
        {habits ? (
          <div className="flex flex-col gap-2">
            {HABIT_LABELS.map((h) => (
              <button
                key={h.key}
                onClick={() => toggleHabit(h.key)}
                className="flex items-center justify-between rounded-xl bg-pulse-surface-2 px-4 py-3 text-left transition-colors hover:bg-white/5"
              >
                <span className="flex items-center gap-2 text-white">
                  <span>{h.icon}</span> {h.label}
                </span>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    habits[h.key]
                      ? "border-transparent bg-gradient-to-r from-pulse-pink to-pulse-purple text-white"
                      : "border-white/20 text-transparent"
                  }`}
                >
                  ✓
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-pulse-muted">Loading…</p>
        )}
      </NeonCard>
    </div>
  );
}
