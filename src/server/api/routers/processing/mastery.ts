import type { Summoner } from "@prisma/client";
import type { Regions } from "twisted/dist/constants";

import { prisma } from "~/server/db";
import { lolApi } from "~/server/lolApi";
import { riotApi } from "~/server/riotApi";

export const upsertMastery = async (user: Summoner, region: Regions) => {
    try {
        const masteryData = (await lolApi.Champion.masteryByPUUID(user.puuid, region)).response;

        const upsertedMasteryData = await Promise.all(
            masteryData.map((mastery) =>
                prisma.championMastery.upsert({
                    where: {
                        championId_puuid: {
                            championId: mastery.championId,
                            puuid: user.puuid,
                        },
                    },
                    update: {
                        championLevel: mastery.championLevel,
                        championPoints: mastery.championPoints,
                        lastPlayTime: new Date(mastery.lastPlayTime),
                        championPointsSinceLastLevel: mastery.championPointsSinceLastLevel,
                        championPointsUntilNextLevel: mastery.championPointsUntilNextLevel,
                        chestGranted: mastery.chestGranted,
                        tokensEarned: mastery.tokensEarned,
                    },
                    create: {
                        championId: mastery.championId,
                        puuid: user.puuid,
                        championLevel: mastery.championLevel,
                        championPoints: mastery.championPoints,
                        lastPlayTime: new Date(mastery.lastPlayTime),
                        championPointsSinceLastLevel: mastery.championPointsSinceLastLevel,
                        championPointsUntilNextLevel: mastery.championPointsUntilNextLevel,
                        chestGranted: mastery.chestGranted,
                        tokensEarned: mastery.tokensEarned,
                    },
                }),
            ),
        );

        return upsertedMasteryData;
    } catch (error) {
        console.error("Error in upsertMastery:", error);
        throw error; // Re-throw the error to propagate it up the call stack
    }
};
