import { NextRequest, NextResponse } from "next/server";
import type { DayType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId, isErrorResponse, jsonError } from "@/lib/api-utils";
import { onboardingSchema } from "@/lib/validation";
import { DAY_TYPE_LABELS, regenerateTodayIfUntouched } from "@/lib/workoutPlan";

// Split pattern by number of training days per week.
const SPLITS: Record<number, DayType[]> = {
  1: ["FULL_BODY"],
  2: ["FULL_BODY", "FULL_BODY"],
  3: ["FULL_BODY", "FULL_BODY", "FULL_BODY"],
  4: ["UPPER", "LOWER", "PUSH", "PULL"],
  5: ["PUSH", "PULL", "LEGS", "UPPER", "LOWER"],
  6: ["PUSH", "PULL", "LEGS", "PUSH", "PULL", "LEGS"],
  7: ["PUSH", "PULL", "LEGS", "UPPER", "LOWER", "FULL_BODY", "FULL_BODY"],
};

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "Validation failed", { issues: parsed.error.flatten() });

  const { fitnessLevel, trainingDays, bottleMl, waterGoalMl } = parsed.data;
  const days = [...new Set(trainingDays)].sort((a, b) => a - b);
  const pattern = SPLITS[days.length] ?? SPLITS[3];

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { fitnessLevel, bottleMl, waterGoalMl, onboarded: true },
    });

    await tx.userDayPlan.deleteMany({ where: { userId } });
    let trainIndex = 0;
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const isTraining = days.includes(dayOfWeek);
      const dayType = isTraining ? pattern[trainIndex++ % pattern.length] : "REST";
      await tx.userDayPlan.create({
        data: { userId, dayOfWeek, dayType, label: DAY_TYPE_LABELS[dayType] },
      });
    }
  });

  await regenerateTodayIfUntouched(userId);

  return NextResponse.json({ ok: true });
}
