-- DropForeignKey
ALTER TABLE "ChallengeLocalization" DROP CONSTRAINT "ChallengeLocalization_id_fkey";

-- AddForeignKey
ALTER TABLE "ChallengeLocalization" ADD CONSTRAINT "ChallengeLocalization_id_fkey" FOREIGN KEY ("id") REFERENCES "ChallengesConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
