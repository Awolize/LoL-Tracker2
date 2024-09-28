"use client";

import type { ChampionDetails, Summoner } from "@prisma/client";
import { useMemo, useState } from "react";
import type { Regions } from "twisted/dist/constants";

import { DifferentSideBar } from "~/components/different/different-side-bar";
import { RoleChampionList } from "~/components/different/role-champion-list";
import { ChampionListHeader } from "~/components/different/role-champion-list-header";
import { api } from "~/trpc/react";
import type { CompleteChampionInfo } from "../mastery/page";

export default function Client({
	user,
	region,
	version,
	playerChampionInfo,
}: {
	user: Summoner;
	region: Regions;
	playerChampionInfo: CompleteChampionInfo[];
	version: string;
}) {
	const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);

	const queryParams = useMemo(
		() => ({ username: `${user.gameName}#${user.tagLine}`, region }),
		[user.gameName, user.tagLine, region],
	);

	const { data: jackOfAllChampions } = api.differentApi.getJackOfAllChamps.useQuery(queryParams);
	const { data: championOcean } = api.differentApi.getChampionOcean.useQuery(queryParams);
	const { data: championOcean2024Split3 } = api.differentApi.getChampionOcean2024Split3.useQuery(queryParams);
	const { data: adaptToAllSituations } = api.differentApi.getAdaptToAllSituations.useQuery(queryParams);
	const { data: invincible } = api.differentApi.getInvincible.useQuery(queryParams);

	const challengeDataMap = useMemo(
		() => ({
			202303: invincible ?? [],
			401106: jackOfAllChampions ?? [],
			602001: championOcean ?? [],
			2024308: championOcean2024Split3 ?? [],
			602002: adaptToAllSituations ?? [],
		}),
		[jackOfAllChampions, championOcean, championOcean2024Split3, adaptToAllSituations, invincible],
	);

	const challengeCompletedChampions = useMemo(() => {
		const mappedData: ChampionDetails[] = selectedChallenge ? challengeDataMap[selectedChallenge] : [];
		const mappedCases = Object.keys(challengeDataMap).map(Number);

		return { data: mappedData, cases: mappedCases };
	}, [selectedChallenge, challengeDataMap]);

	return (
		<div className="flex w-screen justify-center">
			<DifferentSideBar
				region={region}
				user={user}
				selectedChallenge={selectedChallenge}
				setSelectedChallenge={setSelectedChallenge}
				mappedCases={challengeCompletedChampions.cases}
			/>

			<div className="flex flex-1 flex-col text-sm">
				<ChampionListHeader
					playerChampionInfo={playerChampionInfo}
					queryParams={queryParams}
					selectedChallenge={selectedChallenge}
					completedChampionsSize={challengeCompletedChampions.data?.length ?? 0}
					version={version}
				/>
				<div className="flex-1 overflow-y-auto border-gray-800 border-t-2">
					<RoleChampionList
						playerChampions={playerChampionInfo}
						challengeCompletedChampions={challengeCompletedChampions.data}
						selectedChallenge={selectedChallenge}
						version={version}
						profileId={user.puuid}
					/>
				</div>
			</div>
		</div>
	);
}
