"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, Droplets, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", Icon: Home },
  { href: "/workout", label: "Train", Icon: Dumbbell },
  { href: "/water", label: "Hydrate", Icon: Droplets },
  { href: "/progress", label: "Progress", Icon: TrendingUp },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-40 border-t border-line bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-stretch justify-around px-4 py-2">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-colors duration-200",
                active ? "text-white" : "text-faint hover:text-muted"
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-x-2 inset-y-0 rounded-2xl bg-white/[0.08]"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <Icon size={21} strokeWidth={active ? 2.4 : 1.8} className="relative" />
              <span className={cn("relative text-[10px] font-semibold tracking-wide", active && "text-white")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
