"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function TopHeader({ username }: { username: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-pulse-bg/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="bg-gradient-to-r from-pulse-pink to-pulse-purple bg-clip-text text-lg font-black text-transparent">
          PULSE
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-pulse-muted">@{username}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs font-medium text-pulse-muted hover:text-white"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
