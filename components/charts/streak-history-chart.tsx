import { cn } from "@/lib/cn";

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function StreakHistoryChart({ activityDays }: { activityDays: string[] }) {
  const activeSet = new Set(activityDays.map((d) => d.slice(0, 10)));

  const days: { key: string; active: boolean }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = dateKey(d);
    days.push({ key, active: activeSet.has(key) });
  }

  return (
    <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-[repeat(15,minmax(0,1fr))]">
      {days.map((day) => (
        <div
          key={day.key}
          title={day.key}
          className={cn(
            "aspect-square rounded-md",
            day.active ? "bg-gradient-to-br from-pulse-pink to-pulse-purple shadow-glow-pink" : "bg-white/5"
          )}
        />
      ))}
    </div>
  );
}
