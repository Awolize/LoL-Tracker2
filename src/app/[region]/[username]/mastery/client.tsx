"use client";

import type { Summoner } from "@prisma/client";

import ChampionList from "~/components/custom/champions-list";
import Header from "~/components/custom/header";
import MatchHistory from "~/components/custom/match-history";
import SortedChampionList from "~/components/custom/role-sorted-champion-list";
import { OptionsProvider, useOptionsPersistentContext } from "~/components/stores/options-persistent-store";
import { UserProvider } from "~/components/stores/user-store";
import type { CompleteMatch } from "~/server/api/routers/processing/champions";
import type { CompleteChampionInfo } from "./page";

export function Client({
	user,
	playerChampionInfo,
	...props
}: {
	user: Summoner;
	playerChampionInfo: CompleteChampionInfo[];
	version: string;
	matches: CompleteMatch[];
}) {
	playerChampionInfo.sort((a, b) => a.name.localeCompare(b.name));

	return (
		<UserProvider user={user}>
			<OptionsProvider persistName={`${user.gameName}-${user.tagLine}`}>
				<Main {...props} playerChampionInfo={playerChampionInfo} user={user} />
			</OptionsProvider>
		</UserProvider>
	);
}

// need to access the useOptionsContext inside the provider
function Main({
	playerChampionInfo,
	matches,
}: {
	user: Summoner;
	playerChampionInfo: CompleteChampionInfo[];
	version: string;
	matches: CompleteMatch[];
}) {
	const byRole = useOptionsPersistentContext((state) => state.byRole);

	return (
		<main className="flex flex-col">
			<Header />

			{byRole ? (
				<SortedChampionList champions={playerChampionInfo} />
			) : (
				<ChampionList champions={playerChampionInfo} />
			)}

			<MatchHistory matches={matches} />
		</main>
	);
}
