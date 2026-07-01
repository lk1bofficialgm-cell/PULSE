"use client";

import { Pencil } from "lucide-react";
import { cn } from "@/lib/cn";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SHORT_TYPE: Record<string, string> = {
  PUSH: "Push",
  PULL: "Pull",
  LEGS: "Legs",
  UPPER: "Upper",
  LOWER: "Lower",
  FULL_BODY: "Full",
  REST: "Rest",
};

export interface WeekPlanDay {
  dayOfWeek: number;
  dayType: string;
  label: string;
}

export function CalendarStrip({
  week,
  todayDayOfWeek,
  onEditDay,
}: {
  week: WeekPlanDay[];
  todayDayOfWeek: number;
  onEditDay?: (day: WeekPlanDay) => void;
}) {
  const byDay = new Map(week.map((d) => [d.dayOfWeek, d]));

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {DAY_LABELS.map((label, dayOfWeek) => {
          const day = byDay.get(dayOfWeek);
          const isToday = dayOfWeek === todayDayOfWeek;
          const isRest = !day || day.dayType === "REST";

          return (
            <button
              key={dayOfWeek}
              onClick={() => day && onEditDay?.(day)}
              className={cn(
                "group flex flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 transition-all duration-200 active:scale-90",
                isToday
                  ? "border-white bg-white text-black"
                  : "border-line bg-surface text-muted hover:border-white/25"
              )}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                {label}
              </span>
              <span className={cn("text-[11px] font-semibold", isRest && !isToday && "opacity-50")}>
                {day ? SHORT_TYPE[day.dayType] ?? day.dayType : "—"}
              </span>
            </button>
          );
        })}
      </div>
      {onEditDay && (
        <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-faint">
          <Pencil size={10} /> Tap any day to change it
        </p>
      )}
    </div>
  );
}
