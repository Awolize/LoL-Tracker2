"use server";

import "react-lazy-load-image-component/src/effects/opacity.css";
import { stringify } from "superjson";
import { z } from "zod";

import type { ChallengeId } from "../../../../utils/champsUtils";
import { getChallengesThresholds, getPlayerChallengesData, regionToConstant } from "../../../../utils/champsUtils";

import { useApi } from "~/app/_components/use-api";
import { getUserByNameAndServer } from "~/server/api/differentHelper";
import { Client } from "./client";
import { getCompleteChampionData } from "./server-processing-helpers";

const paramsSchema = z.object({
    server: z.string(),
    username: z.string(),
});

export default async function Page({ params }) {
    const { prisma, lolApi, riotApi } = useApi();

    const { server, username: parsedUsername } = paramsSchema.parse(params);
    const username = parsedUsername.replace("-", "#");
    const region = regionToConstant(server.toUpperCase());

    const user = await getUserByNameAndServer({ prisma, lolApi, riotApi }, username, region);

    const [completeChampionsData, playerChallenges, challengesThresholds] = await Promise.all([
        getCompleteChampionData(lolApi, region, user),
        getPlayerChallengesData(lolApi, region, user),
        getChallengesThresholds(lolApi, region),
    ]);

    const challengeIds: ChallengeId[] = [202303, 210001, 401106];

    return (
        <Client
            username={username}
            server={server}
            playerChampionInfo={completeChampionsData.completeChampionsData}
            patch={completeChampionsData.patch}
            challengeIds={stringify(challengeIds)}
            playerChallengesData={stringify(playerChallenges)}
            challengesThresholds={stringify(challengesThresholds)}
        />
    );
}
