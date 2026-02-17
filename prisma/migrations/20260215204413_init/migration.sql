-- CreateTable
CREATE TABLE "WeeklyMenu" (
    "id" SERIAL NOT NULL,
    "unit" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyMenu_pkey" PRIMARY KEY ("id")
);
