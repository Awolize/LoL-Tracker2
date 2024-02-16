import type { ChampionMastery, PrismaClient, Summoner } from "@prisma/client";
import type { Regions } from "twisted/dist/constants";
import type { ChampionMasteryDTO } from "twisted/dist/models-dto";

import { prisma } from "~/server/db";
import { lolApi } from "~/server/lolApi";
import { riotApi } from "~/server/riotApi";

import { getUserByNameAndRegion } from "../server/api/differentHelper";

export const updateSummoner = async (username: string, region: Regions) => {
    const user = await getUserByNameAndRegion(username.toLowerCase(), region);

    await masteryBySummoner(user, region);
};

export const masteryBySummoner = async (user: Summoner, region: Regions) => {
    try {
        // Check if the summoner exists in the database
        let dbUser = await prisma.summoner.findUnique({
            where: { puuid: user.puuid },
            include: {
                championData: true,
            },
        });

        console.log("Updating summoner in db with mastery scores");
        try {
            const masteryData = (await lolApi.Champion.masteryByPUUID(user.puuid, region)).response;
            await updateSummonerDb(user, region, masteryData);
            console.log("Done - Updating summoner in db with mastery scores");
        } catch (error) {
            console.error("Failed - Updating summoner in db with mastery scores");
        }

        // Now the user should exist in the db, fetch championData.
        dbUser = await prisma.summoner.findUnique({
            where: { puuid: user.puuid },
            include: {
                championData: true,
            },
        });

        const championMasteryData = dbUser?.championData ?? [];

        const championMastery: ChampionMasteryDTO[] = championMasteryData.map((mastery) => ({
            summonerId: user.summonerId,
            championId: mastery.championId,
            championLevel: mastery.championLevel,
            championPoints: mastery.championPoints,
            lastPlayTime: new Date(mastery.lastPlayTime).getTime(),
            championPointsSinceLastLevel: mastery.championPointsSinceLastLevel,
            championPointsUntilNextLevel: mastery.championPointsUntilNextLevel,
            chestGranted: mastery.chestGranted,
            tokensEarned: mastery.tokensEarned,
        }));

        return championMastery;
    } catch (error) {
        console.log(
            `Error fetching champion mastery data for summoner ${user.gameName}#${user.tagLine} (${user.region}):`,
            error,
        );
        throw error;
    }
};

const updateSummonerDb = async (
    user: Summoner,
    region: Regions,
    championMasteryData: ChampionMastery[] | ChampionMasteryDTO[],
) => {
    try {
        // Step 1: Upsert Summoner
        const upsertedSummoner = await prisma.summoner.upsert({
            where: {
                puuid: user.puuid,
            },
            update: {
                summonerId: user.summonerId,
                region: region,
                username: user.username,
                profileIconId: user.profileIconId,
                summonerLevel: user.summonerLevel,
                revisionDate: new Date(user.revisionDate),
                accountId: user.accountId,
            },
            create: {
                puuid: user.puuid,
                summonerId: user.summonerId,
                region: region,
                username: user.username,
                profileIconId: user.profileIconId,
                summonerLevel: user.summonerLevel,
                revisionDate: new Date(user.revisionDate),
                accountId: user.accountId,
            },
        });

        console.log(`New summoner added/updated: ${upsertedSummoner.username}`);

        // Step 2: Upsert Champion Mastery Data
        const upsertedChampionMasteryData = await Promise.all(
            championMasteryData.map((mastery) =>
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

        // Step 3: Logging
        console.log(`New summoner ${upsertedSummoner.username}, updated: ${upsertedChampionMasteryData.length}`);
    } catch (error) {
        console.log("Error:", error);
    }
};
