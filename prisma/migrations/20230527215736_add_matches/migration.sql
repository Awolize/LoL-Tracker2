-- AlterTable
ALTER TABLE "Summoner" ADD CONSTRAINT "Summoner_pkey" PRIMARY KEY ("puuid");

-- CreateTable
CREATE TABLE "Match" (
    "matchId" INTEGER NOT NULL,
    "info" JSONB NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("matchId")
);

-- CreateTable
CREATE TABLE "_MatchSummoners" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MatchSummoners_AB_unique" ON "_MatchSummoners"("A", "B");

-- CreateIndex
CREATE INDEX "_MatchSummoners_B_index" ON "_MatchSummoners"("B");

-- AddForeignKey
ALTER TABLE "_MatchSummoners" ADD CONSTRAINT "_MatchSummoners_A_fkey" FOREIGN KEY ("A") REFERENCES "Match"("matchId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MatchSummoners" ADD CONSTRAINT "_MatchSummoners_B_fkey" FOREIGN KEY ("B") REFERENCES "Summoner"("puuid") ON DELETE CASCADE ON UPDATE CASCADE;
