-- CreateEnum
CREATE TYPE "Language" AS ENUM ('en_US');

-- CreateTable
CREATE TABLE "Match" (
    "gameId" TEXT NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("gameId")
);

-- CreateTable
CREATE TABLE "MatchInfo" (
    "gameId" TEXT NOT NULL,
    "gameDuration" INTEGER NOT NULL,
    "gameMode" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "gameVersion" TEXT NOT NULL,
    "mapId" INTEGER NOT NULL,
    "participants" JSONB NOT NULL,
    "platformId" TEXT NOT NULL,
    "queueId" INTEGER NOT NULL,
    "teams" JSONB NOT NULL,
    "tournamentCode" TEXT NOT NULL,
    "gameCreation" TIMESTAMP(3) NOT NULL,
    "gameStartTimestamp" TIMESTAMP(3) NOT NULL,
    "gameEndTimestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchInfo_pkey" PRIMARY KEY ("gameId")
);

-- CreateTable
CREATE TABLE "Challenges" (
    "puuid" TEXT NOT NULL,

    CONSTRAINT "Challenges_pkey" PRIMARY KEY ("puuid")
);

-- CreateTable
CREATE TABLE "Summoner" (
    "summonerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "region" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "profileIconId" INTEGER NOT NULL,
    "puuid" TEXT NOT NULL,
    "summonerLevel" INTEGER NOT NULL,
    "revisionDate" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,
    "gameName" TEXT,
    "tagLine" TEXT,

    CONSTRAINT "Summoner_pkey" PRIMARY KEY ("puuid")
);

-- CreateTable
CREATE TABLE "ChampionDetails" (
    "id" INTEGER NOT NULL,
    "version" TEXT,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "attack" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "magic" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "full" TEXT NOT NULL,
    "sprite" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "w" INTEGER NOT NULL,
    "h" INTEGER NOT NULL,
    "tags" TEXT[],
    "partype" TEXT NOT NULL,
    "hp" DOUBLE PRECISION NOT NULL,
    "hpperlevel" DOUBLE PRECISION NOT NULL,
    "mp" DOUBLE PRECISION NOT NULL,
    "mpperlevel" DOUBLE PRECISION NOT NULL,
    "movespeed" DOUBLE PRECISION NOT NULL,
    "armor" DOUBLE PRECISION NOT NULL,
    "armorperlevel" DOUBLE PRECISION NOT NULL,
    "spellblock" DOUBLE PRECISION NOT NULL,
    "spellblockperlevel" DOUBLE PRECISION NOT NULL,
    "attackrange" DOUBLE PRECISION NOT NULL,
    "hpregen" DOUBLE PRECISION NOT NULL,
    "hpregenperlevel" DOUBLE PRECISION NOT NULL,
    "mpregen" DOUBLE PRECISION NOT NULL,
    "mpregenperlevel" DOUBLE PRECISION NOT NULL,
    "crit" DOUBLE PRECISION NOT NULL,
    "critperlevel" DOUBLE PRECISION NOT NULL,
    "attackdamage" DOUBLE PRECISION NOT NULL,
    "attackdamageperlevel" DOUBLE PRECISION NOT NULL,
    "attackspeedperlevel" DOUBLE PRECISION NOT NULL,
    "attackspeed" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ChampionDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChampionMastery" (
    "championId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "championLevel" INTEGER NOT NULL,
    "championPoints" INTEGER NOT NULL,
    "chestGranted" BOOLEAN NOT NULL,
    "tokensEarned" INTEGER NOT NULL,
    "lastPlayTime" TIMESTAMP(3) NOT NULL,
    "championPointsUntilNextLevel" INTEGER NOT NULL,
    "championPointsSinceLastLevel" INTEGER NOT NULL,
    "puuid" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ChallengesConfig" (
    "id" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "leaderboard" BOOLEAN NOT NULL,
    "endTimestamp" TIMESTAMP(3),
    "thresholds" JSONB NOT NULL,

    CONSTRAINT "ChallengesConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeLocalization" (
    "id" INTEGER NOT NULL,
    "language" "Language" NOT NULL,
    "description" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TotalPoints" (
    "level" TEXT NOT NULL,
    "current" INTEGER NOT NULL,
    "max" INTEGER NOT NULL,
    "percentile" DOUBLE PRECISION NOT NULL,
    "challengesDetailsId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Preferences" (
    "bannerAccent" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "challengeIds" INTEGER[],
    "crestBorder" TEXT NOT NULL,
    "prestigeCrestBorderLevel" INTEGER NOT NULL,
    "challengesDetailsId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Challenge" (
    "challengeId" INTEGER NOT NULL,
    "percentile" DOUBLE PRECISION,
    "level" TEXT,
    "value" INTEGER,
    "achievedTime" TIMESTAMP(3),
    "position" INTEGER,
    "playersInLevel" INTEGER,
    "challengesDetailsId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CategoryPoints" (
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "current" INTEGER NOT NULL,
    "max" INTEGER NOT NULL,
    "percentile" DOUBLE PRECISION NOT NULL,
    "challengesDetailsId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ChallengesDetails" (
    "puuid" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_MatchSummoners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ChallengeHeroes" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ChallengesChampionOcean" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ChallengesAdaptToAllSituations" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Challenges_puuid_key" ON "Challenges"("puuid");

-- CreateIndex
CREATE UNIQUE INDEX "Summoner_puuid_key" ON "Summoner"("puuid");

-- CreateIndex
CREATE UNIQUE INDEX "ChampionDetails_id_key" ON "ChampionDetails"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ChampionMastery_championId_puuid_key" ON "ChampionMastery"("championId", "puuid");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeLocalization_id_language_key" ON "ChallengeLocalization"("id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "TotalPoints_challengesDetailsId_key" ON "TotalPoints"("challengesDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "Preferences_challengesDetailsId_key" ON "Preferences"("challengesDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_challengeId_challengesDetailsId_key" ON "Challenge"("challengeId", "challengesDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryPoints_category_challengesDetailsId_key" ON "CategoryPoints"("category", "challengesDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengesDetails_puuid_key" ON "ChallengesDetails"("puuid");

-- CreateIndex
CREATE UNIQUE INDEX "_MatchSummoners_AB_unique" ON "_MatchSummoners"("A", "B");

-- CreateIndex
CREATE INDEX "_MatchSummoners_B_index" ON "_MatchSummoners"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ChallengeHeroes_AB_unique" ON "_ChallengeHeroes"("A", "B");

-- CreateIndex
CREATE INDEX "_ChallengeHeroes_B_index" ON "_ChallengeHeroes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ChallengesChampionOcean_AB_unique" ON "_ChallengesChampionOcean"("A", "B");

-- CreateIndex
CREATE INDEX "_ChallengesChampionOcean_B_index" ON "_ChallengesChampionOcean"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ChallengesAdaptToAllSituations_AB_unique" ON "_ChallengesAdaptToAllSituations"("A", "B");

-- CreateIndex
CREATE INDEX "_ChallengesAdaptToAllSituations_B_index" ON "_ChallengesAdaptToAllSituations"("B");

-- AddForeignKey
ALTER TABLE "MatchInfo" ADD CONSTRAINT "MatchInfo_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Match"("gameId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenges" ADD CONSTRAINT "Challenges_puuid_fkey" FOREIGN KEY ("puuid") REFERENCES "Summoner"("puuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChampionMastery" ADD CONSTRAINT "ChampionMastery_puuid_fkey" FOREIGN KEY ("puuid") REFERENCES "Summoner"("puuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeLocalization" ADD CONSTRAINT "ChallengeLocalization_id_fkey" FOREIGN KEY ("id") REFERENCES "ChallengesConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TotalPoints" ADD CONSTRAINT "TotalPoints_challengesDetailsId_fkey" FOREIGN KEY ("challengesDetailsId") REFERENCES "ChallengesDetails"("puuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preferences" ADD CONSTRAINT "Preferences_challengesDetailsId_fkey" FOREIGN KEY ("challengesDetailsId") REFERENCES "ChallengesDetails"("puuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_challengesDetailsId_fkey" FOREIGN KEY ("challengesDetailsId") REFERENCES "ChallengesDetails"("puuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryPoints" ADD CONSTRAINT "CategoryPoints_challengesDetailsId_fkey" FOREIGN KEY ("challengesDetailsId") REFERENCES "ChallengesDetails"("puuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengesDetails" ADD CONSTRAINT "ChallengesDetails_puuid_fkey" FOREIGN KEY ("puuid") REFERENCES "Summoner"("puuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MatchSummoners" ADD CONSTRAINT "_MatchSummoners_A_fkey" FOREIGN KEY ("A") REFERENCES "Match"("gameId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MatchSummoners" ADD CONSTRAINT "_MatchSummoners_B_fkey" FOREIGN KEY ("B") REFERENCES "Summoner"("puuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengeHeroes" ADD CONSTRAINT "_ChallengeHeroes_A_fkey" FOREIGN KEY ("A") REFERENCES "Challenges"("puuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengeHeroes" ADD CONSTRAINT "_ChallengeHeroes_B_fkey" FOREIGN KEY ("B") REFERENCES "ChampionDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengesChampionOcean" ADD CONSTRAINT "_ChallengesChampionOcean_A_fkey" FOREIGN KEY ("A") REFERENCES "Challenges"("puuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengesChampionOcean" ADD CONSTRAINT "_ChallengesChampionOcean_B_fkey" FOREIGN KEY ("B") REFERENCES "ChampionDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengesAdaptToAllSituations" ADD CONSTRAINT "_ChallengesAdaptToAllSituations_A_fkey" FOREIGN KEY ("A") REFERENCES "Challenges"("puuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengesAdaptToAllSituations" ADD CONSTRAINT "_ChallengesAdaptToAllSituations_B_fkey" FOREIGN KEY ("B") REFERENCES "ChampionDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;
