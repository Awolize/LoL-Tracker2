// SortedChampionList.jsx
import ChampionItem from "~/components/old/champion-item";
import { RoleHeader } from "~/components/old/role-header";
import { useOptionsPersistentContext } from "~/components/stores/options-persistent-store";
import { filteredOut, sortAlgorithm } from "~/utils/champsUtils";
import type { CompleteChampionInfo } from "../../app/[region]/[username]/mastery/page";

const ROLES = ["Top", "Jungle", "Mid", "Bottom", "Support"];
const SortedChampionList = ({ champions }) => {
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

	const playerChampionInfoSorted: CompleteChampionInfo[][] = [];

	for (const role of ROLES) {
		const championsForRole = champions.filter((champion) => champion.role === role);
		playerChampionInfoSorted.push(championsForRole);
	}

	return (
		<div className="flex flex-row gap-2">
			{playerChampionInfoSorted.map((roleChampions, index) => {
				const role = ROLES[index] ?? `Unknown ${index}`;

				roleChampions.sort((a, b) => sortAlgorithm(sortOrder, a, b));
				const finishedChamps = roleChampions.filter(
					(champ) => filteredOut(champ, filterPoints) || selectedChampions.has(champ.id),
				);
				const finishedChampsPercentage = (finishedChamps.length / roleChampions.length) * 100;

				return (
					<div className="w-full p-4" key={role}>
						<RoleHeader
							role={role}
							finishedSize={finishedChamps.length}
							hasHidden={false}
							size={roleChampions.length}
							percentage={finishedChampsPercentage}
						/>

						<div
							className="grid justify-between"
							style={{ gridTemplateColumns: `repeat(auto-fill, ${championsScale}px)` }}
						>
							{roleChampions.map((championInfo) => {
								const hidden = selectedChampions.has(championInfo.id);

								if (hidden && !showSelectedChampions) {
									return null;
								}

								return (
									<ChampionItem
										key={championInfo.id}
										champ={championInfo}
										filterPoints={filterPoints}
										hiddenChamp={hidden}
										showLevel={showLevels}
										showChest={showAvailableChests}
										showMasteryPoints={showMasteryPoints}
										showFinished={false}
										handleChampionClick={() =>
											showSelectedChampions && toggleSelectedChampion(championInfo.id)
										}
									/>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default SortedChampionList;
