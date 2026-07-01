import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(60),
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  fitnessLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  fitnessLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  weightGoalKg: z.number().positive().max(500).nullable().optional(),
  // Preset path or a compressed data URL (client resizes before upload)
  avatarUrl: z.string().min(1).max(400_000).optional(),
  bottleMl: z.number().int().min(100).max(4000).optional(),
  waterGoalMl: z.number().int().min(500).max(8000).optional(),
});

export const swapExerciseSchema = z.object({
  newExerciseId: z.string().min(1),
});

export const completeSlotSchema = z.object({
  completed: z.boolean(),
});

export const habitsSchema = z.object({
  stretch: z.boolean().optional(),
  sleep8h: z.boolean().optional(),
  proteinGoal: z.boolean().optional(),
});

export const waterSchema = z.object({
  totalMl: z.number().int().min(0).max(12_000),
});

export const dayTypeSchema = z.enum(["PUSH", "PULL", "LEGS", "UPPER", "LOWER", "FULL_BODY", "REST"]);

export const schedulePatchSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  dayType: dayTypeSchema,
});

export const onboardingSchema = z.object({
  fitnessLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  trainingDays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  bottleMl: z.number().int().min(100).max(4000),
  waterGoalMl: z.number().int().min(500).max(8000),
});
