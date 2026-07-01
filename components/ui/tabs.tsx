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
    <div className="inline-flex rounded-full border border-line bg-surface p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-200",
            active === tab.key ? "bg-white text-black" : "text-muted hover:text-white"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
