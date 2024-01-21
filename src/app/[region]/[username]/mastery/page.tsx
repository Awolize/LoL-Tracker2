"use server";

import "react-lazy-load-image-component/src/effects/opacity.css";
import { stringify } from "superjson";
import { z } from "zod";

import type { ChallengeIds } from "../../../../utils/champsUtils";
import { getChallengesThresholds2, getPlayerChallengesData2, regionToConstant } from "../../../../utils/champsUtils";

import { useApi } from "~/components/ui/use-api";
import { getUserByNameAndRegion } from "~/server/api/differentHelper";
import { getCompleteChampionData, getMatches } from "../../../../components/ui/server-processing-helpers";
import { Client } from "./client";

const paramsSchema = z.object({
    region: z.string(),
    username: z.string(),
});

export default async function Page({ params }) {
    const { prisma, lolApi, riotApi } = useApi();

    const { region: rawRegion, username: rawUsername } = paramsSchema.parse(params);
    const username = rawUsername.replace("-", "#").toLowerCase();
    const region = regionToConstant(rawRegion.toUpperCase());

    const user = await getUserByNameAndRegion({ prisma, lolApi, riotApi }, username, region);

    const [completeChampionsData, playerChallenges, challengesThresholds, matches] = await Promise.all([
        getCompleteChampionData(prisma, region, user),
        getPlayerChallengesData2(prisma, user),
        getChallengesThresholds2(prisma),
        getMatches(prisma, user),
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
