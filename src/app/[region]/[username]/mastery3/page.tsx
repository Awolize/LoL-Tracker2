"use server";

import "react-lazy-load-image-component/src/effects/opacity.css";
import { stringify } from "superjson";
import { z } from "zod";

import type { ChallengeIds } from "../../../../utils/champsUtils";
import { getChallengesThresholds, getPlayerChallengesData, regionToConstant } from "../../../../utils/champsUtils";

import { useApi } from "~/app/_components/use-api";
import { getUserByNameAndRegion } from "~/server/api/differentHelper";
import { getCompleteChampionData } from "../mastery/components/server-processing-helpers";
import { Client } from "./client";

const paramsSchema = z.object({
    region: z.string(),
    username: z.string(),
});

export default async function Page({ params }) {
    const { region: rawRegion, username: rawUsername } = paramsSchema.parse(params);
    const username = rawUsername.replace("-", "#").toLowerCase();
    const region = regionToConstant(rawRegion.toUpperCase());

    const { prisma, lolApi, riotApi } = useApi();

    const user = await getUserByNameAndRegion({ prisma, lolApi, riotApi }, username, region);

    const [completeChampsData, playerChallenges, challengesThresholds] = await Promise.all([
        getCompleteChampionData(prisma, region, user),
        getPlayerChallengesData(lolApi, region, user),
        getChallengesThresholds(lolApi, region),
    ]);

    const challengeIds: ChallengeIds[] = [202303, 210001, 401106];

    const props = {
        username,
        region,
        champData: completeChampsData.completeChampionsData,
        patch: completeChampsData.patch,
        challengeIds: stringify(challengeIds),
        playerChallengesData: stringify(playerChallenges),
        challengesThresholds: stringify(challengesThresholds),
    };

    return <Client {...props} />;
}
