import { prisma } from "~/server/db";
import { lolApi } from "~/server/lolApi";

import type { ChallengesConfig } from "@prisma/client";
import type { Regions } from "twisted/dist/constants";
import type { ChallengeConfigV1DTO } from "twisted/dist/models-dto";

const updateConfig = async (config: ChallengeConfigV1DTO): Promise<ChallengesConfig> => {
    const upsertedConfig = await prisma.challengesConfig.upsert({
        where: { id: config.id },
        update: {
            state: config.state,
            leaderboard: config.leaderboard,
            endTimestamp: config.endTimestamp ? new Date(config.endTimestamp) : null,
            thresholds: config.thresholds,
        },
        create: {
            id: config.id,
            state: config.state,
            leaderboard: config.leaderboard,
            endTimestamp: config.endTimestamp ? new Date(config.endTimestamp) : null,
            thresholds: config.thresholds,
        },
    });

    const localizedName = config.localizedNames.en_US;

    await prisma.challengeLocalization.upsert({
        where: { id_language: { id: config.id, language: "en_US" } },
        update: {
            description: localizedName.description,
            name: localizedName.name,
            shortDescription: localizedName.shortDescription,
        },
        create: {
            id: config.id,
            language: "en_US",
            description: localizedName.description,
            name: localizedName.name,
            shortDescription: localizedName.shortDescription,
        },
    });

    return upsertedConfig;
};

export const updateChallengesConfig = async (region: Regions) => {
    const challengesConfig: ChallengeConfigV1DTO[] = (await lolApi.Challenges.getConfig(region)).response;
    const upsertedConfigs = await Promise.all(
        challengesConfig.map(async (config) => {
            return updateConfig(config);
        }),
    );
    return upsertedConfigs;
};
