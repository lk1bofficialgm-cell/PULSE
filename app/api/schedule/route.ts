import { NextRequest, NextResponse } from "next/server";
import { requireUserId, isErrorResponse, jsonError } from "@/lib/api-utils";
import { schedulePatchSchema } from "@/lib/validation";
import {
  getOrCreateWeekPlan,
  setDayPlan,
  regenerateTodayIfUntouched,
  dateOnly,
} from "@/lib/workoutPlan";

export async function GET() {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const week = await getOrCreateWeekPlan(userId);
  return NextResponse.json({ week, todayDayOfWeek: dateOnly().getUTCDay() });
}

export async function PATCH(req: NextRequest) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }
  const parsed = schedulePatchSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "Validation failed", { issues: parsed.error.flatten() });

  await setDayPlan(userId, parsed.data.dayOfWeek, parsed.data.dayType);

  // If they changed today's plan and haven't started training, rebuild today's
  // workout to match. Progress is never discarded.
  if (parsed.data.dayOfWeek === dateOnly().getUTCDay()) {
    await regenerateTodayIfUntouched(userId);
  }

  const week = await getOrCreateWeekPlan(userId);
  return NextResponse.json({ week });
}
