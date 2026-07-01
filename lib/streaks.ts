import { prisma } from "@/lib/prisma";
import { awardPoints, POINTS } from "@/lib/points";
import type { User } from "@prisma/client";

function dateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function isSameDay(a: Date, b: Date): boolean {
  return dateOnly(a).getTime() === dateOnly(b).getTime();
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/**
 * Advances the user's streak for a qualifying activity day. Idempotent per
 * calendar day: repeated calls on the same day (e.g. workout + water goal
 * both hit today) only advance the streak and award points once.
 */
export async function updateStreak(userId: string, activityDate: Date): Promise<User> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    const today = dateOnly(activityDate);
    const last = user.lastActiveDate ? dateOnly(user.lastActiveDate) : null;

    if (last && isSameDay(last, today)) {
      return user;
    }

    const isConsecutive = !!last && isSameDay(addDays(last, 1), today);
    const newStreak = isConsecutive ? user.currentStreak + 1 : 1;

    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, user.longestStreak),
        lastActiveDate: today,
      },
    });

    await awardPoints(tx, userId, POINTS.STREAK_DAY, "STREAK_DAY");

    return updated;
  });
}
