-- DropForeignKey
ALTER TABLE "MatchInfo" DROP CONSTRAINT "MatchInfo_gameId_fkey";

-- AddForeignKey
ALTER TABLE "MatchInfo" ADD CONSTRAINT "MatchInfo_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Match"("gameId") ON DELETE CASCADE ON UPDATE CASCADE;
