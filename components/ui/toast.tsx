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
          "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium shadow-xl shadow-black/50 backdrop-blur-md",
          variant === "error"
            ? "border border-red-500/30 bg-surface-2 text-red-300"
            : "bg-white text-black"
        )}
      >
        <span>{message}</span>
        <button
          onClick={onDismiss}
          className={variant === "error" ? "text-red-300/70 hover:text-red-300" : "text-black/50 hover:text-black"}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
