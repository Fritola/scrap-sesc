/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `WeeklyMenu` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `WeeklyMenu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WeeklyMenu" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyMenu_slug_key" ON "WeeklyMenu"("slug");
