-- AlterTable
ALTER TABLE "ChampionDetails" ALTER COLUMN "version" DROP NOT NULL,
ALTER COLUMN "armorperlevel" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "spellblockperlevel" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "hpregenperlevel" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "mpregenperlevel" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "attackdamageperlevel" SET DATA TYPE DOUBLE PRECISION;