import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, isErrorResponse, jsonError } from "@/lib/api-utils";
import { dateOnly } from "@/lib/workoutPlan";
import { habitsSchema } from "@/lib/validation";
import { updateStreak } from "@/lib/streaks";
import { evaluateBadges } from "@/lib/badges";

export async function GET() {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const today = dateOnly();
  const habitLog = await prisma.habitLog.upsert({
    where: { userId_date: { userId, date: today } },
    update: {},
    create: { userId, date: today },
  });

  return NextResponse.json({ habitLog });
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
  const parsed = habitsSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "Validation failed", { issues: parsed.error.flatten() });

  const today = dateOnly();
  const habitLog = await prisma.habitLog.upsert({
    where: { userId_date: { userId, date: today } },
    update: parsed.data,
    create: { userId, date: today, ...parsed.data },
  });

  if (habitLog.stretch && habitLog.sleep8h && habitLog.proteinGoal) {
    await updateStreak(userId, today);
    await evaluateBadges(userId);
  }

  return NextResponse.json({ habitLog });
}
