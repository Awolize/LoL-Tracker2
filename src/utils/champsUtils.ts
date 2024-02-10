import type { Challenge, Summoner } from "@prisma/client";
import { type PrismaClient } from "@prisma/client";
import type { LolApi } from "twisted";
import { Regions } from "twisted/dist/constants";
import type { ChampionMasteryDTO } from "twisted/dist/models-dto";
import type { ChallengeV1DTO } from "twisted/dist/models-dto/challenges/challenges.dto";
import { type CompleteChampionInfo } from "~/app/[region]/[username]/mastery/components/server-processing-helpers";

export const filteredOut = (champ: CompleteChampionInfo, filterPoints) => {
    const disabled: boolean = champ.championPoints > filterPoints;
    return disabled;
};

export enum SortOrder {
    Points = 0,
    AZ = 1,
    Level = 2,
}

export const sortAlgorithm = (sortOrder: SortOrder, a: CompleteChampionInfo, b: CompleteChampionInfo): number => {
    switch (sortOrder) {
        case SortOrder.Points:
            if (a.championPoints === b.championPoints) {
                return sortAlgorithm(SortOrder.AZ, a, b);
            }
            return a.championPoints > b.championPoints ? -1 : 1;
        case SortOrder.AZ:
            return a.name.localeCompare(b.name);
        case SortOrder.Level:
            if (a.championLevel === b.championLevel) {
                return sortAlgorithm(SortOrder.Points, a, b);
            }
            return a.championLevel > b.championLevel ? -1 : 1;
        default:
            return a.name.localeCompare(b.name);
    }
};

interface Roles {
    role: string;
}

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

    return regionMap[region] as Regions;
};

export const masteryBySummoner = async (prisma: PrismaClient, region: Regions, user: Summoner) => {
    try {
        // Check if the summoner exists in the database
        const dbUser = await prisma.summoner.findFirst({
            where: { puuid: user.puuid },
            include: {
                championData: true,
            },
        });

        if (dbUser) {
            console.log(
                new Date().toLocaleString(),
                `Summoner found in database: ${dbUser.gameName}#${dbUser.tagLine}, ${dbUser.championData.length}`,
            );
        } else {
            console.log(
                new Date().toLocaleString(),
                `Summoner NOT found in database: ${user.gameName} ${user.tagLine}, ${region}`,
            );
        }

        if (!dbUser?.championData) return [];
        // throw new Error(`Could not find championMasteryData, server: ${region}, accountId: ${user.summonerId}`);

        const championMastery: ChampionMasteryDTO[] = dbUser.championData.map((mastery) => ({
            summonerId: dbUser.summonerId,
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

//Partition function, there are other ways but this seems easiest to understand in the future
export const partition = <T>(array: T[], filter): { pass: T[]; fail: T[] } => {
    const pass = array.filter((e, idx, arr) => filter(e, idx, arr));
    const fail = array.filter((e, idx, arr) => !filter(e, idx, arr));
    return { pass, fail };
};

export type ChallengeIds = 202303 | 210001 | 401106;

export const isChallengeId = (id: number): id is ChallengeIds => [202303, 210001, 401106].includes(id);

export const getPlayerChallengesData = async (api: LolApi, region: Regions, user: Summoner) => {
    const response = await api.Challenges.getPlayerData(user.puuid, region);
    const filteredChallenges = response.response.challenges.filter((challenge) => isChallengeId(challenge.challengeId));
    const challengesMap = filteredChallenges.reduce((map, challenge: ChallengeV1DTO) => {
        map.set(challenge.challengeId as ChallengeIds, challenge);
        return map;
    }, new Map<ChallengeIds, ChallengeV1DTO>());

    return challengesMap;
};

export const getPlayerChallengesData2 = async (prisma: PrismaClient, user: Summoner) => {
    const challengesDetails = await prisma.challengesDetails.findFirst({
        where: { puuid: user.puuid },
        include: { challenges: true },
    });

    if (!challengesDetails) {
        console.error(`Could not find summoner challenge data, puuid: ${user.puuid}`);
        return new Map<ChallengeIds, Challenge>();
    }

    const filteredChallenges = challengesDetails.challenges.filter((challenge) => isChallengeId(challenge.challengeId));
    const challengesMap = filteredChallenges.reduce((map, challenge) => {
        map.set(challenge.challengeId as ChallengeIds, challenge);
        return map;
    }, new Map<ChallengeIds, Challenge>());

    return challengesMap;
};

export const getChallengesThresholds = async (lolApi: LolApi, region: Regions) => {
    const challengeIds: ChallengeIds[] = [202303, 210001, 401106];
    const promises = challengeIds.map(async (challengeId) => {
        const thresholds = (await lolApi.Challenges.getChallengeConfig(challengeId, region)).response;
        return { challengeId, thresholds: thresholds.thresholds };
    });

    const results = await Promise.all(promises);

    const thresholdsMap = new Map<ChallengeIds, Record<string, number>>();
    for (const { challengeId, thresholds } of results) {
        thresholdsMap.set(challengeId, thresholds);
    }

    return thresholdsMap;
};

export const getChallengesThresholds2 = async (prisma: PrismaClient) => {
    const challengeIds: ChallengeIds[] = [202303, 210001, 401106];
    const promises = challengeIds.map(async (challengeId) => {
        const thresholds = (await prisma.challengesConfig.findFirst({ where: { id: challengeId } }))?.thresholds;
        return { challengeId, thresholds: thresholds };
    });

    const results = await Promise.all(promises);

    const thresholdsMap = new Map<ChallengeIds, Record<string, number>>();
    for (const { challengeId, thresholds } of results) {
        thresholdsMap.set(challengeId, thresholds as Record<string, number>);
    }

    return thresholdsMap;
};
