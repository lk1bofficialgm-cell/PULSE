"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { motion } from "motion/react";
import { Check, GlassWater, Plus } from "lucide-react";
import { WaterBottle } from "@/components/water-bottle";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

const REMINDER_MS = 2 * 60 * 60 * 1000;
const RECHECK_MS = 60 * 1000;

interface WaterState {
  consumedMl: number;
  goalMl: number;
  lastLoggedAt: string | null;
}
interface HabitLog {
  stretch: boolean;
  sleep8h: boolean;
  proteinGoal: boolean;
}

const HABIT_LABELS: { key: keyof HabitLog; label: string }[] = [
  { key: "stretch", label: "Stretched" },
  { key: "sleep8h", label: "Slept 8 hours" },
  { key: "proteinGoal", label: "Hit protein goal" },
];

export default function WaterPage() {
  const router = useRouter();
  const [water, setWater] = useState<WaterState | null>(null);
  const [bottleMl, setBottleMl] = useState(500);
  const [habits, setHabits] = useState<HabitLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [dismissedReminder, setDismissedReminder] = useState(false);
  // Local total while dragging (null = not dragging, mirror server state)
  const [draftMl, setDraftMl] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/water")
      .then((res) => res.json())
      .then((data) => {
        setWater(data.waterLog);
        setBottleMl(data.bottleMl);
      })
      .catch(() => setError("Couldn't load water data. Check your connection."));
    fetch("/api/habits")
      .then((res) => res.json())
      .then((data) => setHabits(data.habitLog))
      .catch(() => setError("Couldn't load habit data. Check your connection."));
    const interval = setInterval(() => setNow(Date.now()), RECHECK_MS);
    return () => clearInterval(interval);
  }, []);

  const totalMl = draftMl ?? water?.consumedMl ?? 0;
  const goalMl = water?.goalMl ?? 2000;
  const bottleCount = Math.max(1, Math.ceil(goalMl / bottleMl));
  const goalMet = totalMl >= goalMl;

  // Which bottle is the user on, and how full is it?
  const currentBottleIndex = Math.min(bottleCount - 1, Math.floor(totalMl / bottleMl));
  const fillFraction = goalMet && totalMl >= bottleCount * bottleMl
    ? 1
    : Math.min(1, (totalMl - currentBottleIndex * bottleMl) / bottleMl);

  const shouldRemind = useMemo(() => {
    if (!water || dismissedReminder || goalMet) return false;
    if (!water.lastLoggedAt) return false;
    return now - new Date(water.lastLoggedAt).getTime() >= REMINDER_MS;
  }, [water, now, dismissedReminder, goalMet]);

  const commit = useCallback(
    async (newTotal: number) => {
      const clamped = Math.max(0, Math.min(12_000, Math.round(newTotal / 10) * 10));
      const wasGoalMet = (water?.consumedMl ?? 0) >= goalMl;
      setDraftMl(null);
      setWater((w) => (w ? { ...w, consumedMl: clamped } : w));
      try {
        const res = await fetch("/api/water", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ totalMl: clamped }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setWater(data.waterLog);
        setDismissedReminder(false);
        if (!wasGoalMet && data.waterLog.consumedMl >= data.waterLog.goalMl) {
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#ffffff", "#bbbbbb", "#777777"],
          });
          // Refresh server components so the header streak updates immediately
          router.refresh();
        }
      } catch {
        setError("Couldn't save — check your connection.");
      }
    },
    [water, goalMl, router]
  );

  function handleDragFill(fraction: number) {
    const base = currentBottleIndex * bottleMl;
    setDraftMl(base + Math.round(fraction * bottleMl));
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
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHabits(data.habitLog);
    } catch {
      setError("Couldn't save habit — check your connection.");
      setHabits(habits);
    }
  }

  if (!water) {
    return (
      <div className="flex flex-col gap-3 py-2">
        <div className="h-[380px] animate-pulse rounded-3xl bg-surface" />
        <div className="h-40 animate-pulse rounded-3xl bg-surface" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Toast
        message="It's been 2+ hours since your last sip — drink up."
        visible={shouldRemind}
        onDismiss={() => setDismissedReminder(true)}
      />
      <Toast message={error ?? ""} visible={!!error} onDismiss={() => setError(null)} variant="error" />

      <div className="px-1 text-center">
        <h1 className="text-2xl font-black text-white">
          {goalMet ? "Goal met" : `Bottle ${currentBottleIndex + 1} of ${bottleCount}`}
        </h1>
        <p className="mt-0.5 text-sm text-muted">
          {(totalMl / 1000).toFixed(2).replace(/\.?0+$/, "")} L of {(goalMl / 1000).toFixed(1).replace(/\.0$/, "")} L
          {" · "}
          {bottleMl >= 1000 ? `${bottleMl / 1000} L` : `${bottleMl} ml`} bottle
        </p>
      </div>

      <Card className="py-6">
        <WaterBottle
          fillFraction={fillFraction}
          onDragFill={handleDragFill}
          onCommit={() => draftMl !== null && commit(draftMl)}
        />
        <p className="mt-3 text-center text-xs text-faint">Drag inside the bottle to log your water</p>

        {/* Bottle progress row */}
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: bottleCount }).map((_, i) => {
            const bottleFill = Math.min(1, Math.max(0, totalMl / bottleMl - i));
            return (
              <div key={i} className="h-8 w-4 overflow-hidden rounded-md border border-line bg-white/[0.04]">
                <motion.div
                  className="w-full bg-white"
                  animate={{ height: `${bottleFill * 100}%`, y: `${(1 - bottleFill) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  style={{ height: "100%", transformOrigin: "bottom" }}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex justify-center gap-3">
          <QuickButton onClick={() => commit(totalMl + 250)} icon={<GlassWater size={14} />} label="+ Glass" />
          <QuickButton
            onClick={() => commit((currentBottleIndex + 1) * bottleMl)}
            icon={<Plus size={14} />}
            label="Finish bottle"
          />
        </div>
      </Card>

      <Card title="Daily habits">
        <div className="flex flex-col gap-2">
          {HABIT_LABELS.map((h) => {
            const on = habits?.[h.key] ?? false;
            return (
              <button
                key={h.key}
                onClick={() => toggleHabit(h.key)}
                className="flex items-center justify-between rounded-2xl border border-line bg-surface-2 px-4 py-3.5 text-left transition-all duration-150 active:scale-[0.98]"
              >
                <span className={cn("font-semibold", on ? "text-white" : "text-muted")}>{h.label}</span>
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors duration-200",
                    on ? "border-white bg-white text-black" : "border-white/20 text-transparent"
                  )}
                >
                  <motion.span initial={false} animate={{ scale: on ? 1 : 0 }} transition={{ type: "spring", stiffness: 600, damping: 25 }}>
                    <Check size={13} strokeWidth={3.5} />
                  </motion.span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-faint">Check all three to keep your streak alive on rest days.</p>
      </Card>
    </div>
  );
}

function QuickButton({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-4 py-2 text-[13px] font-semibold text-white transition-all duration-150 hover:border-white/25 active:scale-95"
    >
      {icon}
      {label}
    </button>
  );
}
