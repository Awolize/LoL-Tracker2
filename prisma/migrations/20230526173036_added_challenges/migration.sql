-- CreateTable
CREATE TABLE "ChallengesConfig" (
    "id" INTEGER NOT NULL,
    "localizedNames" JSONB NOT NULL,
    "state" TEXT NOT NULL,
    "leaderboard" BOOLEAN NOT NULL,
    "endTimestamp" TIMESTAMP(3),
    "thresholds" JSONB NOT NULL,

    CONSTRAINT "ChallengesConfig_pkey" PRIMARY KEY ("id")
);
