// ChampionList.jsx
import ChampionItem from "~/app/_components/champion-item";
import { useOptionsStore } from "./options-store";

const ChampionList = ({ champions }) => {
    const {
        showAvailableChests,
        showLevels,
        filterPoints,
        showMasteryPoints,
        selectedChampions,
        toggleSelectedChampion,
        championsScale,
    } = useOptionsStore();

    return (
        <div className="w-full p-4">
            <div
                className="grid justify-between"
                style={{ gridTemplateColumns: `repeat(auto-fill, ${championsScale}px)` }}
            >
                {champions.map((championInfo) => (
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
};

export default ChampionList;
