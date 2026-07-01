"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "motion/react";

/**
 * A draggable bottle: drag up/down inside the bottle to set how much of the
 * CURRENT bottle you've drunk. Fills bottom-up; completed bottles roll over.
 */
export function WaterBottle({
  fillFraction,
  onDragFill,
  onCommit,
}: {
  fillFraction: number; // 0..1 of the current bottle
  onDragFill: (fraction: number) => void;
  onCommit: () => void;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const fractionFromEvent = useCallback((clientY: number) => {
    const el = areaRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    // Map: bottom of bottle = 0, top = 1
    const raw = 1 - (clientY - rect.top) / rect.height;
    return Math.min(1, Math.max(0, raw));
  }, []);

  function handlePointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    onDragFill(fractionFromEvent(e.clientY));
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    onDragFill(fractionFromEvent(e.clientY));
  }

  function handlePointerUp() {
    if (!dragging) return;
    setDragging(false);
    onCommit();
  }

  const pct = Math.round(fillFraction * 100);

  return (
    <div
      ref={areaRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative mx-auto w-[170px] cursor-grab select-none active:cursor-grabbing"
      style={{ touchAction: "none" }}
      role="slider"
      aria-label="Water in current bottle"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <svg viewBox="0 0 120 260" className="w-full drop-shadow-2xl">
        <defs>
          <clipPath id="bottle-clip">
            <path d="M48 8 h24 v22 c0 4 14 10 16 22 l2 14 v170 a16 16 0 0 1 -16 16 h-28 a16 16 0 0 1 -16 -16 v-170 l2 -14 c2 -12 16 -18 16 -22 z" />
          </clipPath>
        </defs>

        {/* Water fill */}
        <g clipPath="url(#bottle-clip)">
          <motion.rect
            x="0"
            width="120"
            animate={{ y: 260 - 252 * fillFraction }}
            transition={dragging ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}
            height="260"
            fill="rgba(255,255,255,0.92)"
          />
          {/* Surface line */}
          <motion.rect
            x="0"
            width="120"
            height="3"
            animate={{ y: 260 - 252 * fillFraction }}
            transition={dragging ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}
            fill="rgba(255,255,255,0.5)"
          />
        </g>

        {/* Bottle outline */}
        <path
          d="M48 8 h24 v22 c0 4 14 10 16 22 l2 14 v170 a16 16 0 0 1 -16 16 h-28 a16 16 0 0 1 -16 -16 v-170 l2 -14 c2 -12 16 -18 16 -22 z"
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2.5"
        />
        {/* Cap */}
        <rect x="44" y="2" width="32" height="9" rx="3" fill="rgba(255,255,255,0.35)" />

        {/* Percent label — flips color depending on water level behind it */}
        <text
          x="60"
          y="150"
          textAnchor="middle"
          fontSize="22"
          fontWeight="800"
          fill={fillFraction > 0.48 ? "#0a0a0a" : "#ffffff"}
        >
          {pct}%
        </text>
      </svg>
    </div>
  );
}
