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

			<div className="flex flex-1 flex-col text-sm">
				<header className="h-24 w-full flex justify-evenly">
					<div className="flex flex-1 items-center justify-center">
						{current?.value != null && (
							<div className="flex flex-col">
								<div className="flex gap-1">
									<div className="text-gray-400">According to Riot you have finished</div>
									<b>{current?.value}</b>

									{(current?.value ?? 0) - completedChampsLength > 0 ? (
										<>
											<div className="text-gray-400">which means lol.awot.dev is missing </div>
											<div className="flex flex-row">
												<b>{(current?.value ?? 0) - completedChampsLength}</b>
												<div className="text-gray-400">.</div>
											</div>
										</>
									) : (
										<div className="text-gray-400">which means everything is tracked!</div>
									)}
								</div>
								{(current?.value ?? 0) - completedChampsLength > 0 && (
									<>
										<div className="text-gray-400">
											Please make sure to double check the missing ones.
										</div>
									</>
								)}
							</div>
						)}
					</div>
					<div className="flex flex-1 justify-center max-w-52 ">
						<DifferentHeader
							finished={completedChampsLength}
							total={playerChampionInfo.length}
							version={version}
						/>
					</div>
					<div className="flex flex-1 items-center justify-center">
						<div className="flex flex-col items-center justify-center text-gray-400">
							<div>Challenge config is coming.</div>
							<div>(Work in progress, last update: 2024-09-26)</div>
						</div>
					</div>
				</header>
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
