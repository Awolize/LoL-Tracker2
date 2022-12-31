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
