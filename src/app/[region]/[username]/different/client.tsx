"use client";

import type { ChampionDetails, Summoner } from "@prisma/client";
import { useMemo, useState } from "react";
import type { Regions } from "twisted/dist/constants";

import { DifferentSideBar } from "~/components/different/different-side-bar";
import { api } from "~/trpc/react";
import type { CompleteChampionInfo } from "../mastery/page";
import { ChampionListHeader } from "./components/ClientHeader";
import { RoleChampionList } from "./components/RoleChampionList";

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
	const [selectedItem, setSelectedItem] = useState<number | null>(null);

	const queryParams = useMemo(
		() => ({ username: `${user.gameName}#${user.tagLine}`, region }),
		[user.gameName, user.tagLine, region],
	);

	const { data: selectedChallengeData } = api.differentApi.getJackOfAllChamps.useQuery(queryParams);
	const { data: championOceanData } = api.differentApi.getChampionOcean.useQuery(queryParams);
	const { data: championOceanData2024Split3 } = api.differentApi.getChampionOcean2024Split3.useQuery(queryParams);
	const { data: adaptToAllSituationsData } = api.differentApi.getAdaptToAllSituations.useQuery(queryParams);
	const { data: invincibleData } = api.differentApi.getInvincible.useQuery(queryParams);

	const challengeDataMap = useMemo(
		() => ({
			202303: invincibleData ?? [],
			401106: selectedChallengeData ?? [],
			602001: championOceanData ?? [],
			2024308: championOceanData2024Split3 ?? [],
			602002: adaptToAllSituationsData ?? [],
		}),
		[
			selectedChallengeData,
			championOceanData,
			championOceanData2024Split3,
			adaptToAllSituationsData,
			invincibleData,
		],
	);

	const selectedChallengeQuery = useMemo(() => {
		const mappedData: ChampionDetails[] = selectedItem ? challengeDataMap[selectedItem] : [];
		const mappedCases = Object.keys(challengeDataMap).map(Number);

		return { data: mappedData, cases: mappedCases };
	}, [selectedItem, challengeDataMap]);

	return (
		<div className="flex w-screen justify-center">
			<DifferentSideBar
				region={region}
				user={user}
				selectedItem={selectedItem}
				setSelectedItem={setSelectedItem}
				mappedCases={selectedChallengeQuery.cases}
			/>

			<div className="flex flex-1 flex-col text-sm">
				<ChampionListHeader
					playerChampionInfo={playerChampionInfo}
					queryParams={queryParams}
					selectedItem={selectedItem}
					completedChampionsSize={selectedChallengeQuery.data?.length ?? 0}
					version={version}
				/>
				<div className="flex-1 overflow-y-auto border-t-2 border-gray-800">
					<RoleChampionList
						playerChampionInfo={playerChampionInfo}
						selectedChallengeData={selectedChallengeQuery.data}
						version={version}
					/>
				</div>
			</div>
		</div>
	);
}
