import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId, isErrorResponse, jsonError } from "@/lib/api-utils";
import { dateOnly } from "@/lib/workoutPlan";
import { awardPoints, POINTS } from "@/lib/points";
import { updateStreak } from "@/lib/streaks";
import { evaluateBadges } from "@/lib/badges";
import { waterSchema } from "@/lib/validation";

const REMINDER_MS = 2 * 60 * 60 * 1000;

async function getTodayLog(userId: string) {
  const today = dateOnly();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const waterLog = await prisma.waterLog.upsert({
    where: { userId_date: { userId, date: today } },
    update: {},
    create: { userId, date: today, goalMl: user.waterGoalMl },
  });
  return { user, waterLog };
}

export async function GET() {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const { user, waterLog } = await getTodayLog(userId);

  const shouldRemind =
    !!waterLog.lastLoggedAt &&
    waterLog.consumedMl < waterLog.goalMl &&
    Date.now() - waterLog.lastLoggedAt.getTime() >= REMINDER_MS;

  return NextResponse.json({
    waterLog,
    bottleMl: user.bottleMl,
    shouldRemind,
  });
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }
  const parsed = waterSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "Validation failed", { issues: parsed.error.flatten() });

  const { waterLog: current } = await getTodayLog(userId);
  const increased = parsed.data.totalMl > current.consumedMl;
  let goalJustHit = false;

  await prisma.$transaction(async (tx) => {
    const updated = await tx.waterLog.update({
      where: { id: current.id },
      data: {
        consumedMl: parsed.data.totalMl,
        ...(increased ? { lastLoggedAt: new Date() } : {}),
      },
    });

    if (updated.consumedMl >= updated.goalMl && !updated.goalHitAwarded) {
      try {
        await tx.waterLog.update({
          where: { id: updated.id, goalHitAwarded: false },
          data: { goalHitAwarded: true },
        });
        await awardPoints(tx, userId, POINTS.WATER_GOAL, "WATER_GOAL", updated.id);
        goalJustHit = true;
      } catch (e) {
        if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")) {
          throw e;
        }
      }
    }
  });

  if (goalJustHit) {
    await updateStreak(userId, dateOnly());
    await evaluateBadges(userId);
  }

  const { user, waterLog } = await getTodayLog(userId);
  return NextResponse.json({ waterLog, bottleMl: user.bottleMl, goalJustHit });
}
