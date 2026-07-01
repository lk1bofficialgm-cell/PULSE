import { prisma } from "@/lib/prisma";
import type { DayType, FitnessLevel, UserDayPlan } from "@prisma/client";

export function dateOnly(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export const DAY_TYPE_LABELS: Record<DayType, string> = {
  PUSH: "Push Day",
  PULL: "Pull Day",
  LEGS: "Leg Day",
  UPPER: "Upper Body",
  LOWER: "Lower Body",
  FULL_BODY: "Full Body",
  REST: "Rest Day",
};

// Sensible default exercise picks per day type, used when a user's schedule
// includes a day type that their fitness level's template doesn't cover.
const FALLBACK_PICKS: Record<Exclude<DayType, "REST">, string[]> = {
  PUSH: ["Chest Press Machine", "Incline Dumbbell Press", "Shoulder Press Machine", "Dumbbell Lateral Raise", "Pec Deck Fly", "Cable Triceps Pushdown"],
  PULL: ["Lat Pulldown", "Seated Cable Row", "Chest-Supported Row Machine", "Face Pull", "Dumbbell Bicep Curl", "Hammer Curl"],
  LEGS: ["Leg Press", "Smith Machine Squat", "Leg Extension", "Seated Leg Curl", "Walking Dumbbell Lunge", "Standing Calf Raise Machine"],
  UPPER: ["Chest Press Machine", "Lat Pulldown", "Shoulder Press Machine", "Seated Cable Row", "Dumbbell Bicep Curl", "Cable Triceps Pushdown"],
  LOWER: ["Leg Press", "Leg Extension", "Seated Leg Curl", "Hip Thrust Machine", "Standing Calf Raise Machine", "Hip Abductor Machine"],
  FULL_BODY: ["Leg Press", "Chest Press Machine", "Lat Pulldown", "Shoulder Press Machine", "Seated Cable Row", "Ab Crunch Machine"],
};

const workoutLogInclude = {
  slots: {
    orderBy: { order: "asc" as const },
    include: {
      chosenExercise: { include: { muscleGroup: true } },
    },
  },
};

/**
 * The user's editable week. Lazily initialized from their fitness level's
 * default template the first time it's requested.
 */
export async function getOrCreateWeekPlan(userId: string): Promise<UserDayPlan[]> {
  const existing = await prisma.userDayPlan.findMany({
    where: { userId },
    orderBy: { dayOfWeek: "asc" },
  });
  if (existing.length === 7) return existing;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const templates = await prisma.workoutTemplate.findMany({
    where: { fitnessLevel: user.fitnessLevel },
  });
  const byDay = new Map(templates.map((t) => [t.dayOfWeek, t]));
  const have = new Set(existing.map((p) => p.dayOfWeek));

  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    if (have.has(dayOfWeek)) continue;
    const template = byDay.get(dayOfWeek);
    await prisma.userDayPlan.create({
      data: {
        userId,
        dayOfWeek,
        dayType: template?.dayType ?? "REST",
        label: template?.label ?? "Rest Day",
      },
    });
  }

  return prisma.userDayPlan.findMany({ where: { userId }, orderBy: { dayOfWeek: "asc" } });
}

export async function setDayPlan(userId: string, dayOfWeek: number, dayType: DayType) {
  await getOrCreateWeekPlan(userId);
  return prisma.userDayPlan.update({
    where: { userId_dayOfWeek: { userId, dayOfWeek } },
    data: { dayType, label: DAY_TYPE_LABELS[dayType] },
  });
}

/**
 * Ordered exercise slot definitions for a (fitnessLevel, dayType) pair —
 * from the level's template when one covers this day type, otherwise from
 * the curated fallback picks in the pool.
 */
async function buildSlotDefs(fitnessLevel: FitnessLevel, dayType: DayType) {
  if (dayType === "REST") return [];

  const template = await prisma.workoutTemplate.findFirst({
    where: { fitnessLevel, dayType },
    include: { slots: { orderBy: { order: "asc" } } },
  });
  if (template && template.slots.length > 0) {
    return template.slots.map((slot) => ({
      exerciseId: slot.defaultExerciseId,
      sets: slot.sets,
      reps: slot.reps,
      restSeconds: slot.restSeconds,
    }));
  }

  const picks = FALLBACK_PICKS[dayType];
  const count = fitnessLevel === "BEGINNER" ? 5 : 6;
  const exercises = await prisma.exercise.findMany({
    where: { dayType, name: { in: picks } },
  });
  const byName = new Map(exercises.map((e) => [e.name, e]));
  return picks
    .slice(0, count)
    .map((name) => byName.get(name))
    .filter((e) => e !== undefined)
    .map((e) => ({
      exerciseId: e.id,
      sets: e.defaultSets,
      reps: e.defaultReps,
      restSeconds: e.restSeconds,
    }));
}

export async function getOrCreateTodaysWorkout(userId: string, date: Date = new Date()) {
  const today = dateOnly(date);
  const dayOfWeek = today.getUTCDay();

  const existing = await prisma.workoutLog.findUnique({
    where: { userId_date: { userId, date: today } },
    include: workoutLogInclude,
  });
  if (existing) return existing;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const plan = await getOrCreateWeekPlan(userId);
  const todayPlan = plan.find((p) => p.dayOfWeek === dayOfWeek)!;
  const slotDefs = await buildSlotDefs(user.fitnessLevel, todayPlan.dayType);

  return prisma.workoutLog.create({
    data: {
      userId,
      date: today,
      dayType: todayPlan.dayType,
      slots: {
        create: slotDefs.map((def, i) => ({
          order: i,
          chosenExerciseId: def.exerciseId,
          sets: def.sets,
          reps: def.reps,
          restSeconds: def.restSeconds,
        })),
      },
    },
    include: workoutLogInclude,
  });
}

/**
 * Rebuild today's workout after the user changes today's day type — but only
 * when nothing has been completed yet, so progress is never wiped.
 */
export async function regenerateTodayIfUntouched(userId: string, date: Date = new Date()) {
  const today = dateOnly(date);
  const log = await prisma.workoutLog.findUnique({
    where: { userId_date: { userId, date: today } },
    include: { slots: true },
  });
  if (!log) return;
  if (log.finishedAt || log.slots.some((s) => s.completed)) return;
  await prisma.workoutLog.delete({ where: { id: log.id } });
}
