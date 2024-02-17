"use client";

import type { ChallengeV1DTO } from "twisted/dist/models-dto/challenges/challenges.dto";

import { type Summoner } from "@prisma/client";
import { parse } from "superjson";
import { OptionsProvider, useOptionsPersistentContext } from "~/components/stores/options-persistent-store";
import { UserProvider } from "~/components/stores/user-store";
import { CompleteMatch } from "~/server/api/routers/processing/champions";
import { type ChallengeIds } from "~/utils/champsUtils";
import ChampionList from "./components/champions-list";
import Header from "./components/header";
import MatchHistory from "./components/match-history";
import SortedChampionList from "./components/role-sorted-champion-list";
import { CompleteChampionInfo } from "./page";

export function Client({
    user,
    playerChampionInfo,
    ...props
}: {
    user: Summoner;
    playerChampionInfo: CompleteChampionInfo[];
    patch: string;
    challengeIds: string;
    playerChallengesData: string;
    challengesThresholds: string;
    matches: CompleteMatch[];
}) {
    const challengeIds = parse<ChallengeIds[]>(props.challengeIds);
    const playerChallengesData = parse<Map<ChallengeIds, ChallengeV1DTO>>(props.playerChallengesData);
    const challengesThresholds = parse<Map<ChallengeIds, Record<string, number>>>(props.challengesThresholds);

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
    user,
    patch,
    playerChampionInfo,
    matches,
    ...props
}: {
    user: Summoner;
    playerChampionInfo: CompleteChampionInfo[];
    patch: string;
    challengeIds: string;
    playerChallengesData: string;
    challengesThresholds: string;
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
