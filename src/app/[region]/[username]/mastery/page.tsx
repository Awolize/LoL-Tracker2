"use server";

import "react-lazy-load-image-component/src/effects/opacity.css";
import { stringify } from "superjson";
import { z } from "zod";

import type { ChallengeIds } from "../../../../utils/champsUtils";
import { getChallengesThresholds2, getPlayerChallengesData2, regionToConstant } from "../../../../utils/champsUtils";

import { getUserByNameAndRegion } from "~/server/api/differentHelper";
import { Client } from "./client";
import { getCompleteChampionData, getMatches } from "./components/server-processing-helpers";

const paramsSchema = z.object({
    region: z.string(),
    username: z.string(),
});

export default async function Page({ params }) {
    const { region: rawRegion, username: rawUsername } = paramsSchema.parse(params);
    const username = rawUsername.replace("-", "#").toLowerCase();
    const region = regionToConstant(rawRegion.toUpperCase());

    const user = await getUserByNameAndRegion(username, region);

    const [completeChampionsData, playerChallenges, challengesThresholds, matches] = await Promise.all([
        getCompleteChampionData(region, user),
        getPlayerChallengesData2(user),
        getChallengesThresholds2(),
        getMatches(user),
    ]);

    const challengeIds: ChallengeIds[] = [202303, 210001, 401106];

    return (
        <Client
            user={user}
            playerChampionInfo={completeChampionsData.completeChampionsData}
            patch={completeChampionsData.patch}
            challengeIds={stringify(challengeIds)}
            playerChallengesData={stringify(playerChallenges)}
            challengesThresholds={stringify(challengesThresholds)}
            matches={matches}
        />
    );
}
