-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bottleMl" INTEGER NOT NULL DEFAULT 500,
ADD COLUMN     "onboarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "waterGoalMl" INTEGER NOT NULL DEFAULT 2000;

-- AlterTable
ALTER TABLE "WaterLog" ADD COLUMN     "consumedMl" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "goalMl" INTEGER NOT NULL DEFAULT 2000;

-- CreateTable
CREATE TABLE "UserDayPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "dayType" "DayType" NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "UserDayPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDayPlan_userId_dayOfWeek_key" ON "UserDayPlan"("userId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "UserDayPlan" ADD CONSTRAINT "UserDayPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
