/*
  Warnings:

  - You are about to drop the column `playersInLevel` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `crestBorder` on the `Preferences` table. All the data in the column will be lost.
  - You are about to drop the column `prestigeCrestBorderLevel` on the `Preferences` table. All the data in the column will be lost.
  - You are about to drop the column `percentile` on the `TotalPoints` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "playersInLevel",
DROP COLUMN "position";

-- AlterTable
ALTER TABLE "Preferences" DROP COLUMN "crestBorder",
DROP COLUMN "prestigeCrestBorderLevel";

-- AlterTable
ALTER TABLE "TotalPoints" DROP COLUMN "percentile";
