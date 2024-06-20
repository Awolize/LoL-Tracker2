import { Regions } from "twisted/dist/constants";
import type { CompleteChampionInfo } from "~/app/[region]/[username]/mastery/page";

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

//Partition function, there are other ways but this seems easiest to understand in the future
export const partition = <T>(array: T[], filter): { pass: T[]; fail: T[] } => {
	const pass = array.filter((e, idx, arr) => filter(e, idx, arr));
	const fail = array.filter((e, idx, arr) => !filter(e, idx, arr));
	return { pass, fail };
};

export type ChallengeIds = 202303 | 210001 | 401106;

export const isChallengeId = (id: number): id is ChallengeIds => [202303, 210001, 401106].includes(id);
