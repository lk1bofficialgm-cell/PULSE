import { prisma } from "@/lib/prisma";

export async function evaluateBadges(userId: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const finishedWorkouts = await prisma.workoutLog.count({
    where: { userId, finishedAt: { not: null } },
  });
  const waterGoalsHit = await prisma.waterLog.count({
    where: { userId, goalHitAwarded: true },
  });

  const candidates: { key: string; met: boolean }[] = [
    { key: "STREAK_7", met: user.currentStreak >= 7 },
    { key: "STREAK_30", met: user.currentStreak >= 30 },
    { key: "WORKOUTS_10", met: finishedWorkouts >= 10 },
    { key: "WORKOUTS_50", met: finishedWorkouts >= 50 },
    { key: "WORKOUTS_100", met: finishedWorkouts >= 100 },
    { key: "WATER_30", met: waterGoalsHit >= 30 },
    { key: "POINTS_1000", met: user.totalPoints >= 1000 },
  ];

  const toGrant = candidates.filter((c) => c.met);
  if (toGrant.length === 0) return;

  const badges = await prisma.badge.findMany({
    where: { key: { in: toGrant.map((c) => c.key) } },
  });

  for (const badge of badges) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
      create: { userId, badgeId: badge.id },
      update: {},
    });
  }
}
