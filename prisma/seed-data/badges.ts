export interface BadgeSeed {
  key: string;
  name: string;
  description: string;
  icon: string;
}

export const badges: BadgeSeed[] = [
  { key: "STREAK_7", name: "7-Day Streak", description: "Stayed active 7 days in a row", icon: "🔥" },
  { key: "STREAK_30", name: "30-Day Streak", description: "Stayed active 30 days in a row", icon: "⚡" },
  { key: "WORKOUTS_10", name: "10 Workouts", description: "Finished 10 workouts", icon: "🏋️" },
  { key: "WORKOUTS_50", name: "50 Workouts", description: "Finished 50 workouts", icon: "💪" },
  { key: "WORKOUTS_100", name: "Century Club", description: "Finished 100 workouts", icon: "🏆" },
  { key: "WATER_30", name: "Hydration Hero", description: "Hit the water goal 30 times", icon: "💧" },
  { key: "POINTS_1000", name: "1000 Points", description: "Earned 1000 total points", icon: "⭐" },
];
