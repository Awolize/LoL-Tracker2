import { type Regions, regionToRegionGroup } from "twisted/dist/constants";
import { RateLimitError } from "twisted/dist/errors";
import { type MatchV5DTOs } from "twisted/dist/models-dto";

import { prisma } from "~/server/db";
import { lolApi } from "~/server/lolApi";

export const upsertSummoner = async (puuid: string, region: Regions) => {
    const { account, summoner } = await getSummonerRateLimit(puuid, region);

    if (!summoner) {
        console.log("Could not find summoner", puuid, region);
        return;
    }

    const upsertedSummoner = await prisma.summoner.upsert({
        where: {
            puuid: summoner.puuid,
        },
        update: {
            summonerId: summoner.id,
            region: region,
            username: summoner.name,
            profileIconId: summoner.profileIconId,
            summonerLevel: summoner.summonerLevel,
            revisionDate: new Date(summoner.revisionDate),
            accountId: summoner.accountId,
            gameName: account.gameName,
            tagLine: account.tagLine,
        },
        create: {
            puuid: summoner.puuid,
            summonerId: summoner.id,
            region: region,
            username: summoner.name,
            profileIconId: summoner.profileIconId,
            summonerLevel: summoner.summonerLevel,
            revisionDate: new Date(summoner.revisionDate),
            accountId: summoner.accountId,
            gameName: account.gameName,
            tagLine: account.tagLine,
        },
    });

    return upsertedSummoner;
};

export const createSummoner = async (puuid: string, region: Regions) => {
    const existingSummoner = await prisma.summoner.findUnique({
        where: {
            puuid: puuid,
        },
    });

    if (existingSummoner) {
        return existingSummoner;
    }

    const { account, summoner } = await getSummonerRateLimit(puuid, region);

    const upsertedSummoner = await prisma.summoner.create({
        data: {
            puuid: summoner.puuid,
            summonerId: summoner.id,
            region: region,
            username: summoner.name,
            profileIconId: summoner.profileIconId,
            summonerLevel: summoner.summonerLevel,
            revisionDate: new Date(summoner.revisionDate),
            accountId: summoner.accountId,
            gameName: account.gameName,
            tagLine: account.tagLine,
        },
    });
    return upsertedSummoner;
};

export const summonersFromGames = (game: MatchV5DTOs.MatchDto) => {
    const participantSummoners = game.metadata.participants;

    // Create or find existing Summoner records for each participant

    const summonerPromises = participantSummoners.map(async (participant) => {
        const region: Regions | null = game.metadata.matchId.split("_")[0] as Regions | null;
        if (!region) {
            console.log(`could not summonersFromGames based on matchId splice ${game.metadata.matchId}`);
            throw new Error(`could not summonersFromGames based on matchId splice ${game.metadata.matchId}`);
        }

        const upsertedSummoner = createSummoner(participant, region);

        return upsertedSummoner;
    });

    return summonerPromises;
};

const getSummonerRateLimit = async (puuid: string, region: Regions) => {
    let retryCount = 0;
    const maxRetries = 30;

    while (retryCount < maxRetries) {
        try {
            const account = (await lolApi.Account.getByPUUID(puuid, regionToRegionGroup(region))).response;
            const summoner = (await lolApi.Summoner.getByPUUID(account.puuid, region)).response;
            return { account, summoner };
        } catch (error) {
            // Check if the error is due to rate limiting
            console.log("type:", typeof error);

            if (error instanceof RateLimitError && error.status === 429) {
                const retryAfter = (error.rateLimits.RetryAfter || 60) + 1;
                console.log(`[Summoner] Rate limited. Retrying after ${retryAfter} seconds...`);
                await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
                retryCount++;
            } else {
                // If it's not a rate limit error, rethrow the error
                throw error;
            }
        }
    }

    // If max retries are reached, throw an error or handle it accordingly
    throw new Error(`Max retries (${maxRetries}) reached. Unable to get summoner data.`);
};
