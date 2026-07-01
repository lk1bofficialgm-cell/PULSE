import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function NeonCard({
  children,
  className,
  glow = "soft",
}: {
  children: ReactNode;
  className?: string;
  glow?: "soft" | "pink" | "purple" | "none";
}) {
  const glowClass =
    glow === "pink" ? "shadow-glow-pink" : glow === "purple" ? "shadow-glow-purple" : glow === "soft" ? "shadow-glow-soft" : "";

  return (
    <div className={cn("rounded-2xl p-[1px] bg-gradient-to-br from-pulse-pink/50 via-pulse-purple/40 to-pulse-purple/10", glowClass)}>
      <div className={cn("rounded-2xl bg-pulse-surface/90 backdrop-blur-sm p-5", className)}>{children}</div>
    </div>
  );
}
