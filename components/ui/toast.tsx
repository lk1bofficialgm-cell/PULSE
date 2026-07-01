"use client";

import { cn } from "@/lib/cn";

export function Toast({
  message,
  visible,
  onDismiss,
  variant = "info",
}: {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  variant?: "info" | "error";
}) {
  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 animate-fade-in-up">
      <div
        className={cn(
          "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-glow-pink backdrop-blur-md",
          variant === "error" ? "bg-red-500/90" : "bg-gradient-to-r from-pulse-pink to-pulse-purple"
        )}
      >
        <span>{message}</span>
        <button onClick={onDismiss} className="text-white/80 hover:text-white" aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  );
}
