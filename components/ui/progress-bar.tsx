import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  max,
  className,
  label,
  unit,
}: {
  value: number;
  max: number;
  className?: string;
  label?: string;
  unit?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / Math.max(1, max)) * 100));

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="mb-2 flex justify-between text-xs text-muted">
          <span>{label}</span>
          <span className="font-medium text-white">
            {value}
            {unit ? ` ${unit}` : ""} / {max}
            {unit ? ` ${unit}` : ""}
          </span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="relative h-full rounded-full bg-white transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        >
          {pct > 0 && pct < 100 && <div className="shimmer absolute inset-0 rounded-full" />}
        </div>
      </div>
    </div>
  );
}
