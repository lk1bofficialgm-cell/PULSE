"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { Moon } from "lucide-react";
import { CalendarStrip, type WeekPlanDay } from "@/components/workout/calendar-strip";
import { DayEditorSheet } from "@/components/workout/day-editor-sheet";
import { ExerciseCard, type WorkoutSlotView } from "@/components/workout/exercise-card";
import { SwapExerciseSheet } from "@/components/workout/swap-exercise-modal";
import { DemoSheet } from "@/components/workout/demo-sheet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";

interface WorkoutData {
  workout: {
    id: string;
    dayType: string;
    finishedAt: string | null;
    slots: WorkoutSlotView[];
  };
  week: WeekPlanDay[];
  todayDayOfWeek: number;
}

const DAY_TITLES: Record<string, string> = {
  PUSH: "Push Day",
  PULL: "Pull Day",
  LEGS: "Leg Day",
  UPPER: "Upper Body",
  LOWER: "Lower Body",
  FULL_BODY: "Full Body",
  REST: "Rest Day",
};

export default function WorkoutPage() {
  const router = useRouter();
  const [data, setData] = useState<WorkoutData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [swapSlot, setSwapSlot] = useState<WorkoutSlotView | null>(null);
  const [demoExercise, setDemoExercise] = useState<{ name: string; videoUrl: string | null } | null>(null);
  const [editDay, setEditDay] = useState<WeekPlanDay | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [finishSummary, setFinishSummary] = useState<{ totalPoints: number; currentStreak: number } | null>(null);

  const load = useCallback(() => {
    fetch("/api/workouts/today")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Couldn't load today's workout. Check your connection."));
  }, []);

  useEffect(load, [load]);

  async function toggleComplete(slotId: string, completed: boolean) {
    if (!data) return;
    setData({
      ...data,
      workout: {
        ...data.workout,
        slots: data.workout.slots.map((s) => (s.id === slotId ? { ...s, completed } : s)),
      },
    });
    try {
      const res = await fetch(`/api/workouts/slots/${slotId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      setError("Couldn't save that. Check your connection.");
      load();
    }
  }

  function handleSwapped(slotId: string, updatedSlot: WorkoutSlotView) {
    if (!data) return;
    setData({
      ...data,
      workout: {
        ...data.workout,
        slots: data.workout.slots.map((s) => (s.id === slotId ? updatedSlot : s)),
      },
    });
  }

  function handleWeekSaved(week: WeekPlanDay[]) {
    setData((d) => (d ? { ...d, week } : d));
    // Today's workout may have been rebuilt to match the new plan
    load();
  }

  async function finishWorkout() {
    if (!data) return;
    setFinishing(true);
    setError(null);
    try {
      const res = await fetch(`/api/workouts/${data.workout.id}/finish`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const result = await res.json();
      setFinishSummary({ totalPoints: result.totalPoints, currentStreak: result.currentStreak });
      setData({ ...data, workout: { ...data.workout, finishedAt: result.workout.finishedAt } });
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.7 },
        colors: ["#ffffff", "#bbbbbb", "#777777"],
      });
      // Refresh server components so the header streak updates immediately
      router.refresh();
    } catch {
      setError("Couldn't finish the workout. Check your connection and try again.");
    } finally {
      setFinishing(false);
    }
  }

  if (error && !data) {
    return <p className="py-12 text-center text-sm text-red-400">{error}</p>;
  }
  if (!data) {
    return (
      <div className="flex flex-col gap-3 py-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-3xl bg-surface" />
        ))}
      </div>
    );
  }

  const isRestDay = data.workout.dayType === "REST";
  const isFinished = !!data.workout.finishedAt;
  const doneCount = data.workout.slots.filter((s) => s.completed).length;
  const total = data.workout.slots.length;

  return (
    <div className="flex flex-col gap-5">
      <Toast message={error ?? ""} visible={!!error} onDismiss={() => setError(null)} variant="error" />

      <CalendarStrip week={data.week} todayDayOfWeek={data.todayDayOfWeek} onEditDay={setEditDay} />

      {isRestDay ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-center">
          <Moon size={28} className="text-muted" />
          <p className="text-lg font-bold text-white">Rest Day</p>
          <p className="max-w-[26ch] text-sm text-muted">
            Recovery is where muscle is built. Hydrate, stretch, sleep well.
          </p>
          <button
            onClick={() => setEditDay(data.week.find((d) => d.dayOfWeek === data.todayDayOfWeek) ?? null)}
            className="mt-2 text-sm font-semibold text-white underline underline-offset-4"
          >
            Train today instead
          </button>
        </Card>
      ) : (
        <>
          <div className="flex items-end justify-between px-1">
            <div>
              <h1 className="text-2xl font-black text-white">
                {DAY_TITLES[data.workout.dayType] ?? data.workout.dayType}
              </h1>
              <p className="mt-0.5 text-sm text-muted">
                {isFinished ? "Completed — nice work." : `${doneCount} of ${total} exercises done`}
              </p>
            </div>
            <ProgressRing done={doneCount} total={total} />
          </div>

          <div className="stagger flex flex-col gap-3">
            {data.workout.slots.map((slot) => (
              <ExerciseCard
                key={slot.id}
                slot={slot}
                onToggleComplete={toggleComplete}
                onSwap={setSwapSlot}
                onDemo={(s) => setDemoExercise({ name: s.chosenExercise.name, videoUrl: s.chosenExercise.videoUrl })}
                disabled={isFinished}
              />
            ))}
          </div>

          {finishSummary ? (
            <Card className="animate-fade-in-up text-center">
              <p className="text-lg font-black text-white">Workout complete</p>
              <p className="mt-1 text-sm text-muted">
                +50 points · {finishSummary.currentStreak}-day streak · {finishSummary.totalPoints} total
              </p>
            </Card>
          ) : (
            <Button onClick={finishWorkout} disabled={finishing || isFinished} size="lg" className="w-full">
              {isFinished ? "Workout finished" : finishing ? "Finishing…" : "Finish Workout"}
            </Button>
          )}
        </>
      )}

      <DayEditorSheet day={editDay} onClose={() => setEditDay(null)} onSaved={handleWeekSaved} />
      <SwapExerciseSheet
        slot={swapSlot}
        onClose={() => setSwapSlot(null)}
        onSwapped={handleSwapped}
        onDemo={setDemoExercise}
      />
      <DemoSheet exercise={demoExercise} onClose={() => setDemoExercise(null)} />
    </div>
  );
}

function ProgressRing({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? done / total : 0;
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" aria-label={`${done} of ${total} done`}>
      <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform="rotate(-90 26 26)"
        style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.21,1.02,0.73,1)" }}
      />
      <text x="26" y="30" textAnchor="middle" className="fill-white text-[12px] font-bold">
        {done}/{total}
      </text>
    </svg>
  );
}
