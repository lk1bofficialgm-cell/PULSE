import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { updateStreak } from "@/lib/streaks";

const email = `streak-test-${Date.now()}@example.com`;
let userId: string;

beforeAll(async () => {
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: "not-a-real-hash",
      name: "Streak Tester",
      username: `streaktester${Date.now()}`,
    },
  });
  userId = user.id;
});

afterAll(async () => {
  await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
});

function utcDate(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`);
}

describe("updateStreak", () => {
  it("starts a streak at 1 on the first qualifying day", async () => {
    const updated = await updateStreak(userId, utcDate("2026-01-01"));
    expect(updated.currentStreak).toBe(1);
    expect(updated.longestStreak).toBe(1);
  });

  it("is idempotent for repeated calls on the same day", async () => {
    await updateStreak(userId, utcDate("2026-01-01"));
    const updated = await updateStreak(userId, utcDate("2026-01-01"));
    expect(updated.currentStreak).toBe(1);

    const ledgerCount = await prisma.pointsLedger.count({ where: { userId, reason: "STREAK_DAY" } });
    expect(ledgerCount).toBe(1);
  });

  it("advances the streak on the next consecutive day", async () => {
    const updated = await updateStreak(userId, utcDate("2026-01-02"));
    expect(updated.currentStreak).toBe(2);
    expect(updated.longestStreak).toBe(2);
  });

  it("resets to 1 after a gap day", async () => {
    const updated = await updateStreak(userId, utcDate("2026-01-04"));
    expect(updated.currentStreak).toBe(1);
    expect(updated.longestStreak).toBe(2); // longest streak is preserved
  });

  it("awards 10 points per distinct qualifying day", async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    // Distinct days advanced so far: Jan 1, Jan 2, Jan 4 = 3 days -> 30 points
    expect(user.totalPoints).toBe(30);
  });
});
