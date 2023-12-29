"use client";

import type { ChallengeV1DTO } from "twisted/dist/models-dto/challenges/challenges.dto";

import { type Summoner } from "@prisma/client";
import { parse } from "superjson";
import { type ChallengeIds } from "~/utils/champsUtils";
import ChampionList from "./champions-list";
import Header from "./header";
import SortedChampionList from "./role-sorted-champion-list";
import { ScaleSlider } from "./scale-slider";
import { type CompleteChampionInfo } from "./server-processing-helpers";
import { useOptionsStore } from "./stores/options-store";
import { UserProvider } from "./stores/user-store";

export function Client({
    user,
    patch,
    playerChampionInfo,
    ...props
}: {
    user: Summoner;
    playerChampionInfo: CompleteChampionInfo[];
    patch: string;
    challengeIds: string;
    playerChallengesData: string;
    challengesThresholds: string;
}) {
    const challengeIds = parse<ChallengeIds[]>(props.challengeIds);
    const playerChallengesData = parse<Map<ChallengeIds, ChallengeV1DTO>>(props.playerChallengesData);
    const challengesThresholds = parse<Map<ChallengeIds, Record<string, number>>>(props.challengesThresholds);

    playerChampionInfo.sort((a, b) => a.name.localeCompare(b.name));

    const { byRole } = useOptionsStore();

    return (
        <UserProvider user={user}>
            <main className="flex flex-col">
                <Header />
                <ScaleSlider />

                {byRole ? (
                    <SortedChampionList champions={playerChampionInfo} />
                ) : (
                    <ChampionList champions={playerChampionInfo} />
                )}
            </main>
        </UserProvider>
    );
}
