/*
  Warnings:

  - You are about to alter the column `attack` on the `ChampionDetails` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `defense` on the `ChampionDetails` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `magic` on the `ChampionDetails` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `difficulty` on the `ChampionDetails` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "ChampionDetails" ALTER COLUMN "attack" SET DATA TYPE INTEGER,
ALTER COLUMN "defense" SET DATA TYPE INTEGER,
ALTER COLUMN "magic" SET DATA TYPE INTEGER,
ALTER COLUMN "difficulty" SET DATA TYPE INTEGER;
