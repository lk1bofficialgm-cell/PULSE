import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { GlowButton } from "@/components/ui/glow-button";
import { NeonCard } from "@/components/ui/neon-card";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-3 bg-gradient-to-r from-pulse-pink to-pulse-purple bg-clip-text text-5xl font-black tracking-tight text-transparent">
          PULSE
        </h1>
        <p className="mb-8 text-pulse-muted">
          Auto-generated workouts, water &amp; habit tracking, streaks, and a global leaderboard — all in one place.
        </p>

        <NeonCard glow="purple" className="mb-8 text-left">
          <ul className="space-y-2 text-sm text-white">
            <li>💪 A daily split built around your fitness level</li>
            <li>💧 Water &amp; habit tracking with streaks</li>
            <li>🏆 Compete on a global weekly &amp; all-time leaderboard</li>
            <li>📈 Neon-clean progress charts</li>
          </ul>
        </NeonCard>

        <div className="flex flex-col gap-3">
          <Link href="/signup">
            <GlowButton className="w-full" size="lg">
              Get Started
            </GlowButton>
          </Link>
          <Link href="/login">
            <GlowButton variant="secondary" className="w-full" size="lg">
              Log In
            </GlowButton>
          </Link>
        </div>
      </div>
    </main>
  );
}
