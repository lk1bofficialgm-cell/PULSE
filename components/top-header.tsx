"use client";

import Link from "next/link";
import { Flame } from "lucide-react";

export function TopHeader({
  streak,
  avatarUrl,
}: {
  streak: number;
  avatarUrl: string | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
        <Link href="/dashboard" className="text-lg font-black tracking-[0.25em] text-white">
          PULSE
        </Link>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-sm font-bold text-white">
            <Flame size={16} className={streak > 0 ? "text-white" : "text-faint"} />
            {streak}
          </span>
          <Link
            href="/profile"
            className="block h-8 w-8 overflow-hidden rounded-full border border-line bg-surface-2 transition-transform active:scale-90"
            aria-label="Profile"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs text-muted">☺</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
