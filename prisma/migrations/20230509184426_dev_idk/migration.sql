-- CreateTable
CREATE TABLE "Summoner" (
    "summonerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "server" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "profileIconId" INTEGER NOT NULL,
    "puuid" TEXT NOT NULL,
    "summonerLevel" INTEGER NOT NULL,
    "revisionDate" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL
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
CREATE TABLE "ChampionDetails" (
    "id" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
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
    "hp" INTEGER NOT NULL,
    "hpperlevel" INTEGER NOT NULL,
    "mp" INTEGER NOT NULL,
    "mpperlevel" INTEGER NOT NULL,
    "movespeed" INTEGER NOT NULL,
    "armor" INTEGER NOT NULL,
    "armorperlevel" INTEGER NOT NULL,
    "spellblock" INTEGER NOT NULL,
    "spellblockperlevel" INTEGER NOT NULL,
    "attackrange" INTEGER NOT NULL,
    "hpregen" INTEGER NOT NULL,
    "hpregenperlevel" INTEGER NOT NULL,
    "mpregen" INTEGER NOT NULL,
    "mpregenperlevel" INTEGER NOT NULL,
    "crit" INTEGER NOT NULL,
    "critperlevel" INTEGER NOT NULL,
    "attackdamage" INTEGER NOT NULL,
    "attackdamageperlevel" INTEGER NOT NULL,
    "attackspeedperlevel" DOUBLE PRECISION NOT NULL,
    "attackspeed" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ChampionDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Summoner_puuid_key" ON "Summoner"("puuid");

-- CreateIndex
CREATE UNIQUE INDEX "ChampionMastery_championId_puuid_key" ON "ChampionMastery"("championId", "puuid");

-- CreateIndex
CREATE UNIQUE INDEX "ChampionDetails_id_key" ON "ChampionDetails"("id");

-- AddForeignKey
ALTER TABLE "ChampionMastery" ADD CONSTRAINT "ChampionMastery_puuid_fkey" FOREIGN KEY ("puuid") REFERENCES "Summoner"("puuid") ON DELETE RESTRICT ON UPDATE CASCADE;
