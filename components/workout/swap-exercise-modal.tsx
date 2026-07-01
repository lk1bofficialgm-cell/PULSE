"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import type { WorkoutSlotView } from "./exercise-card";

interface Candidate {
  id: string;
  name: string;
  equipment: string;
  defaultSets: number;
  defaultReps: string;
  videoUrl: string | null;
  muscleGroup: { name: string };
}

export function SwapExerciseSheet({
  slot,
  onClose,
  onSwapped,
  onDemo,
}: {
  slot: WorkoutSlotView | null;
  onClose: () => void;
  onSwapped: (slotId: string, updatedSlot: WorkoutSlotView) => void;
  onDemo: (exercise: { name: string; videoUrl: string | null }) => void;
}) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const slotId = slot?.id ?? null;

  useEffect(() => {
    if (!slotId) return;
    let cancelled = false;
    fetch(`/api/workouts/slots/${slotId}/swap`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setCandidates(data.candidates ?? []);
      })
      .catch(() => !cancelled && setError("Couldn't load alternatives. Check your connection."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
      setCandidates([]);
      setLoading(true);
    };
  }, [slotId]);

  async function handlePick(candidate: Candidate) {
    if (!slot) return;
    setSwappingId(candidate.id);
    setError(null);
    try {
      const res = await fetch(`/api/workouts/slots/${slot.id}/swap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newExerciseId: candidate.id }),
      });
      if (!res.ok) throw new Error("Swap failed");
      const data = await res.json();
      onSwapped(slot.id, data.slot);
      onClose();
    } catch {
      setError("Couldn't swap that exercise. Please try again.");
    } finally {
      setSwappingId(null);
    }
  }

  // Group candidates by muscle group for a scannable list
  const groups = new Map<string, Candidate[]>();
  for (const c of candidates) {
    const key = c.muscleGroup.name;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(c);
  }

  return (
    <Sheet open={!!slot} onClose={onClose} title={slot ? `Swap ${slot.chosenExercise.name}` : ""}>
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      {loading && candidates.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">Loading alternatives…</p>
      ) : candidates.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No other exercises in this pool.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {[...groups.entries()].map(([groupName, items]) => (
            <div key={groupName}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
                {groupName}
              </p>
              <div className="flex flex-col gap-2">
                {items.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3"
                  >
                    <button
                      onClick={() => handlePick(c)}
                      disabled={swappingId !== null}
                      className="min-w-0 flex-1 text-left disabled:opacity-50"
                    >
                      <span className="block truncate font-semibold text-white">
                        {swappingId === c.id ? "Swapping…" : c.name}
                      </span>
                      <span className="block text-xs text-muted">
                        {c.equipment} · {c.defaultSets} × {c.defaultReps}
                      </span>
                    </button>
                    <button
                      onClick={() => onDemo({ name: c.name, videoUrl: c.videoUrl })}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-white transition-all hover:border-white/30 active:scale-90"
                      aria-label={`Watch ${c.name} demo`}
                    >
                      <Play size={12} className="ml-0.5" fill="currentColor" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}
