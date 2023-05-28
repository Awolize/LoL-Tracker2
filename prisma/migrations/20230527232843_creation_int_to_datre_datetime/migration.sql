/*
  Warnings:

  - Changed the type of `gameCreation` on the `MatchInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `gameStartTimestamp` on the `MatchInfo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "MatchInfo" DROP COLUMN "gameCreation",
ADD COLUMN     "gameCreation" TIMESTAMP(3) NOT NULL,
DROP COLUMN "gameStartTimestamp",
ADD COLUMN     "gameStartTimestamp" TIMESTAMP(3) NOT NULL;
