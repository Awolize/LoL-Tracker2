import { useMemo } from "react";
import type { Regions } from "twisted/dist/constants";
import { api } from "~/trpc/react";

import type { ChampionDetails } from "@prisma/client";
import type { CompleteChampionInfo } from "~/app/[region]/[username]/mastery/page";
import { DifferentHeaderCounter } from "./different-header-counter";
import { DifferentHeaderProgress } from "./different-header-progress";
import { DifferentHeaderThresholds } from "./different-header-thresholds";
import { useChampionStore } from "./use-challenge-champion-store";

interface ChampionListHeaderProps {
	queryParams: {
		username: string;
		region: Regions;
	};
	challengeChampions?: ChampionDetails[];
	selectedChallenge: number | null;
	champions: CompleteChampionInfo[];
	version: string;
	profileId: string;
}

export function ChampionListHeader({
	queryParams,
	selectedChallenge,
	challengeChampions = [],
	champions,
	version,
	profileId,
}: ChampionListHeaderProps) {
	const { manuallyMarked } = useChampionStore();

	const totalSize = useMemo(() => {
		if (!selectedChallenge) return 0;

		const manualList = manuallyMarked?.[profileId]?.[selectedChallenge] ?? new Set<number>();
		const awotList = challengeChampions.map((e) => e.id);

		return new Set([...awotList, ...manualList]).size;
	}, [selectedChallenge, manuallyMarked, profileId, challengeChampions]);

	const { data: challengeConfigs } = api.differentApi.getChallengesConfig.useQuery(queryParams);
	const { data: playerChallenges } = api.differentApi.getPlayerChallengesData.useQuery(queryParams);

	const selectedChallengeData = selectedChallenge ? (playerChallenges?.get(selectedChallenge) ?? null) : null;
	const selectedChallengeConfig = challengeConfigs?.data.find((config) => config.id === selectedChallenge);

	return (
		<header className="flex h-24 w-full justify-evenly">
			<div className="flex flex-1 items-center justify-center">
				<DifferentHeaderProgress
					selectedChallenge={selectedChallengeData}
					completedChampionsSize={totalSize}
					profileId={profileId}
				/>
			</div>
			<div className="flex max-w-52 flex-1 justify-center">
				<DifferentHeaderCounter finished={totalSize} total={champions.length} version={version} />
			</div>
			<div className="flex flex-1 items-center justify-center">
				<DifferentHeaderThresholds
					thresholds={selectedChallengeConfig?.thresholds ?? null}
					selectedChallenge={selectedChallengeData}
				/>
			</div>
		</header>
	);
}
