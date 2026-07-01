import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, isErrorResponse, jsonError } from "@/lib/api-utils";
import { swapExerciseSchema } from "@/lib/validation";

async function loadOwnedSlot(slotId: string, userId: string) {
  const slot = await prisma.workoutSlot.findUnique({
    where: { id: slotId },
    include: { workoutLog: true, chosenExercise: true },
  });
  if (!slot || slot.workoutLog.userId !== userId) return null;
  return slot;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const { slotId } = await params;
  const slot = await loadOwnedSlot(slotId, userId);
  if (!slot) return jsonError(404, "Exercise slot not found");

  const candidates = await prisma.exercise.findMany({
    where: {
      dayType: slot.workoutLog.dayType,
      NOT: { id: slot.chosenExerciseId },
    },
    include: { muscleGroup: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ candidates });
}

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
  const parsed = swapExerciseSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "Validation failed", { issues: parsed.error.flatten() });

  const slot = await loadOwnedSlot(slotId, userId);
  if (!slot) return jsonError(404, "Exercise slot not found");

  const newExercise = await prisma.exercise.findUnique({ where: { id: parsed.data.newExerciseId } });
  if (!newExercise || newExercise.dayType !== slot.workoutLog.dayType) {
    return jsonError(400, "Exercise is not in the same muscle-group pool for this workout");
  }

  const updated = await prisma.workoutSlot.update({
    where: { id: slotId },
    data: {
      chosenExerciseId: newExercise.id,
      sets: newExercise.defaultSets,
      reps: newExercise.defaultReps,
      restSeconds: newExercise.restSeconds,
    },
    include: { chosenExercise: { include: { muscleGroup: true } } },
  });

  return NextResponse.json({ slot: updated });
}
