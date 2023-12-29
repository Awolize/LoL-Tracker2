import { type PrismaClient } from "@prisma/client";
import { type LolApi } from "twisted";
import { type Regions } from "twisted/dist/constants";

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
            server: region,
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
            server: region,
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
