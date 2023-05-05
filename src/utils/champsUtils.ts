import { LolApi } from "twisted";
import { Regions } from "twisted/dist/constants";
import type { ChampionMasteryDTO, ChampionsDataDragonDetails, SummonerV4DTO } from "twisted/dist/models-dto";

export const filteredOut = (champ: CompleteChampionInfo, filterPoints) => {
    const disabled: boolean = champ.championPoints > filterPoints;
    return disabled;
};

export const sortAlgorithm = (sortOrder, a: CompleteChampionInfo, b: CompleteChampionInfo): number => {
    switch (sortOrder) {
        case 0:
            if (a.championPoints === b.championPoints) {
                return sortAlgorithm(-1, a, b);
            } else {
                return a.championPoints > b.championPoints ? -1 : 1;
            }
        case 1:
            return a.name.localeCompare(b.name);
        case 2:
            if (a.championLevel === b.championLevel) {
                return sortOrder(0, a, b);
            } else {
                return a.championLevel > b.championLevel ? -1 : 1;
            }
        default:
            return a.name.localeCompare(b.name);
    }
};

interface Roles {
    role: string;
}

type CompleteChampionInfo = ChampionMasteryDTO & ChampionsDataDragonDetails & Roles;

export const regionToConstant = (region: string) => {
    const regionMap = {
        BR: Regions.BRAZIL,
        EUNE: Regions.EU_EAST,
        EUW: Regions.EU_WEST,
        KR: Regions.KOREA,
        LA1: Regions.LAT_NORTH,
        LA2: Regions.LAT_SOUTH,
        NA: Regions.AMERICA_NORTH,
        OC: Regions.OCEANIA,
        TR: Regions.TURKEY,
        RU: Regions.RUSSIA,
        JP: Regions.JAPAN,
        PBE: Regions.PBE,
    };

    if (!regionMap[region]) {
        throw new Error(`Invalid region: ${region}`);
    }

    return regionMap[region];
};

import { ChampionMastery, PrismaClient } from "@prisma/client";
export const masteryBySummoner = async (api: LolApi, region: Regions, user: SummonerV4DTO) => {
    try {
        const prisma = new PrismaClient();

        // Check if the summoner exists in the database
        const dbUser = await prisma.summoner.findUnique({
            where: { summonerId: user.id },
            include: {
                championData: true,
            },
        });

        if (dbUser) {
            console.log(`Summoner found in database: ${dbUser.username}`);
        }

        // If the summoner is not found in the database, fetch their data from the Riot API and save it to the database

        const championMasteryData = dbUser
            ? dbUser.championData
            : (await api.Champion.masteryBySummoner(user.id, region)).response;

        if (!dbUser) {
            console.log(`Summoner not found in database. Fetching data from API...`);
            updateSummoner(prisma, user, region, championMasteryData);
        } else {
            const updateSum = async () => {
                console.log(`Summoner found in database. Updating records...`);
                const championMasteryData2 = (await api.Champion.masteryBySummoner(user.id, region)).response;
                updateSummoner(prisma, user, region, championMasteryData2);
                console.log(`Summoner found in database. Updating records... Done`);
            };
            updateSum();
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

export const getChallengesData = async (api: LolApi, region: Regions, user: SummonerV4DTO) => {
    const response = await api.Challenges.getPlayerData(user.puuid, region);
    const savedChallenges = [202303, 210001, 401106];
    const filteredChallenges = response.response.challenges.filter((challenge) =>
        savedChallenges.includes(challenge.challengeId)
    );
    return filteredChallenges;
};

export const getChallengesThresholds = async (api: LolApi, region: Regions) => {
    const challengeIds = [202303, 210001, 401106];
    const thresholdsList: { [key: string]: number }[] = [];
    for (const challengeId of challengeIds) {
        const thresholds = (await api.Challenges.getChallengeConfig(challengeId, region)).response;
        thresholdsList.push(thresholds.thresholds);
    }
    return thresholdsList;
};

const updateSummoner = (
    prisma,
    user: SummonerV4DTO,
    region: Regions,
    championMasteryData: ChampionMastery[] | ChampionMasteryDTO[]
) => {
    prisma.summoner
        .upsert({
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
                championData: {
                    createMany: {
                        data: championMasteryData.map((mastery) => ({
                            championId: mastery.championId,
                            championLevel: mastery.championLevel,
                            championPoints: mastery.championPoints,
                            lastPlayTime: new Date(mastery.lastPlayTime),
                            championPointsSinceLastLevel: mastery.championPointsSinceLastLevel,
                            championPointsUntilNextLevel: mastery.championPointsUntilNextLevel,
                            chestGranted: mastery.chestGranted,
                            tokensEarned: mastery.tokensEarned,
                        })),
                    },
                },
            },
            create: {
                summonerId: user.id,
                server: region,
                username: user.name,
                profileIconId: user.profileIconId,
                puuid: user.puuid,
                summonerLevel: user.summonerLevel,
                revisionDate: new Date(user.revisionDate),
                accountId: user.accountId,
                championData: {
                    createMany: {
                        data: championMasteryData.map((mastery) => ({
                            championId: mastery.championId,
                            championLevel: mastery.championLevel,
                            championPoints: mastery.championPoints,
                            lastPlayTime: new Date(mastery.lastPlayTime),
                            championPointsSinceLastLevel: mastery.championPointsSinceLastLevel,
                            championPointsUntilNextLevel: mastery.championPointsUntilNextLevel,
                            chestGranted: mastery.chestGranted,
                            tokensEarned: mastery.tokensEarned,
                        })),
                    },
                },
            },
        })
        .then((newSummoner) => console.log(`New summoner added to database: ${newSummoner.username}`));
};
