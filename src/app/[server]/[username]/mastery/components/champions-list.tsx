// ChampionList.jsx
import ChampionItem from "~/app/_components/champion-item";
import { sortAlgorithm } from "~/utils/champsUtils";
import { useOptionsContext } from "../stores/options-store";
import { type CompleteChampionInfo } from "./server-processing-helpers";

const ChampionList = ({ champions }: { champions: CompleteChampionInfo[] }) => {
    const {
        showAvailableChests,
        showLevels,
        filterPoints,
        showMasteryPoints,
        selectedChampions,
        sortOrder,
        toggleSelectedChampion,
        championsScale,
    } = useOptionsContext((state) => state);

    return (
        <div className="w-full p-4">
            <div
                className="grid justify-between gap-2"
                style={{ gridTemplateColumns: `repeat(auto-fill, ${championsScale}px)` }}
            >
                {champions
                    .sort((a, b) => sortAlgorithm(sortOrder, a, b))
                    .map((championInfo) => {
                        return (
                            <ChampionItem
                                key={championInfo.id}
                                champ={championInfo}
                                filterPoints={filterPoints}
                                hiddenChamp={selectedChampions.has(championInfo.championId)}
                                showLevel={showLevels}
                                showChest={showAvailableChests}
                                showFinished={false}
                                showMasteryPoints={showMasteryPoints}
                                handleChampionClick={() => toggleSelectedChampion(championInfo.championId)}
                            />
                        );
                    })}
            </div>
        </div>
    );
};

export default ChampionList;
