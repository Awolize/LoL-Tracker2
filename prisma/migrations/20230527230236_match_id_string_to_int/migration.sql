/*
  Warnings:

  - The primary key for the `Match` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `info` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `matchId` on the `Match` table. All the data in the column will be lost.
  - Added the required column `gameId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `server` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `A` on the `_MatchSummoners` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_MatchSummoners" DROP CONSTRAINT "_MatchSummoners_A_fkey";

-- AlterTable
ALTER TABLE "Match" DROP CONSTRAINT "Match_pkey",
DROP COLUMN "info",
DROP COLUMN "matchId",
ADD COLUMN     "gameId" INTEGER NOT NULL,
ADD COLUMN     "server" TEXT NOT NULL,
ADD CONSTRAINT "Match_pkey" PRIMARY KEY ("gameId");

-- AlterTable
ALTER TABLE "_MatchSummoners" DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "MatchInfo" (
    "gameId" INTEGER NOT NULL,
    "gameCreation" INTEGER NOT NULL,
    "gameDuration" INTEGER NOT NULL,
    "gameEndTimestamp" INTEGER NOT NULL,
    "gameMode" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "gameStartTimestamp" INTEGER NOT NULL,
    "gameType" TEXT NOT NULL,
    "gameVersion" TEXT NOT NULL,
    "mapId" INTEGER NOT NULL,
    "participants" JSONB NOT NULL,
    "platformId" TEXT NOT NULL,
    "queueId" INTEGER NOT NULL,
    "teams" JSONB NOT NULL,
    "tournamentCode" TEXT NOT NULL,

    CONSTRAINT "MatchInfo_pkey" PRIMARY KEY ("gameId")
);

-- CreateIndex
CREATE UNIQUE INDEX "_MatchSummoners_AB_unique" ON "_MatchSummoners"("A", "B");

-- AddForeignKey
ALTER TABLE "MatchInfo" ADD CONSTRAINT "MatchInfo_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Match"("gameId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MatchSummoners" ADD CONSTRAINT "_MatchSummoners_A_fkey" FOREIGN KEY ("A") REFERENCES "Match"("gameId") ON DELETE CASCADE ON UPDATE CASCADE;
