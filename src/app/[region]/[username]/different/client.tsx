"use client";

import type { ChampionDetails, Summoner } from "@prisma/client";
import { useMemo, useState } from "react";
import type { Regions } from "twisted/dist/constants";

import { DifferentChampionItem } from "~/components/different/different-champion-item";
import { DifferentHeader } from "~/components/different/different-header";
import { DifferentRoleHeader } from "~/components/different/different-role-header";
import { DifferentSideBar } from "~/components/different/different-side-bar";
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
	const [selectedItem, setSelectedItem] = useState<number | null>(null);

	const queryParams = useMemo(
		() => ({ username: `${user.gameName}#${user.tagLine}`, region }),
		[user.gameName, user.tagLine, region],
	);

	const { data: challengeConfigData } = api.differentApi.getPlayerChallengesData.useQuery(queryParams);
	const { data: selectedChallengeData } = api.differentApi.getJackOfAllChamps.useQuery(queryParams);
	const { data: championOceanData } = api.differentApi.getChampionOcean.useQuery(queryParams);
	const { data: championOceanData2024Split3 } = api.differentApi.getChampionOcean2024Split3.useQuery(queryParams);
	const { data: adaptToAllSituationsData } = api.differentApi.getAdaptToAllSituations.useQuery(queryParams);
	const { data: invincibleData } = api.differentApi.getInvincible.useQuery(queryParams);

	const current =
		challengeConfigData && selectedItem && challengeConfigData.has(selectedItem)
			? challengeConfigData.get(selectedItem)
			: null;

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
		const mappedCases = Object.keys(challengeDataMap)
			.map(Number)
			.filter((key) => challengeDataMap[key]?.length > 0);

		return { data: mappedData, cases: mappedCases };
	}, [selectedItem, challengeDataMap]);

	const completedChampsLength = selectedChallengeQuery.data?.length ?? 0;

	return (
		<div className="flex w-screen justify-center">
			<DifferentSideBar
				region={region}
				user={user}
				selectedItem={selectedItem}
				setSelectedItem={setSelectedItem}
				mappedCases={selectedChallengeQuery.cases}
			/>

			<div className="flex flex-1 flex-col">
				<header className="h-24">
					<DifferentHeader
						finished={completedChampsLength}
						total={playerChampionInfo.length}
						version={version}
					/>
				</header>
				{current?.value != null && (
					<>
						Riot: {current?.value} <br />
						{(current?.value ?? 0) - completedChampsLength > 0 && (
							<>(lol.awot.dev is missing {(current?.value ?? 0) - completedChampsLength})</>
						)}
					</>
				)}
				<div className="flex-1 overflow-y-auto border-t-2 border-gray-800">
					<main className="flex flex-grow flex-row gap-2 overflow-y-auto">
						{["Top", "Jungle", "Mid", "Bottom", "Support"].map((role) => {
							const champsWithRole = playerChampionInfo.filter((champ) => champ?.role === role);

							return (
								<div className="w-full px-4" key={role}>
									<DifferentRoleHeader role={role} />
									<ul
										className="grid justify-between"
										style={{ gridTemplateColumns: "repeat(auto-fill, 90px)" }}
									>
										{champsWithRole.map((champ) => {
											const jacks = selectedChallengeQuery.data?.map((el) => el.key) ?? [];
											const hide = jacks.includes(champ.key);

											return (
												<DifferentChampionItem
													key={champ.key}
													hide={hide}
													champ={champ}
													version={version}
												/>
											);
										})}
									</ul>
								</div>
							);
						})}
					</main>
				</div>
			</div>
		</div>
	);
}
