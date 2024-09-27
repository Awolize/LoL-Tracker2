import type { Regions } from "twisted/dist/constants";
import { api } from "~/trpc/react";

import { DifferentHeader } from "~/components/different/different-header";
import type { CompleteChampionInfo } from "../../mastery/page";
import { ChallengeProgress } from "./ChallengeProgress";
import { ChallengeThresholds } from "./ChallengeThresholds";

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
		<header className="h-24 w-full flex justify-evenly">
			<div className="flex flex-1 items-center justify-center">
				<ChallengeProgress
					selectedChallenge={selectedChallenge}
					completedChampionsSize={completedChampionsSize}
				/>
			</div>
			<div className="flex flex-1 justify-center max-w-52 ">
				<DifferentHeader
					finished={completedChampionsSize}
					total={playerChampionInfo.length}
					version={version}
				/>
			</div>

			<div className="flex flex-1 items-center justify-center">
				<ChallengeThresholds
					thresholds={selectedChallengeConfig?.thresholds ?? null}
					selectedChallenge={selectedChallenge}
				/>
			</div>
		</header>
	);
}
