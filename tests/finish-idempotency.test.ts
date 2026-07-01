import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { awardPoints, POINTS } from "@/lib/points";

const email = `finish-race-${Date.now()}@example.com`;
let userId: string;
let workoutLogId: string;

beforeAll(async () => {
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: "not-a-real-hash",
      name: "Race Tester",
      username: `racetester${Date.now()}`,
    },
  });
  userId = user.id;

  const workoutLog = await prisma.workoutLog.create({
    data: { userId, date: new Date("2026-02-01T00:00:00.000Z"), dayType: "PUSH" },
  });
  workoutLogId = workoutLog.id;
});

afterAll(async () => {
  await prisma.workoutLog.delete({ where: { id: workoutLogId } }).catch(() => {});
  await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
});

// Mirrors the guarded transaction used in app/api/workouts/[workoutLogId]/finish/route.ts:
// a concurrent duplicate finish should hit the `pointsAwarded: false` WHERE guard,
// get P2025 (no matching row), and be swallowed instead of awarding points twice.
async function attemptFinish() {
  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.workoutLog.update({
        where: { id: workoutLogId, pointsAwarded: false },
        data: { finishedAt: new Date() },
      });
      await awardPoints(tx, userId, POINTS.WORKOUT, "WORKOUT_FINISHED", updated.id);
      await tx.workoutLog.update({ where: { id: workoutLogId }, data: { pointsAwarded: true } });
    });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")) {
      throw e;
    }
  }
}

describe("finish-workout point award idempotency", () => {
  it("awards points exactly once under concurrent finish requests", async () => {
    await Promise.all([attemptFinish(), attemptFinish(), attemptFinish()]);

    const ledgerEntries = await prisma.pointsLedger.count({
      where: { userId, reason: "WORKOUT_FINISHED" },
    });
    expect(ledgerEntries).toBe(1);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    expect(user.totalPoints).toBe(POINTS.WORKOUT);

    const workoutLog = await prisma.workoutLog.findUniqueOrThrow({ where: { id: workoutLogId } });
    expect(workoutLog.pointsAwarded).toBe(true);
    expect(workoutLog.finishedAt).not.toBeNull();
  });

  it("does not award again if finish is retried after success", async () => {
    await attemptFinish();
    const ledgerEntries = await prisma.pointsLedger.count({
      where: { userId, reason: "WORKOUT_FINISHED" },
    });
    expect(ledgerEntries).toBe(1);
  });
});
