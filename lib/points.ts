import type { Prisma, PointsReason } from "@prisma/client";

export const POINTS = {
  WORKOUT: 50,
  WATER_GOAL: 20,
  STREAK_DAY: 10,
} as const;

type Tx = Prisma.TransactionClient;

function startOfIsoWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function isSameIsoWeek(a: Date, b: Date): boolean {
  return startOfIsoWeek(a).getTime() === startOfIsoWeek(b).getTime();
}

export async function awardPoints(
  tx: Tx,
  userId: string,
  points: number,
  reason: PointsReason,
  refId?: string
): Promise<void> {
  await tx.pointsLedger.create({ data: { userId, points, reason, refId } });
  await incrementUserPoints(tx, userId, points);
}

async function incrementUserPoints(tx: Tx, userId: string, points: number): Promise<void> {
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  const currentWeekStart = startOfIsoWeek(new Date());
  const needsRollover = !isSameIsoWeek(user.weekAnchor, currentWeekStart);

  await tx.user.update({
    where: { id: userId },
    data: {
      totalPoints: { increment: points },
      weeklyPoints: needsRollover ? points : { increment: points },
      ...(needsRollover ? { weekAnchor: currentWeekStart } : {}),
    },
  });
}

export { startOfIsoWeek, isSameIsoWeek };
