import { type PrismaClient } from "@prisma/client";
import { type LolApi } from "twisted";
import { regionToRegionGroup, type Regions } from "twisted/dist/constants";
import { type MatchV5DTOs } from "twisted/dist/models-dto";

export const upsertSummoner = async (
    prisma: PrismaClient,
    lolApi: LolApi,
    puuid: string,
    region: Regions,
    gameName: string,
    tagLine: string,
) => {
    const summoner = (await lolApi.Summoner.getByPUUID(puuid, region)).response;

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
            gameName: gameName,
            tagLine: tagLine,
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
            gameName: gameName,
            tagLine: tagLine,
        },
    });

    return upsertedSummoner;
};

export const summonersFromGames = (prisma: PrismaClient, lolApi: LolApi, game: MatchV5DTOs.MatchDto) => {
    const participantSummoners = game.metadata.participants;

    // Create or find existing Summoner records for each participant

    const summonerPromises = participantSummoners.map(async (participant) => {
        const existingSummoner = await prisma.summoner.findUnique({
            where: {
                puuid: participant,
            },
        });

        if (existingSummoner) {
            return existingSummoner;
        }
        // Create a new Summoner record if it doesn't exist
        const region: Regions | null = game.metadata.matchId.split("_")[0] as Regions | null;
        if (!region) {
            console.log(`could not summonersFromGames based on matchId splice ${game.metadata.matchId}`);
            throw new Error(`could not summonersFromGames based on matchId splice ${game.metadata.matchId}`);
        }

        const account = (await lolApi.Account.getByPUUID(participant, regionToRegionGroup(region))).response;
        const user = (await lolApi.Summoner.getByPUUID(account.puuid, region)).response;

        const upsertedSummoner = await prisma.summoner.create({
            data: {
                puuid: user.puuid,
                summonerId: user.id,
                region: region,
                username: user.name,
                profileIconId: user.profileIconId,
                summonerLevel: user.summonerLevel,
                revisionDate: new Date(user.revisionDate),
                accountId: user.accountId,
                gameName: account.gameName,
                tagLine: account.tagLine,
            },
        });

        return upsertedSummoner;
    });

    return summonerPromises;
};
