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
    muscleGroup: { name: string };
  };
}

export function ExerciseCard({
  slot,
  onToggleComplete,
  onSwap,
  disabled,
}: {
  slot: WorkoutSlotView;
  onToggleComplete: (slotId: string, completed: boolean) => void;
  onSwap: (slot: WorkoutSlotView) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-white/5 bg-pulse-surface p-4 transition-opacity",
        slot.completed && "opacity-60"
      )}
    >
      <button
        onClick={() => onToggleComplete(slot.id, !slot.completed)}
        disabled={disabled}
        aria-label={slot.completed ? "Mark as not done" : "Mark as done"}
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-90",
          slot.completed
            ? "border-transparent bg-gradient-to-r from-pulse-pink to-pulse-purple text-white shadow-glow-pink"
            : "border-white/20 text-transparent hover:border-pulse-pink"
        )}
      >
        ✓
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-semibold text-white", slot.completed && "line-through")}>
          {slot.chosenExercise.name}
        </p>
        <p className="text-xs text-pulse-muted">
          {slot.chosenExercise.muscleGroup.name} · {slot.chosenExercise.equipment}
        </p>
        <p className="mt-1 text-sm text-pulse-pink-light">
          {slot.sets} sets × {slot.reps} · rest {slot.restSeconds}s
        </p>
      </div>

      <button
        onClick={() => onSwap(slot)}
        disabled={disabled}
        className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-pulse-muted transition-colors hover:border-pulse-purple hover:text-white"
      >
        Swap
      </button>
    </div>
  );
}
