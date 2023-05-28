-- CreateTable
CREATE TABLE "Challenges" (
    "puuid" TEXT NOT NULL,

    CONSTRAINT "Challenges_pkey" PRIMARY KEY ("puuid")
);

-- CreateTable
CREATE TABLE "_ChallengeHeroes" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Challenges_puuid_key" ON "Challenges"("puuid");

-- CreateIndex
CREATE UNIQUE INDEX "_ChallengeHeroes_AB_unique" ON "_ChallengeHeroes"("A", "B");

-- CreateIndex
CREATE INDEX "_ChallengeHeroes_B_index" ON "_ChallengeHeroes"("B");

-- AddForeignKey
ALTER TABLE "Challenges" ADD CONSTRAINT "Challenges_puuid_fkey" FOREIGN KEY ("puuid") REFERENCES "Summoner"("puuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengeHeroes" ADD CONSTRAINT "_ChallengeHeroes_A_fkey" FOREIGN KEY ("A") REFERENCES "Challenges"("puuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengeHeroes" ADD CONSTRAINT "_ChallengeHeroes_B_fkey" FOREIGN KEY ("B") REFERENCES "ChampionDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;
