"use client";

import { motion } from "motion/react";
import { Check, Play, Repeat } from "lucide-react";
import { cn } from "@/lib/cn";

export interface WorkoutSlotView {
  id: string;
  order: number;
  sets: number;
  reps: string;
  restSeconds: number;
  completed: boolean;
  chosenExercise: {
    id: string;
    name: string;
    equipment: string;
    videoUrl: string | null;
    muscleGroup: { name: string };
  };
}

export function ExerciseCard({
  slot,
  onToggleComplete,
  onSwap,
  onDemo,
  disabled,
}: {
  slot: WorkoutSlotView;
  onToggleComplete: (slotId: string, completed: boolean) => void;
  onSwap: (slot: WorkoutSlotView) => void;
  onDemo: (slot: WorkoutSlotView) => void;
  disabled?: boolean;
}) {
  return (
    <motion.div
      layout
      animate={{ opacity: slot.completed ? 0.55 : 1, scale: slot.completed ? 0.985 : 1 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-3.5 rounded-3xl border border-line bg-surface p-4"
    >
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => onToggleComplete(slot.id, !slot.completed)}
        disabled={disabled}
        aria-label={slot.completed ? "Mark as not done" : "Mark as done"}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200",
          slot.completed
            ? "border-white bg-white text-black"
            : "border-white/20 text-transparent hover:border-white/50"
        )}
      >
        <motion.span
          initial={false}
          animate={{ scale: slot.completed ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 600, damping: 25 }}
        >
          <Check size={17} strokeWidth={3.5} />
        </motion.span>
      </motion.button>

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-[15px] font-bold text-white", slot.completed && "line-through decoration-white/40")}>
          {slot.chosenExercise.name}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {slot.chosenExercise.muscleGroup.name} · {slot.chosenExercise.equipment}
        </p>
        <p className="mt-1 text-[13px] font-semibold text-white/80">
          {slot.sets} × {slot.reps}
          <span className="font-normal text-faint"> · rest {slot.restSeconds}s</span>
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-2">
        <button
          onClick={() => onDemo(slot)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface-2 text-white transition-all duration-150 hover:border-white/30 active:scale-90"
          aria-label={`Watch ${slot.chosenExercise.name} demo`}
        >
          <Play size={14} className="ml-0.5" fill="currentColor" />
        </button>
        <button
          onClick={() => onSwap(slot)}
          disabled={disabled}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface-2 text-muted transition-all duration-150 hover:border-white/30 hover:text-white active:scale-90 disabled:opacity-40"
          aria-label={`Swap ${slot.chosenExercise.name}`}
        >
          <Repeat size={14} />
        </button>
      </div>
    </motion.div>
  );
}
