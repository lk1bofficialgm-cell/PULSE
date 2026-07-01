"use client";

import { useEffect, useState } from "react";
import { CalendarStrip, type WeekTemplateDay } from "@/components/workout/calendar-strip";
import { ExerciseCard, type WorkoutSlotView } from "@/components/workout/exercise-card";
import { SwapExerciseModal } from "@/components/workout/swap-exercise-modal";
import { NeonCard } from "@/components/ui/neon-card";
import { GlowButton } from "@/components/ui/glow-button";
import { Toast } from "@/components/ui/toast";

interface WorkoutData {
  workout: {
    id: string;
    dayType: string;
    finishedAt: string | null;
    slots: WorkoutSlotView[];
  };
  week: WeekTemplateDay[];
  todayDayOfWeek: number;
}

export default function WorkoutPage() {
  const [data, setData] = useState<WorkoutData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [swapSlot, setSwapSlot] = useState<WorkoutSlotView | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [finishSummary, setFinishSummary] = useState<{ totalPoints: number; currentStreak: number } | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  function load() {
    fetch("/api/workouts/today")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Couldn't load today's workout. Check your connection."));
  }

  useEffect(load, []);

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

  async function finishWorkout() {
    if (!data) return;
    setFinishing(true);
    setError(null);
    try {
      const res = await fetch(`/api/workouts/${data.workout.id}/finish`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const result = await res.json();
      setFinishSummary({ totalPoints: result.totalPoints, currentStreak: result.currentStreak });
      setCelebrate(true);
      setData({ ...data, workout: { ...data.workout, finishedAt: result.workout.finishedAt } });
      setTimeout(() => setCelebrate(false), 900);
    } catch {
      setError("Couldn't finish the workout. Check your connection and try again.");
    } finally {
      setFinishing(false);
    }
  }

  if (error && !data) {
    return <p className="text-center text-sm text-red-400">{error}</p>;
  }
  if (!data) {
    return <p className="text-center text-sm text-pulse-muted">Loading today&apos;s workout…</p>;
  }

  const isRestDay = data.workout.dayType === "REST";
  const isFinished = !!data.workout.finishedAt;

  return (
    <div className="flex flex-col gap-5">
      <Toast message={error ?? ""} visible={!!error} onDismiss={() => setError(null)} variant="error" />

      <CalendarStrip week={data.week} todayDayOfWeek={data.todayDayOfWeek} />

      {isRestDay ? (
        <NeonCard glow="purple" className="text-center">
          <p className="text-lg font-bold text-white">Rest Day 🌙</p>
          <p className="mt-1 text-sm text-pulse-muted">Recovery is part of the plan. Stay hydrated and stretch.</p>
        </NeonCard>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {data.workout.slots.map((slot) => (
              <ExerciseCard
                key={slot.id}
                slot={slot}
                onToggleComplete={toggleComplete}
                onSwap={setSwapSlot}
                disabled={isFinished}
              />
            ))}
          </div>

          {finishSummary ? (
            <NeonCard glow="pink" className={celebrate ? "animate-glow-burst" : undefined}>
              <p className="text-center text-lg font-bold text-white">Workout Complete! 🎉</p>
              <p className="text-center text-sm text-pulse-muted">
                +50 points · {finishSummary.currentStreak}-day streak · {finishSummary.totalPoints} total points
              </p>
            </NeonCard>
          ) : (
            <GlowButton onClick={finishWorkout} disabled={finishing || isFinished} size="lg" className="w-full">
              {isFinished ? "Workout Finished" : finishing ? "Finishing…" : "Finish Workout"}
            </GlowButton>
          )}
        </>
      )}

      {swapSlot && (
        <SwapExerciseModal slot={swapSlot} onClose={() => setSwapSlot(null)} onSwapped={handleSwapped} />
      )}
    </div>
  );
}
