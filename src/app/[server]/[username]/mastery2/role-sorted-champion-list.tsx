// SortedChampionList.jsx
import ChampionItem from "~/app/_components/champion-item";
import RoleHeader from "~/app/_components/role-header";
import { useOptionsStore } from "./options-store";
import { type CompleteChampionInfo } from "./server-processing-helpers";

const ROLES = ["Top", "Jungle", "Mid", "Bottom", "Support"];
const SortedChampionList = ({ champions }) => {
    const {
        showAvailableChests,
        showLevels,
        filterPoints,
        showMasteryPoints,
        selectedChampions,
        toggleSelectedChampion,
        championsScale,
    } = useOptionsStore();

    const playerChampionInfoSorted: CompleteChampionInfo[][] = [];

    for (const role of ROLES) {
        const championsForRole = champions.filter((champion) => champion.role === role);
        playerChampionInfoSorted.push(championsForRole);
    }

    return (
        <div className="flex flex-row gap-2">
            {playerChampionInfoSorted.map((roleChampions, index) => {
                const role = ROLES[index] ?? `Unknown ${index}`;

                return (
                    <div className="w-full p-4" key={role}>
                        <RoleHeader role={role} finishedSize={0} hasHidden={false} size={0} percentage={0} />

                        <div
                            className="grid justify-between"
                            style={{ gridTemplateColumns: `repeat(auto-fill, ${championsScale}px)` }}
                        >
                            {roleChampions.map((championInfo) => (
                                <ChampionItem
                                    key={championInfo.id}
                                    champ={championInfo}
                                    filterPoints={filterPoints}
                                    hiddenChamp={selectedChampions.has(championInfo.championId)}
                                    showLevel={showLevels}
                                    showChest={showAvailableChests}
                                    showFinished={false}
                                    handleChampionClick={() => toggleSelectedChampion(championInfo.championId)}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SortedChampionList;
