/*
  Warnings:

  - The primary key for the `Match` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `MatchInfo` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "MatchInfo" DROP CONSTRAINT "MatchInfo_gameId_fkey";

-- DropForeignKey
ALTER TABLE "_MatchSummoners" DROP CONSTRAINT "_MatchSummoners_A_fkey";

-- AlterTable
ALTER TABLE "Match" DROP CONSTRAINT "Match_pkey",
ALTER COLUMN "gameId" SET DATA TYPE BIGINT,
ADD CONSTRAINT "Match_pkey" PRIMARY KEY ("gameId");

-- AlterTable
ALTER TABLE "MatchInfo" DROP CONSTRAINT "MatchInfo_pkey",
ALTER COLUMN "gameId" SET DATA TYPE BIGINT,
ADD CONSTRAINT "MatchInfo_pkey" PRIMARY KEY ("gameId");

-- AlterTable
ALTER TABLE "_MatchSummoners" ALTER COLUMN "A" SET DATA TYPE BIGINT;

-- AddForeignKey
ALTER TABLE "MatchInfo" ADD CONSTRAINT "MatchInfo_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Match"("gameId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MatchSummoners" ADD CONSTRAINT "_MatchSummoners_A_fkey" FOREIGN KEY ("A") REFERENCES "Match"("gameId") ON DELETE CASCADE ON UPDATE CASCADE;
