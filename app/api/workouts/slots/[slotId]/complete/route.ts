import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, isErrorResponse, jsonError } from "@/lib/api-utils";
import { completeSlotSchema } from "@/lib/validation";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const { slotId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }
  const parsed = completeSlotSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "Validation failed", { issues: parsed.error.flatten() });

  const slot = await prisma.workoutSlot.findUnique({
    where: { id: slotId },
    include: { workoutLog: true },
  });
  if (!slot || slot.workoutLog.userId !== userId) {
    return jsonError(404, "Exercise slot not found");
  }

  const updated = await prisma.workoutSlot.update({
    where: { id: slotId },
    data: {
      completed: parsed.data.completed,
      completedAt: parsed.data.completed ? new Date() : null,
    },
  });

  return NextResponse.json({ slot: updated });
}
