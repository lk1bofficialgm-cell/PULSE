import { cn } from "@/lib/cn";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface WeekTemplateDay {
  dayOfWeek: number;
  dayType: string;
  label: string;
}

export function CalendarStrip({
  week,
  todayDayOfWeek,
}: {
  week: WeekTemplateDay[];
  todayDayOfWeek: number;
}) {
  const byDay = new Map(week.map((d) => [d.dayOfWeek, d]));

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {DAY_LABELS.map((label, dayOfWeek) => {
        const day = byDay.get(dayOfWeek);
        const isToday = dayOfWeek === todayDayOfWeek;
        const isRest = !day || day.dayType === "REST";

        return (
          <div
            key={dayOfWeek}
            className={cn(
              "flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-2 py-3 text-center transition-all",
              isToday
                ? "bg-gradient-to-b from-pulse-pink to-pulse-purple text-white shadow-glow-pink"
                : "bg-pulse-surface-2 text-pulse-muted"
            )}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
            <span className={cn("text-[11px]", isRest && !isToday && "opacity-60")}>
              {day ? (isRest ? "Rest" : day.label.replace(" Day", "")) : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
