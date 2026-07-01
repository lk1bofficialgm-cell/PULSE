"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GlowButton } from "@/components/ui/glow-button";
import { ProgressBar } from "@/components/ui/progress-bar";

export function WaterQuickAdd({ initialGlasses, goal }: { initialGlasses: number; goal: number }) {
  const router = useRouter();
  const [glasses, setGlasses] = useState(initialGlasses);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function addGlass() {
    setError(null);
    try {
      const res = await fetch("/api/water", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setGlasses(data.waterLog.glasses);
      startTransition(() => router.refresh());
    } catch {
      setError("Couldn't log water — check your connection.");
    }
  }

  return (
    <div>
      <ProgressBar value={glasses} max={goal} label="Water today" />
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <GlowButton onClick={addGlass} disabled={pending} size="sm" className="mt-3">
        + 1 Glass
      </GlowButton>
    </div>
  );
}
