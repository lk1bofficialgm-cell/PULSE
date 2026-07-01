import { cn } from "@/lib/cn";

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function StreakHistoryChart({ activityDays }: { activityDays: string[] }) {
  const activeSet = new Set(activityDays.map((d) => d.slice(0, 10)));

  const days: { key: string; active: boolean; label: string }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = dateKey(d);
    days.push({
      key,
      active: activeSet.has(key),
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" }),
    });
  }

  return (
    <div>
      <div className="grid grid-cols-10 gap-1.5">
        {days.map((day) => (
          <div
            key={day.key}
            title={`${day.label}${day.active ? " — active" : ""}`}
            aria-label={`${day.label}: ${day.active ? "active" : "inactive"}`}
            className={cn(
              "aspect-square rounded-md transition-colors",
              day.active ? "bg-white" : "bg-white/[0.06]"
            )}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-2 text-[10px] text-faint">
        <span className="h-2.5 w-2.5 rounded-sm bg-white/[0.06]" /> inactive
        <span className="ml-1 h-2.5 w-2.5 rounded-sm bg-white" /> active
      </div>
    </div>
  );
}
