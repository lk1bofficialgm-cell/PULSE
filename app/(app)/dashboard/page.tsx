import Link from "next/link";
import { Check, ChevronRight, Dumbbell, Droplets, ListChecks, Moon } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateTodaysWorkout, dateOnly } from "@/lib/workoutPlan";
import { QuoteBanner } from "@/components/quote-banner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const DAY_TITLES: Record<string, string> = {
  PUSH: "Push Day",
  PULL: "Pull Day",
  LEGS: "Leg Day",
  UPPER: "Upper Body",
  LOWER: "Lower Body",
  FULL_BODY: "Full Body",
  REST: "Rest Day",
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Up late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const today = dateOnly();

  const [user, workout, waterLog, habitLog, aheadOfMe] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    getOrCreateTodaysWorkout(userId),
    prisma.waterLog.findUnique({ where: { userId_date: { userId, date: today } } }),
    prisma.habitLog.findUnique({ where: { userId_date: { userId, date: today } } }),
    prisma.user.count({ where: { totalPoints: { gt: 0 } } }).then(async () => {
      const me = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { totalPoints: true } });
      return prisma.user.count({ where: { totalPoints: { gt: me.totalPoints } } });
    }),
  ]);

  const isRestDay = workout.dayType === "REST";
  const workoutDone = !!workout.finishedAt;
  const doneCount = workout.slots.filter((s) => s.completed).length;
  const consumedMl = waterLog?.consumedMl ?? 0;
  const goalMl = waterLog?.goalMl ?? user.waterGoalMl;
  const waterDone = consumedMl >= goalMl;
  const habitsDone = !!habitLog && habitLog.stretch && habitLog.sleep8h && habitLog.proteinGoal;
  const habitCount = habitLog ? [habitLog.stretch, habitLog.sleep8h, habitLog.proteinGoal].filter(Boolean).length : 0;

  const trainTaskDone = isRestDay ? true : workoutDone;
  const allDone = trainTaskDone && waterDone && habitsDone;
  const rank = aheadOfMe + 1;

  return (
    <div className="stagger flex flex-col gap-5">
      <div className="px-1">
        <h1 className="text-2xl font-black text-white">
          {greeting()}, {user.name.split(" ")[0]}
        </h1>
        <QuoteBanner />
      </div>

      {/* Today's focus */}
      <Link href="/workout">
        <Card className="transition-colors hover:border-white/25">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06]">
              {isRestDay ? <Moon size={22} className="text-muted" /> : <Dumbbell size={22} className="text-white" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">Today</p>
              <p className="text-lg font-bold text-white">{DAY_TITLES[workout.dayType]}</p>
              {!isRestDay && (
                <p className="text-sm text-muted">
                  {workoutDone ? "Completed — nice work" : `${doneCount} of ${workout.slots.length} exercises done`}
                </p>
              )}
            </div>
            {!isRestDay && !workoutDone ? (
              <Button size="sm">{doneCount > 0 ? "Continue" : "Start"}</Button>
            ) : (
              <ChevronRight size={18} className="text-faint" />
            )}
          </div>
        </Card>
      </Link>

      {/* Daily checklist */}
      <Card title={allDone ? "Perfect day — all done" : "Today's checklist"}>
        <div className="flex flex-col gap-1">
          <ChecklistRow
            href="/workout"
            icon={<Dumbbell size={16} />}
            label={isRestDay ? "Rest day — recovery counts" : "Finish your workout"}
            done={trainTaskDone}
          />
          <ChecklistRow
            href="/water"
            icon={<Droplets size={16} />}
            label={`Hit your water goal (${(consumedMl / 1000).toFixed(1)} / ${(goalMl / 1000).toFixed(1)} L)`}
            done={waterDone}
          />
          <ChecklistRow
            href="/water"
            icon={<ListChecks size={16} />}
            label={`Daily habits (${habitCount}/3)`}
            done={habitsDone}
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatTile value={user.currentStreak} label="Day streak" />
        <StatTile value={user.totalPoints} label="Points" />
        <StatTile value={rank} label="Global rank" prefix="#" />
      </div>
    </div>
  );
}

function ChecklistRow({
  href,
  icon,
  label,
  done,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  done: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors hover:bg-white/[0.04]"
    >
      <span className={cn("shrink-0", done ? "text-white" : "text-faint")}>{icon}</span>
      <span className={cn("flex-1 text-sm font-medium", done ? "text-muted line-through decoration-white/30" : "text-white")}>
        {label}
      </span>
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
          done ? "border-white bg-white text-black" : "border-white/15 text-transparent"
        )}
      >
        <Check size={11} strokeWidth={3.5} />
      </span>
    </Link>
  );
}

function StatTile({ value, label, prefix }: { value: number; label: string; prefix?: string }) {
  return (
    <Card className="p-4 text-center">
      <p className="text-2xl font-black text-white">
        {prefix}
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted">{label}</p>
    </Card>
  );
}
