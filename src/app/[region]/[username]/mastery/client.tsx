"use client";

import type { ChallengeV1DTO } from "twisted/dist/models-dto/challenges/challenges.dto";

import { type Summoner } from "@prisma/client";
import { parse } from "superjson";
import { type ChallengeIds } from "~/utils/champsUtils";
import ChampionList from "./components/champions-list";
import Header from "./components/header";
import MatchHistory from "./components/match-history";
import SortedChampionList from "./components/role-sorted-champion-list";
import { type CompleteChampionInfo, type CompleteMatch } from "./components/server-processing-helpers";
import { OptionsProvider, useOptionsContext } from "./stores/options-store";
import { UserProvider } from "./stores/user-store";

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
    const byRole = useOptionsContext((state) => state.byRole);

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
