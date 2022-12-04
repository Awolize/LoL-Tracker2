import type { ChampionMasteryDTO, ChampionsDataDragonDetails } from "twisted/dist/models-dto";

export const filteredOut = (champ: CompleteChamptionInfo, filterPoints) => {
  const disabled: boolean = champ.championPoints > filterPoints;
  return disabled;
};

export const sortAlgorithm = (sortOrder, a: CompleteChamptionInfo, b: CompleteChamptionInfo): number => {
  switch (sortOrder) {
    case 0:
      return a.championPoints > b.championPoints ? -1 : 1;
    case 1:
      return a.name.localeCompare(b.name);
    case 2:
      if (a.championLevel === b.championLevel) return a.championPoints > b.championPoints ? -1 : 1;
      else return a.championLevel > b.championLevel ? -1 : 1;
    default:
      return a.name.localeCompare(b.name);
  }
};

interface Roles {
  role: string;
}

type CompleteChamptionInfo = ChampionMasteryDTO & ChampionsDataDragonDetails & Roles;
type incompleteCompleteChamptionInfo = ChampionsDataDragonDetails & Roles;
