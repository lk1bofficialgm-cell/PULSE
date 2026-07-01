import { PrismaClient, FitnessLevel } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { muscleGroups, exercises } from "./seed-data/exercises";
import { templates } from "./seed-data/workoutTemplates";
import { badges } from "./seed-data/badges";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding muscle groups...");
  const muscleGroupByName = new Map<string, string>();
  for (const name of muscleGroups) {
    const mg = await prisma.muscleGroup.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    muscleGroupByName.set(name, mg.id);
  }

  console.log("Seeding exercises...");
  const exerciseIdByNameAndDayType = new Map<string, string>();
  for (const ex of exercises) {
    const muscleGroupId = muscleGroupByName.get(ex.muscleGroup);
    if (!muscleGroupId) throw new Error(`Unknown muscle group: ${ex.muscleGroup}`);
    const created = await prisma.exercise.upsert({
      where: { name_dayType: { name: ex.name, dayType: ex.dayType } },
      update: {
        muscleGroupId,
        equipment: ex.equipment,
        defaultSets: ex.sets,
        defaultReps: ex.reps,
        restSeconds: ex.rest,
        instructions: ex.instructions,
        videoUrl: ex.videoUrl ?? null,
      },
      create: {
        name: ex.name,
        muscleGroupId,
        equipment: ex.equipment,
        dayType: ex.dayType,
        defaultSets: ex.sets,
        defaultReps: ex.reps,
        restSeconds: ex.rest,
        instructions: ex.instructions,
        videoUrl: ex.videoUrl,
      },
    });
    exerciseIdByNameAndDayType.set(`${ex.name}::${ex.dayType}`, created.id);
  }

  console.log("Seeding workout templates...");
  for (const level of Object.keys(templates) as (keyof typeof templates)[]) {
    for (const day of templates[level]) {
      const template = await prisma.workoutTemplate.upsert({
        where: { fitnessLevel_dayOfWeek: { fitnessLevel: level as FitnessLevel, dayOfWeek: day.dayOfWeek } },
        update: { dayType: day.dayType as never, label: day.label },
        create: {
          fitnessLevel: level as FitnessLevel,
          dayOfWeek: day.dayOfWeek,
          dayType: day.dayType as never,
          label: day.label,
        },
      });

      // Re-create slots fresh each run for idempotency.
      await prisma.templateSlot.deleteMany({ where: { templateId: template.id } });

      for (let i = 0; i < day.exercises.length; i++) {
        const exerciseName = day.exercises[i];
        const key = `${exerciseName}::${day.dayType}`;
        const exerciseId = exerciseIdByNameAndDayType.get(key);
        if (!exerciseId) {
          throw new Error(`Exercise "${exerciseName}" not found in pool "${day.dayType}"`);
        }
        const exerciseSeed = exercises.find((e) => e.name === exerciseName && e.dayType === day.dayType)!;
        await prisma.templateSlot.create({
          data: {
            templateId: template.id,
            order: i,
            defaultExerciseId: exerciseId,
            sets: exerciseSeed.sets,
            reps: exerciseSeed.reps,
            restSeconds: exerciseSeed.rest,
          },
        });
      }
    }
  }

  // Remove retired exercises (e.g. bodyweight moves cut from the catalog),
  // skipping any that old workout logs still reference.
  for (const name of ["Plank"]) {
    const retired = await prisma.exercise.findMany({ where: { name } });
    for (const ex of retired) {
      const inUse =
        (await prisma.workoutSlot.count({ where: { chosenExerciseId: ex.id } })) > 0 ||
        (await prisma.templateSlot.count({ where: { defaultExerciseId: ex.id } })) > 0;
      if (!inUse) {
        await prisma.exercise.delete({ where: { id: ex.id } });
      }
    }
  }

  console.log("Seeding badges...");
  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { key: badge.key },
      update: { name: badge.name, description: badge.description, icon: badge.icon },
      create: badge,
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
