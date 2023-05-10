import type { LolApi } from "twisted";
import { Regions } from "twisted/dist/constants";
import type { ChampionMastery, Prisma, PrismaClient } from "@prisma/client";
import type { ChampionMasteryDTO, SummonerV4DTO } from "twisted/dist/models-dto";

export const updateSummoner = async (
    prisma: PrismaClient<Prisma.PrismaClientOptions>,
    api: LolApi,
    username: string,
    region: Regions
) => {
    const { response: user } = await api.Summoner.getByName(username, region);

    await masteryBySummoner(prisma, api, user, region);
};

export const masteryBySummoner = async (
    prisma: PrismaClient<Prisma.PrismaClientOptions>,
    api: LolApi,
    user: SummonerV4DTO,
    region: Regions
) => {
    try {
        // Check if the summoner exists in the database
        const dbUser = await prisma.summoner.findUnique({
            where: { puuid: user.puuid },
            include: {
                championData: true,
            },
        });

        if (dbUser) {
            console.log(`Summoner found in database: ${dbUser.username}, ${dbUser.championData.length}`);
        }

        // If the summoner is not found in the database, fetch their data from the Riot API and save it to the database

        const championMasteryData = dbUser
            ? dbUser.championData
            : (await api.Champion.masteryBySummoner(user.id, region)).response;

        if (!dbUser) {
            console.log(`Summoner not found in database. Fetching data from API...`);
            updateSummonerDb(prisma, user, region, championMasteryData);
        } else {
            console.log(`Summoner found in database. Updating records...`);
            const championMasteryData2 = (await api.Champion.masteryBySummoner(user.id, region)).response;
            console.log(`Summoner found in database. updating ${championMasteryData2.length} champs`);
            await updateSummonerDb(prisma, user, region, championMasteryData2);
            console.log(`Summoner found in database. Updating records... Done`);
        }

        const championMastery: ChampionMasteryDTO[] = championMasteryData.map((mastery) => ({
            summonerId: user.id,
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
        console.log(`Error fetching champion mastery data for summoner ${user.name}: ${error}`);
        throw error;
    }
};

const updateSummonerDb = async (
    prisma: PrismaClient<Prisma.PrismaClientOptions>,
    user: SummonerV4DTO,
    region: Regions,
    championMasteryData: ChampionMastery[] | ChampionMasteryDTO[]
) => {
    try {
        // Step 1: Upsert Summoner
        const upsertedSummoner = await prisma.summoner.upsert({
            where: {
                puuid: user.puuid,
            },
            update: {
                summonerId: user.id,
                server: region,
                username: user.name,
                profileIconId: user.profileIconId,
                summonerLevel: user.summonerLevel,
                revisionDate: new Date(user.revisionDate),
                accountId: user.accountId,
            },
            create: {
                puuid: user.puuid,
                summonerId: user.id,
                server: region,
                username: user.name,
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
                })
            )
        );

        // Step 3: Logging
        console.log(`New summoner ${upsertedSummoner.username}, updated: ${upsertedChampionMasteryData.length}`);
    } catch (error) {
        console.log("Error:", error);
    }
};
