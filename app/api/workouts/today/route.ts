import { NextResponse } from "next/server";
import { requireUserId, isErrorResponse } from "@/lib/api-utils";
import { getOrCreateTodaysWorkout, getOrCreateWeekPlan, dateOnly } from "@/lib/workoutPlan";

export async function GET() {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const [workout, week] = await Promise.all([
    getOrCreateTodaysWorkout(userId),
    getOrCreateWeekPlan(userId),
  ]);

  return NextResponse.json({ workout, week, todayDayOfWeek: dateOnly().getUTCDay() });
}
