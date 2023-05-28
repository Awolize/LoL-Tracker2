/*
  Warnings:

  - The primary key for the `Match` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "_MatchSummoners" DROP CONSTRAINT "_MatchSummoners_A_fkey";

-- AlterTable
ALTER TABLE "Match" DROP CONSTRAINT "Match_pkey",
ALTER COLUMN "matchId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Match_pkey" PRIMARY KEY ("matchId");

-- AlterTable
ALTER TABLE "_MatchSummoners" ALTER COLUMN "A" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "_MatchSummoners" ADD CONSTRAINT "_MatchSummoners_A_fkey" FOREIGN KEY ("A") REFERENCES "Match"("matchId") ON DELETE CASCADE ON UPDATE CASCADE;
