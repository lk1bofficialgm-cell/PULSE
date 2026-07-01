"use client";

import { cn } from "@/lib/cn";

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: T; label: string }[];
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <div className="inline-flex rounded-full bg-pulse-surface-2 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
            active === tab.key
              ? "bg-gradient-to-r from-pulse-pink to-pulse-purple text-white shadow-glow-pink"
              : "text-pulse-muted hover:text-white"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
