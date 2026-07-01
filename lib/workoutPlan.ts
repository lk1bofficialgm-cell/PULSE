import { prisma } from "@/lib/prisma";
import type { FitnessLevel } from "@prisma/client";

export function dateOnly(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

const workoutLogInclude = {
  slots: {
    orderBy: { order: "asc" as const },
    include: {
      chosenExercise: { include: { muscleGroup: true } },
    },
  },
};

export async function getWeekTemplates(fitnessLevel: FitnessLevel) {
  const templates = await prisma.workoutTemplate.findMany({
    where: { fitnessLevel },
    orderBy: { dayOfWeek: "asc" },
  });
  // Reorder so the week reads Sunday(0)..Saturday(6) as stored; callers can rotate for display.
  return templates;
}

export async function getOrCreateTodaysWorkout(userId: string, date: Date = new Date()) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const today = dateOnly(date);
  const dayOfWeek = today.getUTCDay();

  const existing = await prisma.workoutLog.findUnique({
    where: { userId_date: { userId, date: today } },
    include: workoutLogInclude,
  });
  if (existing) return existing;

  const template = await prisma.workoutTemplate.findUnique({
    where: { fitnessLevel_dayOfWeek: { fitnessLevel: user.fitnessLevel, dayOfWeek } },
    include: { slots: { orderBy: { order: "asc" } } },
  });

  if (!template) {
    throw new Error(`No workout template found for ${user.fitnessLevel} on day ${dayOfWeek}`);
  }

  const created = await prisma.workoutLog.create({
    data: {
      userId,
      date: today,
      dayType: template.dayType,
      templateId: template.id,
      slots:
        template.dayType === "REST"
          ? undefined
          : {
              create: template.slots.map((slot) => ({
                order: slot.order,
                chosenExerciseId: slot.defaultExerciseId,
                sets: slot.sets,
                reps: slot.reps,
                restSeconds: slot.restSeconds,
              })),
            },
    },
    include: workoutLogInclude,
  });

  return created;
}
