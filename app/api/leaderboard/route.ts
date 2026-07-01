import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, isErrorResponse } from "@/lib/api-utils";
import { startOfIsoWeek } from "@/lib/points";

const selectFields = {
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
  totalPoints: true,
  weeklyPoints: true,
} as const;

export async function GET(req: NextRequest) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const scope = req.nextUrl.searchParams.get("scope") === "weekly" ? "weekly" : "alltime";

  if (scope === "weekly") {
    const currentWeekStart = startOfIsoWeek(new Date());
    await prisma.user.updateMany({
      where: { weekAnchor: { lt: currentWeekStart } },
      data: { weeklyPoints: 0, weekAnchor: currentWeekStart },
    });
  }

  const me = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: selectFields });

  if (scope === "weekly") {
    const top10 = await prisma.user.findMany({
      orderBy: { weeklyPoints: "desc" },
      take: 10,
      select: selectFields,
    });
    const myRank = 1 + (await prisma.user.count({ where: { weeklyPoints: { gt: me.weeklyPoints } } }));
    return NextResponse.json({
      scope,
      entries: top10.map((u, i) => ({ ...u, rank: i + 1 })),
      me: { ...me, rank: myRank },
    });
  }

  const top10 = await prisma.user.findMany({
    orderBy: { totalPoints: "desc" },
    take: 10,
    select: selectFields,
  });
  const myRank = 1 + (await prisma.user.count({ where: { totalPoints: { gt: me.totalPoints } } }));
  return NextResponse.json({
    scope,
    entries: top10.map((u, i) => ({ ...u, rank: i + 1 })),
    me: { ...me, rank: myRank },
  });
}
