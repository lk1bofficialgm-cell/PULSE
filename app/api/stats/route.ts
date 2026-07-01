import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, isErrorResponse } from "@/lib/api-utils";

interface WeekCount {
  week: Date;
  count: number;
}

interface DayPoints {
  day: Date;
  points: number;
}

interface ActivityDay {
  day: Date;
}

export async function GET() {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const [user, finishedWorkoutsCount, workoutsPerWeek, pointsOverTime, waterGoalsPerWeek, activityDays, userBadges] =
    await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      prisma.workoutLog.count({ where: { userId, finishedAt: { not: null } } }),
      prisma.$queryRaw<WeekCount[]>`
        SELECT date_trunc('week', "date")::date AS week, COUNT(*)::int AS count
        FROM "WorkoutLog"
        WHERE "userId" = ${userId} AND "finishedAt" IS NOT NULL
        GROUP BY 1 ORDER BY 1 ASC
      `,
      prisma.$queryRaw<DayPoints[]>`
        SELECT date_trunc('day', "createdAt")::date AS day, SUM(points)::int AS points
        FROM "PointsLedger"
        WHERE "userId" = ${userId} AND "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY 1 ORDER BY 1 ASC
      `,
      prisma.$queryRaw<WeekCount[]>`
        SELECT date_trunc('week', "date")::date AS week, COUNT(*)::int AS count
        FROM "WaterLog"
        WHERE "userId" = ${userId} AND "goalHitAwarded" = true
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
    ]);

  return NextResponse.json({
    totals: {
      totalPoints: user.totalPoints,
      totalWorkouts: finishedWorkoutsCount,
      longestStreak: user.longestStreak,
      currentStreak: user.currentStreak,
    },
    workoutsPerWeek,
    pointsOverTime,
    waterGoalsPerWeek,
    activityDays: activityDays.map((d) => d.day),
    badges: userBadges.map((ub) => ub.badge),
  });
}
