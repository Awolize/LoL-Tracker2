import type { Regions } from "twisted/dist/constants";
import { api } from "~/trpc/react";

import type { CompleteChampionInfo } from "~/app/[region]/[username]/mastery/page";
import { DifferentHeaderCounter } from "./different-header-counter";
import { DifferentHeaderProgress } from "./different-header-progress";
import { DifferentHeaderThresholds } from "./different-header-thresholds";

interface ChampionListHeaderProps {
	queryParams: {
		username: string;
		region: Regions;
	};
	selectedItem: number | null;
	completedChampionsSize: number;
	playerChampionInfo: CompleteChampionInfo[];
	version: string;
}

export function ChampionListHeader({
	queryParams,
	selectedItem,
	completedChampionsSize,
	playerChampionInfo,
	version,
}: ChampionListHeaderProps) {
	const { data: challengeConfigs } = api.differentApi.getChallengesConfig.useQuery(queryParams);
	const { data: playerChallenges } = api.differentApi.getPlayerChallengesData.useQuery(queryParams);

	const selectedChallenge = selectedItem ? playerChallenges?.get(selectedItem) ?? null : null;
	const selectedChallengeConfig = challengeConfigs?.data.find((config) => config.id === selectedItem);

	return (
		<header className="flex h-24 w-full justify-evenly">
			<div className="flex flex-1 items-center justify-center">
				<DifferentHeaderProgress
					selectedChallenge={selectedChallenge}
					completedChampionsSize={completedChampionsSize}
				/>
			</div>
			<div className="flex max-w-52 flex-1 justify-center ">
				<DifferentHeaderCounter
					finished={completedChampionsSize}
					total={playerChampionInfo.length}
					version={version}
				/>
			</div>

			<div className="flex flex-1 items-center justify-center">
				<DifferentHeaderThresholds
					thresholds={selectedChallengeConfig?.thresholds ?? null}
					selectedChallenge={selectedChallenge}
				/>
			</div>
		</header>
	);
}
