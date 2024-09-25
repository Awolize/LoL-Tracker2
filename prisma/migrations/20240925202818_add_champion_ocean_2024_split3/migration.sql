-- CreateTable
CREATE TABLE "_ChallengesChampionOcean2024Split3" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChallengesChampionOcean2024Split3_AB_unique" ON "_ChallengesChampionOcean2024Split3"("A", "B");

-- CreateIndex
CREATE INDEX "_ChallengesChampionOcean2024Split3_B_index" ON "_ChallengesChampionOcean2024Split3"("B");

-- AddForeignKey
ALTER TABLE "_ChallengesChampionOcean2024Split3" ADD CONSTRAINT "_ChallengesChampionOcean2024Split3_A_fkey" FOREIGN KEY ("A") REFERENCES "Challenges"("puuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengesChampionOcean2024Split3" ADD CONSTRAINT "_ChallengesChampionOcean2024Split3_B_fkey" FOREIGN KEY ("B") REFERENCES "ChampionDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;
