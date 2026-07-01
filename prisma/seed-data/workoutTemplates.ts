import type { DayTypeKey } from "./exercises";

export type TemplateDayType = DayTypeKey | "REST";

export interface TemplateDaySeed {
  dayOfWeek: number; // 0=Sunday .. 6=Saturday
  dayType: TemplateDayType;
  label: string;
  exercises: string[]; // exercise names, looked up against the pool matching dayType
}

export const templates: Record<
  "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
  TemplateDaySeed[]
> = {
  BEGINNER: [
    { dayOfWeek: 0, dayType: "REST", label: "Rest Day", exercises: [] },
    {
      dayOfWeek: 1,
      dayType: "FULL_BODY",
      label: "Full Body A",
      exercises: ["Leg Press", "Chest Press Machine", "Lat Pulldown", "Shoulder Press Machine", "Plank"],
    },
    { dayOfWeek: 2, dayType: "REST", label: "Rest Day", exercises: [] },
    {
      dayOfWeek: 3,
      dayType: "FULL_BODY",
      label: "Full Body B",
      exercises: ["Leg Extension", "Seated Cable Row", "Dumbbell Bicep Curl", "Cable Triceps Pushdown", "Plank"],
    },
    { dayOfWeek: 4, dayType: "REST", label: "Rest Day", exercises: [] },
    {
      dayOfWeek: 5,
      dayType: "FULL_BODY",
      label: "Full Body C",
      exercises: ["Leg Press", "Chest Press Machine", "Lat Pulldown", "Shoulder Press Machine", "Cable Triceps Pushdown"],
    },
    { dayOfWeek: 6, dayType: "REST", label: "Rest Day", exercises: [] },
  ],
  INTERMEDIATE: [
    { dayOfWeek: 0, dayType: "REST", label: "Rest Day", exercises: [] },
    {
      dayOfWeek: 1,
      dayType: "UPPER",
      label: "Upper Body",
      exercises: ["Chest Press Machine", "Lat Pulldown", "Shoulder Press Machine", "Seated Cable Row", "Dumbbell Bicep Curl"],
    },
    {
      dayOfWeek: 2,
      dayType: "LOWER",
      label: "Lower Body",
      exercises: ["Leg Press", "Leg Extension", "Seated Leg Curl", "Smith Machine Squat", "Standing Calf Raise Machine"],
    },
    { dayOfWeek: 3, dayType: "REST", label: "Rest Day", exercises: [] },
    {
      dayOfWeek: 4,
      dayType: "PUSH",
      label: "Push Day",
      exercises: ["Chest Press Machine", "Incline Dumbbell Press", "Shoulder Press Machine", "Dumbbell Lateral Raise", "Cable Triceps Pushdown"],
    },
    {
      dayOfWeek: 5,
      dayType: "PULL",
      label: "Pull Day",
      exercises: ["Lat Pulldown", "Seated Cable Row", "Assisted Pull-Up Machine", "Dumbbell Bicep Curl", "Face Pull"],
    },
    { dayOfWeek: 6, dayType: "REST", label: "Rest Day", exercises: [] },
  ],
  ADVANCED: [
    { dayOfWeek: 0, dayType: "REST", label: "Rest Day", exercises: [] },
    {
      dayOfWeek: 1,
      dayType: "PUSH",
      label: "Push Day",
      exercises: ["Chest Press Machine", "Incline Dumbbell Press", "Smith Machine Bench Press", "Shoulder Press Machine", "Dumbbell Lateral Raise", "Cable Triceps Pushdown"],
    },
    {
      dayOfWeek: 2,
      dayType: "PULL",
      label: "Pull Day",
      exercises: ["Lat Pulldown", "Seated Cable Row", "Assisted Pull-Up Machine", "Chest-Supported Row Machine", "Dumbbell Bicep Curl", "Face Pull"],
    },
    {
      dayOfWeek: 3,
      dayType: "LEGS",
      label: "Leg Day",
      exercises: ["Leg Press", "Smith Machine Squat", "Leg Extension", "Seated Leg Curl", "Walking Dumbbell Lunge", "Standing Calf Raise Machine"],
    },
    { dayOfWeek: 4, dayType: "REST", label: "Rest Day", exercises: [] },
    {
      dayOfWeek: 5,
      dayType: "UPPER",
      label: "Upper Body",
      exercises: ["Chest Press Machine", "Lat Pulldown", "Shoulder Press Machine", "Seated Cable Row", "Pec Deck Fly", "Face Pull"],
    },
    {
      dayOfWeek: 6,
      dayType: "LOWER",
      label: "Lower Body",
      exercises: ["Leg Press", "Leg Extension", "Seated Leg Curl", "Hip Thrust Machine", "Standing Calf Raise Machine"],
    },
  ],
};
