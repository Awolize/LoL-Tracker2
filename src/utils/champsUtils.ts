import type { Summoner } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import type { LolApi } from "twisted";
import { Regions } from "twisted/dist/constants";
import type { ChampionMasteryDTO, ChampionsDataDragonDetails } from "twisted/dist/models-dto";
import type { ChallengeV1DTO } from "twisted/dist/models-dto/challenges/challenges.dto";

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

    return regionMap[region] as Regions;
};

export const masteryBySummoner = async (api: LolApi, region: Regions, user: Summoner) => {
    try {
        const prisma = new PrismaClient();

        // Check if the summoner exists in the database
        const dbUser = await prisma.summoner.findFirst({
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
            : (await api.Champion.masteryBySummoner(user.summonerId, region)).response;

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
        console.log(`Error fetching champion mastery data for summoner ${user.username}: ${error}`);
        throw error;
    }
};

//Partition function, there are other ways but this seems easiest to understand in the future
export const partition = <T>(array: T[], filter): { pass: T[]; fail: T[] } => {
    const pass = array.filter((e, idx, arr) => filter(e, idx, arr));
    const fail = array.filter((e, idx, arr) => !filter(e, idx, arr));
    return { pass, fail };
};

export type ChallengeId = 202303 | 210001 | 401106;

export const isChallengeId = (id: number): id is ChallengeId => [202303, 210001, 401106].includes(id);

export const getPlayerChallengesData = async (api: LolApi, region: Regions, user: Summoner) => {
    const response = await api.Challenges.getPlayerData(user.puuid, region);
    const filteredChallenges = response.response.challenges.filter((challenge) => isChallengeId(challenge.challengeId));
    const challengesMap = filteredChallenges.reduce((map, challenge: ChallengeV1DTO) => {
        map.set(challenge.challengeId as ChallengeId, challenge);
        return map;
    }, new Map<ChallengeId, ChallengeV1DTO>());

    return challengesMap;
};

export const getChallengesThresholds = async (api: LolApi, region: Regions) => {
    const challengeIds: ChallengeId[] = [202303, 210001, 401106];
    const thresholdsMap = new Map<ChallengeId, { [key: string]: number }>();
    for (const challengeId of challengeIds) {
        const thresholds = (await api.Challenges.getChallengeConfig(challengeId, region)).response;
        thresholdsMap.set(challengeId, thresholds.thresholds);
    }
    return thresholdsMap;
};
