import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, isErrorResponse } from "@/lib/api-utils";
import { getOrCreateTodaysWorkout, getWeekTemplates } from "@/lib/workoutPlan";

export async function GET() {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const [workout, week] = await Promise.all([
    getOrCreateTodaysWorkout(userId),
    getWeekTemplates(user.fitnessLevel),
  ]);

  return NextResponse.json({ workout, week, todayDayOfWeek: new Date().getUTCDay() });
}
