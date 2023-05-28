/*
  Warnings:

  - Changed the type of `gameEndTimestamp` on the `MatchInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "MatchInfo" DROP COLUMN "gameEndTimestamp",
ADD COLUMN     "gameEndTimestamp" TIMESTAMP(3) NOT NULL;
