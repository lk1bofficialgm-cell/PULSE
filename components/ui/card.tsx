import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <div className={cn("rounded-3xl border border-line bg-surface p-5", className)}>
      {title && (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}
