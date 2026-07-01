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
  avatarUrl: z.string().min(1).max(500).optional(),
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
