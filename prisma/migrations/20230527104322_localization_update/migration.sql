/*
  Warnings:

  - You are about to drop the column `localizedNames` on the `ChallengesConfig` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('en_US');

-- AlterTable
ALTER TABLE "ChallengesConfig" DROP COLUMN "localizedNames";

-- CreateTable
CREATE TABLE "ChallengeLocalization" (
    "id" INTEGER NOT NULL,
    "language" "Language" NOT NULL,
    "description" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeLocalization_id_language_key" ON "ChallengeLocalization"("id", "language");

-- AddForeignKey
ALTER TABLE "ChallengeLocalization" ADD CONSTRAINT "ChallengeLocalization_id_fkey" FOREIGN KEY ("id") REFERENCES "ChallengesConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
