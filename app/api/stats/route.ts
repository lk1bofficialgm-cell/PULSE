import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, isErrorResponse } from "@/lib/api-utils";
import { startOfIsoWeek } from "@/lib/points";
import { getOrCreateWeekPlan } from "@/lib/workoutPlan";

interface WeekCount {
  week: Date;
  count: number;
}

interface ActivityDay {
  day: Date;
}

export async function GET() {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const weekStart = startOfIsoWeek(new Date());

  const [
    user,
    finishedWorkoutsCount,
    workoutsPerWeek,
    activityDays,
    userBadges,
    weekPlan,
    trainedThisWeek,
    waterGoalsThisWeek,
  ] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.workoutLog.count({ where: { userId, finishedAt: { not: null } } }),
    prisma.$queryRaw<WeekCount[]>`
      SELECT date_trunc('week', "date")::date AS week, COUNT(*)::int AS count
      FROM "WorkoutLog"
      WHERE "userId" = ${userId} AND "finishedAt" IS NOT NULL
        AND "date" >= CURRENT_DATE - INTERVAL '8 weeks'
      GROUP BY 1 ORDER BY 1 ASC
    `,
    prisma.$queryRaw<ActivityDay[]>`
      SELECT DISTINCT d::date AS day FROM (
        SELECT "date" AS d FROM "WorkoutLog"
          WHERE "userId" = ${userId} AND "finishedAt" IS NOT NULL AND "date" >= CURRENT_DATE - INTERVAL '30 days'
        UNION
        SELECT "date" AS d FROM "WaterLog"
          WHERE "userId" = ${userId} AND "goalHitAwarded" = true AND "date" >= CURRENT_DATE - INTERVAL '30 days'
        UNION
        SELECT "date" AS d FROM "HabitLog"
          WHERE "userId" = ${userId} AND stretch AND "sleep8h" AND "proteinGoal" AND "date" >= CURRENT_DATE - INTERVAL '30 days'
      ) t ORDER BY day ASC
    `,
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    }),
    getOrCreateWeekPlan(userId),
    prisma.workoutLog.count({
      where: { userId, finishedAt: { not: null }, date: { gte: weekStart } },
    }),
    prisma.waterLog.count({
      where: { userId, goalHitAwarded: true, date: { gte: weekStart } },
    }),
  ]);

  return NextResponse.json({
    totals: {
      totalPoints: user.totalPoints,
      totalWorkouts: finishedWorkoutsCount,
      longestStreak: user.longestStreak,
      currentStreak: user.currentStreak,
    },
    thisWeek: {
      plannedDays: weekPlan.filter((d) => d.dayType !== "REST").length,
      trainedDays: trainedThisWeek,
      waterGoalsHit: waterGoalsThisWeek,
    },
    workoutsPerWeek,
    activityDays: activityDays.map((d) => d.day),
    badges: userBadges.map((ub) => ub.badge),
  });
}
