import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, isErrorResponse, jsonError } from "@/lib/api-utils";
import { profileUpdateSchema } from "@/lib/validation";

const profileSelect = {
  id: true,
  email: true,
  name: true,
  username: true,
  avatarUrl: true,
  fitnessLevel: true,
  weightGoalKg: true,
  totalPoints: true,
  weeklyPoints: true,
  currentStreak: true,
  longestStreak: true,
} as const;

export async function GET() {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: profileSelect });
  return NextResponse.json({ user });
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
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "Validation failed", { issues: parsed.error.flatten() });

  const user = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
    select: profileSelect,
  });

  return NextResponse.json({ user });
}
