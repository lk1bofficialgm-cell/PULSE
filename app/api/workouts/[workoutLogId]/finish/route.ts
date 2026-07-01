import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId, isErrorResponse, jsonError } from "@/lib/api-utils";
import { awardPoints, POINTS } from "@/lib/points";
import { updateStreak } from "@/lib/streaks";
import { evaluateBadges } from "@/lib/badges";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ workoutLogId: string }> }
) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const { workoutLogId } = await params;

  const workoutLog = await prisma.workoutLog.findUnique({ where: { id: workoutLogId } });
  if (!workoutLog || workoutLog.userId !== userId) {
    return jsonError(404, "Workout not found");
  }

  if (!workoutLog.finishedAt) {
    try {
      await prisma.$transaction(async (tx) => {
        const updated = await tx.workoutLog.update({
          where: { id: workoutLogId, pointsAwarded: false },
          data: { finishedAt: new Date() },
        });
        await awardPoints(tx, userId, POINTS.WORKOUT, "WORKOUT_FINISHED", updated.id);
        await tx.workoutLog.update({ where: { id: workoutLogId }, data: { pointsAwarded: true } });
      });
    } catch (e) {
      // P2025: no row matched { id, pointsAwarded: false } - a concurrent
      // request already finished this workout. Treat as already-finished.
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")) {
        throw e;
      }
    }

    await updateStreak(userId, workoutLog.date);
    await evaluateBadges(userId);
  }

  const [user, finished] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.workoutLog.findUniqueOrThrow({ where: { id: workoutLogId } }),
  ]);

  return NextResponse.json({
    workout: finished,
    totalPoints: user.totalPoints,
    weeklyPoints: user.weeklyPoints,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
  });
}
