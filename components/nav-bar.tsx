"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/workout", label: "Workout", icon: "💪" },
  { href: "/water", label: "Water", icon: "💧" },
  { href: "/leaderboard", label: "Rank", icon: "🏆" },
  { href: "/progress", label: "Progress", icon: "📈" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-40 border-t border-white/5 bg-pulse-bg/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-1 overflow-x-auto px-2 py-2 sm:justify-center sm:gap-6">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[56px] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-medium transition-colors sm:flex-row sm:gap-1.5 sm:text-sm",
                active ? "text-pulse-pink-light" : "text-pulse-muted hover:text-white"
              )}
            >
              <span className="text-lg sm:text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
