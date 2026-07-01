"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/cn";
import type { WeekPlanDay } from "./calendar-strip";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const OPTIONS = [
  { value: "REST", label: "Rest Day", detail: "Recovery — no workout" },
  { value: "PUSH", label: "Push", detail: "Chest, shoulders & triceps" },
  { value: "PULL", label: "Pull", detail: "Back & biceps" },
  { value: "LEGS", label: "Legs", detail: "Quads, hamstrings, glutes & calves" },
  { value: "UPPER", label: "Upper Body", detail: "Chest, back, shoulders & arms" },
  { value: "LOWER", label: "Lower Body", detail: "Legs & glutes" },
  { value: "FULL_BODY", label: "Full Body", detail: "A bit of everything" },
];

export function DayEditorSheet({
  day,
  onClose,
  onSaved,
}: {
  day: WeekPlanDay | null;
  onClose: () => void;
  onSaved: (week: WeekPlanDay[]) => void;
}) {
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick(dayType: string) {
    if (!day) return;
    setSaving(dayType);
    setError(null);
    try {
      const res = await fetch("/api/schedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayOfWeek: day.dayOfWeek, dayType }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onSaved(data.week);
      onClose();
    } catch {
      setError("Couldn't save — check your connection.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <Sheet open={!!day} onClose={onClose} title={day ? DAY_LABELS[day.dayOfWeek] : ""}>
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
      <div className="flex flex-col gap-2">
        {OPTIONS.map((opt) => {
          const active = day?.dayType === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => pick(opt.value)}
              disabled={saving !== null}
              className={cn(
                "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all duration-150 active:scale-[0.98] disabled:opacity-60",
                active ? "border-white bg-white/[0.06]" : "border-line bg-surface-2 hover:border-white/25"
              )}
            >
              <span>
                <span className="block font-semibold text-white">{opt.label}</span>
                <span className="block text-xs text-muted">{opt.detail}</span>
              </span>
              {active && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-black">
                  <Check size={13} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[11px] text-faint">
        Changing today only rebuilds your workout if you haven&apos;t started it.
      </p>
    </Sheet>
  );
}
