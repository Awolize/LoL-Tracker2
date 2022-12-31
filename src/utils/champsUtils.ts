import { Regions } from "twisted/dist/constants";
import type { ChampionMasteryDTO, ChampionsDataDragonDetails } from "twisted/dist/models-dto";

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
