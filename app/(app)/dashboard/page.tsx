import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateTodaysWorkout } from "@/lib/workoutPlan";
import { dateOnly } from "@/lib/workoutPlan";
import { QuoteBanner } from "@/components/quote-banner";
import { NeonCard } from "@/components/ui/neon-card";
import { WaterQuickAdd } from "@/components/water-quick-add";
import { GlowButton } from "@/components/ui/glow-button";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [user, workout, waterLog] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    getOrCreateTodaysWorkout(userId),
    prisma.waterLog.upsert({
      where: { userId_date: { userId, date: dateOnly() } },
      update: {},
      create: { userId, date: dateOnly() },
    }),
  ]);

  const doneCount = workout.slots.filter((s) => s.completed).length;
  const isRestDay = workout.dayType === "REST";

  return (
    <div className="flex flex-col gap-5">
      <QuoteBanner />

      <NeonCard glow="pink">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-pulse-muted">Today&apos;s Workout</p>
            <p className="text-lg font-bold text-white">
              {isRestDay ? "Rest Day" : `${workout.dayType.replace("_", " ")} Day`}
            </p>
            {!isRestDay && (
              <p className="text-sm text-pulse-pink-light">
                {doneCount}/{workout.slots.length} exercises done
              </p>
            )}
          </div>
          <Link href="/workout">
            <GlowButton size="sm">{isRestDay ? "View" : "Start"}</GlowButton>
          </Link>
        </div>
      </NeonCard>

      <NeonCard>
        <p className="mb-2 text-xs uppercase tracking-wide text-pulse-muted">Hydration</p>
        <WaterQuickAdd initialGlasses={waterLog.glasses} goal={8} />
      </NeonCard>

      <div className="grid grid-cols-2 gap-4">
        <NeonCard glow="purple" className="text-center">
          <p className="text-3xl font-black text-white">{user.currentStreak}</p>
          <p className="text-xs text-pulse-muted">Day Streak 🔥</p>
        </NeonCard>
        <NeonCard glow="purple" className="text-center">
          <p className="text-3xl font-black text-white">{user.totalPoints}</p>
          <p className="text-xs text-pulse-muted">Total Points ⭐</p>
        </NeonCard>
      </div>
    </div>
  );
}
