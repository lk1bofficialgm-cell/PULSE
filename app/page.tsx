import Link from "next/link";
import { redirect } from "next/navigation";
import { Dumbbell, Droplets, Trophy, CalendarDays } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { Icon: CalendarDays, text: "A weekly plan built around you — every day editable" },
  { Icon: Dumbbell, text: "Machine-focused workouts with video demos for every move" },
  { Icon: Droplets, text: "Water tracking with your actual bottle" },
  { Icon: Trophy, text: "Streaks, points, and a global leaderboard" },
];

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="stagger w-full max-w-sm text-center">
        <h1 className="text-5xl font-black tracking-[0.3em] text-white">PULSE</h1>
        <p className="mt-3 text-muted">Train. Hydrate. Repeat. The daily routine you&apos;ll actually keep.</p>

        <div className="mt-10 flex flex-col gap-4 text-left">
          {FEATURES.map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface">
                <Icon size={18} className="text-white" />
              </span>
              <span className="text-sm text-white/90">{text}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <Link href="/signup">
            <Button className="w-full" size="lg">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="w-full" size="lg">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
