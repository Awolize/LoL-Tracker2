// ChampionList.jsx
import ChampionItem from "~/app/_components/champion-item";
import { sortAlgorithm } from "~/utils/champsUtils";
import { useOptionsPersistentContext } from "../stores/options-persistent-store";
import { type CompleteChampionInfo } from "./server-processing-helpers";

const ChampionList = ({ champions }: { champions: CompleteChampionInfo[] }) => {
    const {
        showAvailableChests,
        showLevels,
        filterPoints,
        showMasteryPoints,
        selectedChampions,
        sortOrder,
        showSelectedChampions,
        championsScale,
        toggleSelectedChampion,
    } = useOptionsPersistentContext((state) => state);

    return (
        <div className="w-full p-4">
            <div
                className="grid justify-between gap-2"
                style={{ gridTemplateColumns: `repeat(auto-fill, ${championsScale}px)` }}
            >
                {champions
                    .sort((a, b) => sortAlgorithm(sortOrder, a, b))
                    .map((championInfo) => {
                        const hidden = selectedChampions.has(championInfo.id);

                        if (hidden && !showSelectedChampions) {
                            return null;
                        }

                        return (
                            <ChampionItem
                                key={championInfo.id}
                                champ={championInfo}
                                filterPoints={filterPoints}
                                hiddenChamp={selectedChampions.has(championInfo.id)}
                                showLevel={showLevels}
                                showChest={showAvailableChests}
                                showFinished={false}
                                showMasteryPoints={showMasteryPoints}
                                handleChampionClick={() =>
                                    showSelectedChampions && toggleSelectedChampion(championInfo.id)
                                }
                            />
                        );
                    })}
            </div>
        </div>
    );
};

export default ChampionList;
