"use client";

import type { ChallengeV1DTO } from "twisted/dist/models-dto/challenges/challenges.dto";

import { parse } from "superjson";
import { type ChallengeId } from "~/utils/champsUtils";
import ChampionList from "./champions-list";
import Header from "./header";
import { useOptionsStore } from "./options-store";
import SortedChampionList from "./role-sorted-champion-list";
import { ScaleSlider } from "./scale-slider";
import { type CompleteChampionInfo } from "./server-processing-helpers";

export function Client({
    username,
    server,
    patch,
    playerChampionInfo,
    ...props
}: {
    username: string;
    server: string;
    playerChampionInfo: CompleteChampionInfo[];
    patch: string;
    challengeIds: string;
    playerChallengesData: string;
    challengesThresholds: string;
}) {
    const challengeIds = parse<ChallengeId[]>(props.challengeIds);
    const playerChallengesData = parse<Map<ChallengeId, ChallengeV1DTO>>(props.playerChallengesData);
    const challengesThresholds = parse<Map<ChallengeId, Record<string, number>>>(props.challengesThresholds);

    playerChampionInfo.sort((a, b) => a.name.localeCompare(b.name));

    const { byRole } = useOptionsStore();

    return (
        <main className="flex flex-col">
            <Header />
            <ScaleSlider />

            {byRole ? (
                <SortedChampionList champions={playerChampionInfo} />
            ) : (
                <ChampionList champions={playerChampionInfo} />
            )}
        </main>
    );
}
