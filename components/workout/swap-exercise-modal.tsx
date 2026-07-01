"use client";

import { useEffect, useState } from "react";
import type { WorkoutSlotView } from "./exercise-card";

interface Candidate {
  id: string;
  name: string;
  equipment: string;
  muscleGroup: { name: string };
}

export function SwapExerciseModal({
  slot,
  onClose,
  onSwapped,
}: {
  slot: WorkoutSlotView;
  onClose: () => void;
  onSwapped: (slotId: string, updatedSlot: WorkoutSlotView) => void;
}) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/workouts/slots/${slot.id}/swap`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setCandidates(data.candidates ?? []);
      })
      .catch(() => !cancelled && setError("Couldn't load alternatives. Check your connection."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slot.id]);

  async function handlePick(candidate: Candidate) {
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
      setSwappingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-pulse-surface p-5 shadow-glow-purple sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Swap: {slot.chosenExercise.name}</h3>
          <button onClick={onClose} className="text-pulse-muted hover:text-white" aria-label="Close">
            ✕
          </button>
        </div>

        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

        {loading ? (
          <p className="text-sm text-pulse-muted">Loading alternatives…</p>
        ) : candidates.length === 0 ? (
          <p className="text-sm text-pulse-muted">No other exercises available in this pool.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {candidates.map((c) => (
              <button
                key={c.id}
                onClick={() => handlePick(c)}
                disabled={swappingId !== null}
                className="flex flex-col items-start rounded-xl border border-white/5 bg-pulse-surface-2 px-4 py-3 text-left transition-colors hover:border-pulse-pink disabled:opacity-50"
              >
                <span className="font-medium text-white">{c.name}</span>
                <span className="text-xs text-pulse-muted">
                  {c.muscleGroup.name} · {c.equipment}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
