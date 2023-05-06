import React from "react";
import RoleHeader from "./RoleHeader";
import { CompleteChampionInfo } from "../pages/[server]/[username]/mastery";
import { filteredOut, partition, sortAlgorithm } from "../utils/champsUtils";

interface MainComponentProps {
    champs: CompleteChampionInfo[];
    handleChampionClick: (championId: number) => void;
    filterPoints: number;
    showFinished: boolean;
    showLevel: boolean;
    hiddenChamps: Set<number>;
    hideChampionsMode: boolean;
    sortOrder: string;
}

export const RolesList: React.FC<MainComponentProps> = ({
    champs,
    handleChampionClick,
    filterPoints,
    showFinished,
    showLevel,
    hiddenChamps,
    hideChampionsMode,
    sortOrder,
}) => {
    return (
        <main>
            <div className="flex flex-row gap-2">
                {["Top", "Jungle", "Mid", "Bottom", "Support"].map((role) => {
                    if (!champs[0]) return null;

                    const champsWithRole = champs.filter((champ) => champ?.role === role);

                    const champsWithRoleHiddenExcluded = hideChampionsMode
                        ? champsWithRole
                        : champsWithRole.filter((champ) => !hiddenChamps.has(champ.championId));

                    const [doneChamps, todoChamps] = partition(champsWithRoleHiddenExcluded, (champ) =>
                        filteredOut(champ, filterPoints)
                    );
                    doneChamps?.sort((a, b) => sortAlgorithm(sortOrder, a, b));
                    todoChamps?.sort((a, b) => sortAlgorithm(sortOrder, a, b));

                    const size: number = champsWithRole.filter((champ) => !hiddenChamps.has(champ.championId)).length;
                    const markedSize: number = champsWithRole.filter((champ) => {
                        if (champ == undefined) return false;
                        return filteredOut(champ, filterPoints);
                    }).length;
                    const percentage = (100 * markedSize) / size;

                    return (
                        <div className="w-full p-4" key={role}>
                            <RoleHeader role={role} markedSize={markedSize} size={size} percentage={percentage} />
                            <ChampionList
                                role={role}
                                todoChamps={todoChamps}
                                doneChamps={doneChamps}
                                handleChampionClick={handleChampionClick}
                                filterPoints={filterPoints}
                                showFinished={showFinished}
                                showLevel={showLevel}
                                hiddenChamps={hiddenChamps}
                            />
                        </div>
                    );
                })}
            </div>
        </main>
    );
};
