import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId, isErrorResponse } from "@/lib/api-utils";
import { dateOnly } from "@/lib/workoutPlan";
import { awardPoints, POINTS } from "@/lib/points";
import { updateStreak } from "@/lib/streaks";
import { evaluateBadges } from "@/lib/badges";

const WATER_GOAL = 8;
const REMINDER_MS = 2 * 60 * 60 * 1000;

export async function GET() {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const today = dateOnly();
  const waterLog = await prisma.waterLog.upsert({
    where: { userId_date: { userId, date: today } },
    update: {},
    create: { userId, date: today },
  });

  const shouldRemind =
    !!waterLog.lastLoggedAt &&
    waterLog.glasses < WATER_GOAL &&
    Date.now() - waterLog.lastLoggedAt.getTime() >= REMINDER_MS;

  return NextResponse.json({ waterLog, shouldRemind, goal: WATER_GOAL });
}

export async function POST() {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const today = dateOnly();
  let goalJustHit = false;

  await prisma.$transaction(async (tx) => {
    const waterLog = await tx.waterLog.upsert({
      where: { userId_date: { userId, date: today } },
      update: { glasses: { increment: 1 }, lastLoggedAt: new Date() },
      create: { userId, date: today, glasses: 1, lastLoggedAt: new Date() },
    });

    if (waterLog.glasses >= WATER_GOAL && !waterLog.goalHitAwarded) {
      try {
        await tx.waterLog.update({
          where: { id: waterLog.id, goalHitAwarded: false },
          data: { goalHitAwarded: true },
        });
        await awardPoints(tx, userId, POINTS.WATER_GOAL, "WATER_GOAL", waterLog.id);
        goalJustHit = true;
      } catch (e) {
        if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")) {
          throw e;
        }
      }
    }
  });

  if (goalJustHit) {
    await updateStreak(userId, today);
    await evaluateBadges(userId);
  }

  const waterLog = await prisma.waterLog.findUniqueOrThrow({
    where: { userId_date: { userId, date: today } },
  });

  return NextResponse.json({ waterLog, goal: WATER_GOAL });
}
