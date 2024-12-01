-- AlterTable
ALTER TABLE "_ChallengeHeroes" ADD CONSTRAINT "_ChallengeHeroes_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ChallengeHeroes_AB_unique";

-- AlterTable
ALTER TABLE "_ChallengesAdaptToAllSituations" ADD CONSTRAINT "_ChallengesAdaptToAllSituations_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ChallengesAdaptToAllSituations_AB_unique";

-- AlterTable
ALTER TABLE "_ChallengesChampionOcean" ADD CONSTRAINT "_ChallengesChampionOcean_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ChallengesChampionOcean_AB_unique";

-- AlterTable
ALTER TABLE "_ChallengesChampionOcean2024Split3" ADD CONSTRAINT "_ChallengesChampionOcean2024Split3_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ChallengesChampionOcean2024Split3_AB_unique";

-- AlterTable
ALTER TABLE "_ChallengesInvincible" ADD CONSTRAINT "_ChallengesInvincible_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ChallengesInvincible_AB_unique";

-- AlterTable
ALTER TABLE "_MatchSummoners" ADD CONSTRAINT "_MatchSummoners_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_MatchSummoners_AB_unique";
