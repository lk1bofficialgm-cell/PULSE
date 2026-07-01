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
  videoUrl?: string;
}

// Form-demo videos, verified alive via YouTube oembed at seed-authoring time.
// Exercises without an entry fall back to a YouTube search link in the UI.
const VIDEO: Record<string, string> = {
  "Chest Press Machine": "xUm0BiZCWlQ",
  "Dumbbell Bench Press": "VmB1G1K7v94",
  "Incline Dumbbell Press": "8iPEnn-ltC8",
  "Smith Machine Bench Press": "O5viuEPDXKY",
  "Pec Deck Fly": "eGjt4lk6g34",
  "Cable Chest Fly": "taI4XduLpTk",
  "Dumbbell Fly": "QENKPHhQVi4",
  "Shoulder Press Machine": "WvLMauqrnK8",
  "Dumbbell Shoulder Press": "qEwKCR5JCog",
  "Dumbbell Lateral Raise": "3VcKaXpzqRo",
  "Cable Lateral Raise": "PPrzBWZDOhA",
  "Rear Delt Fly Machine": "6yMdhi2DVao",
  "Face Pull": "rep-qVOkqgk",
  "Cable Triceps Pushdown": "2-LAMcpzODU",
  "Overhead Dumbbell Triceps Extension": "-Vyt2QdsR7E",
  Skullcrusher: "d_KZxkY_0cM",
  "Lat Pulldown": "CAwf7n6Luuc",
  "Seated Cable Row": "GZbfZ033f74",
  "Chest-Supported Row Machine": "0UBRfiO4zDs",
  "Single-Arm Dumbbell Row": "pYcpY20QaE8",
  "Assisted Pull-Up Machine": "wFj808u2HWU",
  "Straight-Arm Cable Pulldown": "G9uNaXGTJ4w",
  "Back Extension Machine": "ph3pddpKzzw",
  "Dumbbell Shrug": "cJRVVxmytaM",
  "Dumbbell Bicep Curl": "ykJmrZ5v0Oo",
  "Hammer Curl": "zC3nLlEvin4",
  "Cable Bicep Curl": "NFzTWp2qpiE",
  "Preacher Curl Machine": "fIWP-FRFNU0",
  "Concentration Curl": "0AUGkch3tzc",
  "Leg Press": "IZxyjW7MPJQ",
  "Smith Machine Squat": "-eO_VydErV0",
  "Goblet Squat": "MeIiIdhvXT4",
  "Leg Extension": "YyvSfVjQeL0",
  "Seated Leg Curl": "Orxowest56U",
  "Lying Leg Curl": "1Tq3QdYUuHs",
  "Walking Dumbbell Lunge": "L8fvypPrzzs",
  "Dumbbell Romanian Deadlift": "FQKfr1YDhEk",
  "Standing Calf Raise Machine": "-M4-G8p8fmc",
  "Seated Calf Raise": "JbyjNymZOt0",
  "Hip Abductor Machine": "G_8LItOiZ0Q",
  "Hip Adductor Machine": "CjAVezAggkI",
  "Hip Thrust Machine": "xDmFkJxPzeM",
  "Cable Pull-Through": "pv8e6OSyETE",
  "Ab Crunch Machine": "-OUSBPnHvsQ",
  "Cable Crunch": "2fbujeH3F0E",
};

function video(name: string): string | undefined {
  const id = VIDEO[name];
  return id ? `https://www.youtube.com/watch?v=${id}` : undefined;
}

interface PoolEntry {
  name: string;
  muscleGroup: MuscleGroupName;
  equipment: string;
  sets: number;
  reps: string;
  rest: number;
}

const POOLS: Record<DayTypeKey, PoolEntry[]> = {
  PUSH: [
    { name: "Chest Press Machine", muscleGroup: "Chest", equipment: "Machine", sets: 3, reps: "10-12", rest: 60 },
    { name: "Dumbbell Bench Press", muscleGroup: "Chest", equipment: "Free Weight", sets: 3, reps: "8-10", rest: 90 },
    { name: "Incline Dumbbell Press", muscleGroup: "Chest", equipment: "Free Weight", sets: 3, reps: "8-10", rest: 90 },
    { name: "Smith Machine Bench Press", muscleGroup: "Chest", equipment: "Smith Machine", sets: 3, reps: "8-10", rest: 90 },
    { name: "Pec Deck Fly", muscleGroup: "Chest", equipment: "Machine", sets: 3, reps: "12-15", rest: 45 },
    { name: "Cable Chest Fly", muscleGroup: "Chest", equipment: "Cable", sets: 3, reps: "12-15", rest: 45 },
    { name: "Dumbbell Fly", muscleGroup: "Chest", equipment: "Free Weight", sets: 3, reps: "12-15", rest: 60 },
    { name: "Shoulder Press Machine", muscleGroup: "Shoulders", equipment: "Machine", sets: 3, reps: "10-12", rest: 60 },
    { name: "Dumbbell Shoulder Press", muscleGroup: "Shoulders", equipment: "Free Weight", sets: 3, reps: "8-10", rest: 90 },
    { name: "Dumbbell Lateral Raise", muscleGroup: "Shoulders", equipment: "Free Weight", sets: 3, reps: "12-15", rest: 45 },
    { name: "Cable Lateral Raise", muscleGroup: "Shoulders", equipment: "Cable", sets: 3, reps: "12-15", rest: 45 },
    { name: "Cable Triceps Pushdown", muscleGroup: "Arms", equipment: "Cable", sets: 3, reps: "12-15", rest: 45 },
    { name: "Overhead Dumbbell Triceps Extension", muscleGroup: "Arms", equipment: "Free Weight", sets: 3, reps: "10-12", rest: 60 },
    { name: "Skullcrusher", muscleGroup: "Arms", equipment: "Free Weight", sets: 3, reps: "10-12", rest: 60 },
    { name: "Triceps Dip Machine", muscleGroup: "Arms", equipment: "Machine", sets: 3, reps: "10-12", rest: 60 },
  ],
  PULL: [
    { name: "Lat Pulldown", muscleGroup: "Back", equipment: "Cable", sets: 3, reps: "10-12", rest: 60 },
    { name: "Close-Grip Lat Pulldown", muscleGroup: "Back", equipment: "Cable", sets: 3, reps: "10-12", rest: 60 },
    { name: "Seated Cable Row", muscleGroup: "Back", equipment: "Cable", sets: 3, reps: "10-12", rest: 60 },
    { name: "Chest-Supported Row Machine", muscleGroup: "Back", equipment: "Machine", sets: 3, reps: "10-12", rest: 60 },
    { name: "Single-Arm Dumbbell Row", muscleGroup: "Back", equipment: "Free Weight", sets: 3, reps: "10-12 each side", rest: 60 },
    { name: "Assisted Pull-Up Machine", muscleGroup: "Back", equipment: "Machine", sets: 3, reps: "8-10", rest: 90 },
    { name: "Straight-Arm Cable Pulldown", muscleGroup: "Back", equipment: "Cable", sets: 3, reps: "12-15", rest: 45 },
    { name: "Back Extension Machine", muscleGroup: "Back", equipment: "Machine", sets: 3, reps: "12-15", rest: 60 },
    { name: "Dumbbell Shrug", muscleGroup: "Back", equipment: "Free Weight", sets: 3, reps: "12-15", rest: 45 },
    { name: "Face Pull", muscleGroup: "Shoulders", equipment: "Cable", sets: 3, reps: "12-15", rest: 45 },
    { name: "Rear Delt Fly Machine", muscleGroup: "Shoulders", equipment: "Machine", sets: 3, reps: "12-15", rest: 45 },
    { name: "Dumbbell Bicep Curl", muscleGroup: "Arms", equipment: "Free Weight", sets: 3, reps: "10-12", rest: 45 },
    { name: "Hammer Curl", muscleGroup: "Arms", equipment: "Free Weight", sets: 3, reps: "10-12", rest: 45 },
    { name: "Cable Bicep Curl", muscleGroup: "Arms", equipment: "Cable", sets: 3, reps: "12-15", rest: 45 },
    { name: "Preacher Curl Machine", muscleGroup: "Arms", equipment: "Machine", sets: 3, reps: "10-12", rest: 60 },
    { name: "Concentration Curl", muscleGroup: "Arms", equipment: "Free Weight", sets: 3, reps: "10-12 each arm", rest: 45 },
  ],
  LEGS: [
    { name: "Leg Press", muscleGroup: "Legs", equipment: "Machine", sets: 4, reps: "10-12", rest: 90 },
    { name: "Smith Machine Squat", muscleGroup: "Legs", equipment: "Smith Machine", sets: 3, reps: "8-10", rest: 120 },
    { name: "Goblet Squat", muscleGroup: "Legs", equipment: "Free Weight", sets: 3, reps: "10-12", rest: 90 },
    { name: "Leg Extension", muscleGroup: "Legs", equipment: "Machine", sets: 3, reps: "12-15", rest: 60 },
    { name: "Seated Leg Curl", muscleGroup: "Legs", equipment: "Machine", sets: 3, reps: "12-15", rest: 60 },
    { name: "Lying Leg Curl", muscleGroup: "Legs", equipment: "Machine", sets: 3, reps: "12-15", rest: 60 },
    { name: "Walking Dumbbell Lunge", muscleGroup: "Legs", equipment: "Free Weight", sets: 3, reps: "10-12 each leg", rest: 90 },
    { name: "Dumbbell Romanian Deadlift", muscleGroup: "Legs", equipment: "Free Weight", sets: 3, reps: "10-12", rest: 90 },
    { name: "Hip Thrust Machine", muscleGroup: "Legs", equipment: "Machine", sets: 3, reps: "10-12", rest: 90 },
    { name: "Hip Abductor Machine", muscleGroup: "Legs", equipment: "Machine", sets: 3, reps: "12-15", rest: 45 },
    { name: "Hip Adductor Machine", muscleGroup: "Legs", equipment: "Machine", sets: 3, reps: "12-15", rest: 45 },
    { name: "Standing Calf Raise Machine", muscleGroup: "Legs", equipment: "Machine", sets: 4, reps: "15-20", rest: 45 },
    { name: "Seated Calf Raise", muscleGroup: "Legs", equipment: "Machine", sets: 4, reps: "15-20", rest: 45 },
    { name: "Cable Pull-Through", muscleGroup: "Legs", equipment: "Cable", sets: 3, reps: "12-15", rest: 60 },
  ],
  UPPER: [
    { name: "Chest Press Machine", muscleGroup: "Chest", equipment: "Machine", sets: 3, reps: "10-12", rest: 60 },
    { name: "Incline Dumbbell Press", muscleGroup: "Chest", equipment: "Free Weight", sets: 3, reps: "8-10", rest: 90 },
    { name: "Pec Deck Fly", muscleGroup: "Chest", equipment: "Machine", sets: 3, reps: "12-15", rest: 45 },
    { name: "Cable Chest Fly", muscleGroup: "Chest", equipment: "Cable", sets: 3, reps: "12-15", rest: 45 },
    { name: "Lat Pulldown", muscleGroup: "Back", equipment: "Cable", sets: 3, reps: "10-12", rest: 60 },
    { name: "Seated Cable Row", muscleGroup: "Back", equipment: "Cable", sets: 3, reps: "10-12", rest: 60 },
    { name: "Chest-Supported Row Machine", muscleGroup: "Back", equipment: "Machine", sets: 3, reps: "10-12", rest: 60 },
    { name: "Assisted Pull-Up Machine", muscleGroup: "Back", equipment: "Machine", sets: 3, reps: "8-10", rest: 90 },
    { name: "Shoulder Press Machine", muscleGroup: "Shoulders", equipment: "Machine", sets: 3, reps: "10-12", rest: 60 },
    { name: "Dumbbell Lateral Raise", muscleGroup: "Shoulders", equipment: "Free Weight", sets: 3, reps: "12-15", rest: 45 },
    { name: "Rear Delt Fly Machine", muscleGroup: "Shoulders", equipment: "Machine", sets: 3, reps: "12-15", rest: 45 },
    { name: "Face Pull", muscleGroup: "Shoulders", equipment: "Cable", sets: 3, reps: "12-15", rest: 45 },
    { name: "Dumbbell Bicep Curl", muscleGroup: "Arms", equipment: "Free Weight", sets: 3, reps: "10-12", rest: 45 },
    { name: "Hammer Curl", muscleGroup: "Arms", equipment: "Free Weight", sets: 3, reps: "10-12", rest: 45 },
    { name: "Cable Triceps Pushdown", muscleGroup: "Arms", equipment: "Cable", sets: 3, reps: "12-15", rest: 45 },
    { name: "Overhead Dumbbell Triceps Extension", muscleGroup: "Arms", equipment: "Free Weight", sets: 3, reps: "10-12", rest: 60 },
  ],
  LOWER: [
    { name: "Leg Press", muscleGroup: "Legs", equipment: "Machine", sets: 4, reps: "10-12", rest: 90 },
    { name: "Smith Machine Squat", muscleGroup: "Legs", equipment: "Smith Machine", sets: 3, reps: "8-10", rest: 120 },
    { name: "Goblet Squat", muscleGroup: "Legs", equipment: "Free Weight", sets: 3, reps: "10-12", rest: 90 },
    { name: "Leg Extension", muscleGroup: "Legs", equipment: "Machine", sets: 3, reps: "12-15", rest: 60 },
    { name: "Seated Leg Curl", muscleGroup: "Legs", equipment: "Machine", sets: 3, reps: "12-15", rest: 60 },
    { name: "Lying Leg Curl", muscleGroup: "Legs", equipment: "Machine", sets: 3, reps: "12-15", rest: 60 },
    { name: "Dumbbell Romanian Deadlift", muscleGroup: "Legs", equipment: "Free Weight", sets: 3, reps: "10-12", rest: 90 },
    { name: "Hip Thrust Machine", muscleGroup: "Legs", equipment: "Machine", sets: 3, reps: "10-12", rest: 90 },
    { name: "Hip Abductor Machine", muscleGroup: "Legs", equipment: "Machine", sets: 3, reps: "12-15", rest: 45 },
    { name: "Hip Adductor Machine", muscleGroup: "Legs", equipment: "Machine", sets: 3, reps: "12-15", rest: 45 },
    { name: "Standing Calf Raise Machine", muscleGroup: "Legs", equipment: "Machine", sets: 4, reps: "15-20", rest: 45 },
    { name: "Seated Calf Raise", muscleGroup: "Legs", equipment: "Machine", sets: 4, reps: "15-20", rest: 45 },
    { name: "Walking Dumbbell Lunge", muscleGroup: "Legs", equipment: "Free Weight", sets: 3, reps: "10-12 each leg", rest: 90 },
    { name: "Cable Pull-Through", muscleGroup: "Legs", equipment: "Cable", sets: 3, reps: "12-15", rest: 60 },
  ],
  FULL_BODY: [
    { name: "Leg Press", muscleGroup: "Legs", equipment: "Machine", sets: 3, reps: "10-12", rest: 90 },
    { name: "Goblet Squat", muscleGroup: "Legs", equipment: "Free Weight", sets: 3, reps: "10-12", rest: 90 },
    { name: "Chest Press Machine", muscleGroup: "Chest", equipment: "Machine", sets: 3, reps: "10-12", rest: 60 },
    { name: "Lat Pulldown", muscleGroup: "Back", equipment: "Cable", sets: 3, reps: "10-12", rest: 60 },
    { name: "Seated Cable Row", muscleGroup: "Back", equipment: "Cable", sets: 3, reps: "10-12", rest: 60 },
    { name: "Shoulder Press Machine", muscleGroup: "Shoulders", equipment: "Machine", sets: 3, reps: "10-12", rest: 60 },
    { name: "Leg Extension", muscleGroup: "Legs", equipment: "Machine", sets: 3, reps: "12-15", rest: 60 },
    { name: "Seated Leg Curl", muscleGroup: "Legs", equipment: "Machine", sets: 3, reps: "12-15", rest: 60 },
    { name: "Dumbbell Romanian Deadlift", muscleGroup: "Legs", equipment: "Free Weight", sets: 3, reps: "10-12", rest: 90 },
    { name: "Dumbbell Bicep Curl", muscleGroup: "Arms", equipment: "Free Weight", sets: 2, reps: "10-12", rest: 45 },
    { name: "Cable Triceps Pushdown", muscleGroup: "Arms", equipment: "Cable", sets: 2, reps: "12-15", rest: 45 },
    { name: "Standing Calf Raise Machine", muscleGroup: "Legs", equipment: "Machine", sets: 3, reps: "15-20", rest: 45 },
    { name: "Ab Crunch Machine", muscleGroup: "Core", equipment: "Machine", sets: 3, reps: "12-15", rest: 45 },
    { name: "Cable Crunch", muscleGroup: "Core", equipment: "Cable", sets: 3, reps: "12-15", rest: 45 },
  ],
};

export const exercises: ExerciseSeed[] = (
  Object.entries(POOLS) as [DayTypeKey, PoolEntry[]][]
).flatMap(([dayType, pool]) =>
  pool.map((entry) => ({
    ...entry,
    dayType,
    videoUrl: video(entry.name),
  }))
);
