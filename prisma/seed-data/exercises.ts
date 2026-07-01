export const muscleGroups = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
] as const;

export type MuscleGroupName = (typeof muscleGroups)[number];

export type DayTypeKey =
  | "PUSH"
  | "PULL"
  | "LEGS"
  | "UPPER"
  | "LOWER"
  | "FULL_BODY";

export interface ExerciseSeed {
  name: string;
  muscleGroup: MuscleGroupName;
  equipment: string;
  dayType: DayTypeKey;
  sets: number;
  reps: string;
  rest: number;
  instructions?: string;
}

export const exercises: ExerciseSeed[] = [
  // ---------- PUSH (Chest / Shoulders / Triceps) ----------
  { name: "Chest Press Machine", muscleGroup: "Chest", equipment: "Machine", dayType: "PUSH", sets: 3, reps: "10-12", rest: 60 },
  { name: "Incline Dumbbell Press", muscleGroup: "Chest", equipment: "Free Weight", dayType: "PUSH", sets: 3, reps: "8-10", rest: 90 },
  { name: "Smith Machine Bench Press", muscleGroup: "Chest", equipment: "Smith Machine", dayType: "PUSH", sets: 3, reps: "8-10", rest: 90 },
  { name: "Pec Deck Fly", muscleGroup: "Chest", equipment: "Machine", dayType: "PUSH", sets: 3, reps: "12-15", rest: 45 },
  { name: "Shoulder Press Machine", muscleGroup: "Shoulders", equipment: "Machine", dayType: "PUSH", sets: 3, reps: "10-12", rest: 60 },
  { name: "Dumbbell Lateral Raise", muscleGroup: "Shoulders", equipment: "Free Weight", dayType: "PUSH", sets: 3, reps: "12-15", rest: 45 },
  { name: "Cable Triceps Pushdown", muscleGroup: "Arms", equipment: "Cable", dayType: "PUSH", sets: 3, reps: "12-15", rest: 45 },
  { name: "Overhead Dumbbell Triceps Extension", muscleGroup: "Arms", equipment: "Free Weight", dayType: "PUSH", sets: 3, reps: "10-12", rest: 60 },
  { name: "Cable Chest Fly", muscleGroup: "Chest", equipment: "Cable", dayType: "PUSH", sets: 3, reps: "12-15", rest: 45 },

  // ---------- PULL (Back / Biceps) ----------
  { name: "Lat Pulldown", muscleGroup: "Back", equipment: "Cable", dayType: "PULL", sets: 3, reps: "10-12", rest: 60 },
  { name: "Seated Cable Row", muscleGroup: "Back", equipment: "Cable", dayType: "PULL", sets: 3, reps: "10-12", rest: 60 },
  { name: "Assisted Pull-Up Machine", muscleGroup: "Back", equipment: "Machine", dayType: "PULL", sets: 3, reps: "8-10", rest: 90 },
  { name: "Chest-Supported Row Machine", muscleGroup: "Back", equipment: "Machine", dayType: "PULL", sets: 3, reps: "10-12", rest: 60 },
  { name: "Straight-Arm Cable Pulldown", muscleGroup: "Back", equipment: "Cable", dayType: "PULL", sets: 3, reps: "12-15", rest: 45 },
  { name: "Dumbbell Bicep Curl", muscleGroup: "Arms", equipment: "Free Weight", dayType: "PULL", sets: 3, reps: "10-12", rest: 45 },
  { name: "Cable Bicep Curl", muscleGroup: "Arms", equipment: "Cable", dayType: "PULL", sets: 3, reps: "12-15", rest: 45 },
  { name: "Face Pull", muscleGroup: "Shoulders", equipment: "Cable", dayType: "PULL", sets: 3, reps: "12-15", rest: 45 },
  { name: "Back Extension Machine", muscleGroup: "Back", equipment: "Machine", dayType: "PULL", sets: 3, reps: "12-15", rest: 60 },

  // ---------- LEGS ----------
  { name: "Leg Press", muscleGroup: "Legs", equipment: "Machine", dayType: "LEGS", sets: 4, reps: "10-12", rest: 90 },
  { name: "Smith Machine Squat", muscleGroup: "Legs", equipment: "Smith Machine", dayType: "LEGS", sets: 3, reps: "8-10", rest: 120 },
  { name: "Leg Extension", muscleGroup: "Legs", equipment: "Machine", dayType: "LEGS", sets: 3, reps: "12-15", rest: 60 },
  { name: "Seated Leg Curl", muscleGroup: "Legs", equipment: "Machine", dayType: "LEGS", sets: 3, reps: "12-15", rest: 60 },
  { name: "Walking Dumbbell Lunge", muscleGroup: "Legs", equipment: "Free Weight", dayType: "LEGS", sets: 3, reps: "10-12 each leg", rest: 90 },
  { name: "Standing Calf Raise Machine", muscleGroup: "Legs", equipment: "Machine", dayType: "LEGS", sets: 4, reps: "15-20", rest: 45 },
  { name: "Hip Abductor Machine", muscleGroup: "Legs", equipment: "Machine", dayType: "LEGS", sets: 3, reps: "12-15", rest: 45 },
  { name: "Cable Pull-Through", muscleGroup: "Legs", equipment: "Cable", dayType: "LEGS", sets: 3, reps: "12-15", rest: 60 },
  { name: "Hip Thrust Machine", muscleGroup: "Legs", equipment: "Machine", dayType: "LEGS", sets: 3, reps: "10-12", rest: 90 },

  // ---------- UPPER (mix of push + pull) ----------
  { name: "Chest Press Machine", muscleGroup: "Chest", equipment: "Machine", dayType: "UPPER", sets: 3, reps: "10-12", rest: 60 },
  { name: "Lat Pulldown", muscleGroup: "Back", equipment: "Cable", dayType: "UPPER", sets: 3, reps: "10-12", rest: 60 },
  { name: "Shoulder Press Machine", muscleGroup: "Shoulders", equipment: "Machine", dayType: "UPPER", sets: 3, reps: "10-12", rest: 60 },
  { name: "Seated Cable Row", muscleGroup: "Back", equipment: "Cable", dayType: "UPPER", sets: 3, reps: "10-12", rest: 60 },
  { name: "Dumbbell Bicep Curl", muscleGroup: "Arms", equipment: "Free Weight", dayType: "UPPER", sets: 3, reps: "10-12", rest: 45 },
  { name: "Cable Triceps Pushdown", muscleGroup: "Arms", equipment: "Cable", dayType: "UPPER", sets: 3, reps: "12-15", rest: 45 },
  { name: "Pec Deck Fly", muscleGroup: "Chest", equipment: "Machine", dayType: "UPPER", sets: 3, reps: "12-15", rest: 45 },
  { name: "Dumbbell Lateral Raise", muscleGroup: "Shoulders", equipment: "Free Weight", dayType: "UPPER", sets: 3, reps: "12-15", rest: 45 },
  { name: "Face Pull", muscleGroup: "Shoulders", equipment: "Cable", dayType: "UPPER", sets: 3, reps: "12-15", rest: 45 },

  // ---------- LOWER ----------
  { name: "Leg Press", muscleGroup: "Legs", equipment: "Machine", dayType: "LOWER", sets: 4, reps: "10-12", rest: 90 },
  { name: "Leg Extension", muscleGroup: "Legs", equipment: "Machine", dayType: "LOWER", sets: 3, reps: "12-15", rest: 60 },
  { name: "Seated Leg Curl", muscleGroup: "Legs", equipment: "Machine", dayType: "LOWER", sets: 3, reps: "12-15", rest: 60 },
  { name: "Smith Machine Squat", muscleGroup: "Legs", equipment: "Smith Machine", dayType: "LOWER", sets: 3, reps: "8-10", rest: 120 },
  { name: "Standing Calf Raise Machine", muscleGroup: "Legs", equipment: "Machine", dayType: "LOWER", sets: 4, reps: "15-20", rest: 45 },
  { name: "Hip Abductor Machine", muscleGroup: "Legs", equipment: "Machine", dayType: "LOWER", sets: 3, reps: "12-15", rest: 45 },
  { name: "Hip Thrust Machine", muscleGroup: "Legs", equipment: "Machine", dayType: "LOWER", sets: 3, reps: "10-12", rest: 90 },
  { name: "Cable Pull-Through", muscleGroup: "Legs", equipment: "Cable", dayType: "LOWER", sets: 3, reps: "12-15", rest: 60 },

  // ---------- FULL_BODY (beginner, machine-heavy, minimal bodyweight) ----------
  { name: "Leg Press", muscleGroup: "Legs", equipment: "Machine", dayType: "FULL_BODY", sets: 3, reps: "10-12", rest: 90 },
  { name: "Chest Press Machine", muscleGroup: "Chest", equipment: "Machine", dayType: "FULL_BODY", sets: 3, reps: "10-12", rest: 60 },
  { name: "Lat Pulldown", muscleGroup: "Back", equipment: "Cable", dayType: "FULL_BODY", sets: 3, reps: "10-12", rest: 60 },
  { name: "Shoulder Press Machine", muscleGroup: "Shoulders", equipment: "Machine", dayType: "FULL_BODY", sets: 3, reps: "10-12", rest: 60 },
  { name: "Seated Cable Row", muscleGroup: "Back", equipment: "Cable", dayType: "FULL_BODY", sets: 3, reps: "10-12", rest: 60 },
  { name: "Leg Extension", muscleGroup: "Legs", equipment: "Machine", dayType: "FULL_BODY", sets: 3, reps: "12-15", rest: 60 },
  { name: "Dumbbell Bicep Curl", muscleGroup: "Arms", equipment: "Free Weight", dayType: "FULL_BODY", sets: 2, reps: "10-12", rest: 45 },
  { name: "Cable Triceps Pushdown", muscleGroup: "Arms", equipment: "Cable", dayType: "FULL_BODY", sets: 2, reps: "12-15", rest: 45 },
  { name: "Plank", muscleGroup: "Core", equipment: "Bodyweight", dayType: "FULL_BODY", sets: 3, reps: "30-45 sec", rest: 45 },
];
