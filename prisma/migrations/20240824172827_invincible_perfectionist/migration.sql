-- CreateTable
CREATE TABLE "_ChallengesInvincible" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ChallengesPerfectionist" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChallengesInvincible_AB_unique" ON "_ChallengesInvincible"("A", "B");

-- CreateIndex
CREATE INDEX "_ChallengesInvincible_B_index" ON "_ChallengesInvincible"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ChallengesPerfectionist_AB_unique" ON "_ChallengesPerfectionist"("A", "B");

-- CreateIndex
CREATE INDEX "_ChallengesPerfectionist_B_index" ON "_ChallengesPerfectionist"("B");

-- AddForeignKey
ALTER TABLE "_ChallengesInvincible" ADD CONSTRAINT "_ChallengesInvincible_A_fkey" FOREIGN KEY ("A") REFERENCES "Challenges"("puuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengesInvincible" ADD CONSTRAINT "_ChallengesInvincible_B_fkey" FOREIGN KEY ("B") REFERENCES "ChampionDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengesPerfectionist" ADD CONSTRAINT "_ChallengesPerfectionist_A_fkey" FOREIGN KEY ("A") REFERENCES "Challenges"("puuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengesPerfectionist" ADD CONSTRAINT "_ChallengesPerfectionist_B_fkey" FOREIGN KEY ("B") REFERENCES "ChampionDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;
