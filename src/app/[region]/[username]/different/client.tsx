"use client";

import { useMemo, useState } from "react";

import type { ChampionDetails, Summoner } from "@prisma/client";
import "react-lazy-load-image-component/src/effects/opacity.css";

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

	console.log(`${user.gameName}#${user.tagLine}`);

	const queryParams = {
		username: `${user.gameName}#${user.tagLine}`,
		region,
	};
	const selectedChallenge = api.differentApi.getJackOfAllChamps.useQuery(queryParams);
	const getChampionOcean = api.differentApi.getChampionOcean.useQuery(queryParams);
	const getAdaptToAllSituations = api.differentApi.getAdaptToAllSituations.useQuery(queryParams);

	const selectedChallengeQuery = useMemo(() => {
		console.log("selected challenge", selectedItem);

		const challengeDataMap = {
			401106: selectedChallenge?.data ?? [],
			602001: getChampionOcean?.data ?? [],
			602002: getAdaptToAllSituations?.data ?? [],
		};

		const mappedData: ChampionDetails[] = selectedItem ? challengeDataMap[selectedItem] : [];
		const mappedCases = Object.keys(challengeDataMap)
			.map(Number)
			.filter((key) => challengeDataMap[key] !== null);

		return {
			data: mappedData,
			cases: mappedCases,
		};
	}, [selectedItem, selectedChallenge, getChampionOcean, getAdaptToAllSituations]);

	const completedChampsLength = selectedChallengeQuery?.data.length;

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

				<div className="flex-1 overflow-y-auto border-gray-800 border-t-2">
					<main className="flex flex-grow flex-row gap-2 overflow-y-auto ">
						{["Top", "Jungle", "Mid", "Bottom", "Support"].map((role) => {
							if (!playerChampionInfo[0]) return;

							const champsWithRole = playerChampionInfo.filter((champ) => champ?.role === role);

							return (
								<div className="w-full px-4" key={role}>
									<DifferentRoleHeader role={role} />
									<ul
										className="grid justify-between"
										style={{ gridTemplateColumns: "repeat(auto-fill, 90px)" }}
									>
										{champsWithRole?.map((champ) => {
											const jacks = selectedChallengeQuery?.data.map((el) => el.key) ?? [];
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
