"use server";

import type { Summoner } from "@prisma/client";
import "react-lazy-load-image-component/src/effects/opacity.css";
import { stringify } from "superjson";
import { type LolApi } from "twisted";
import type { Regions } from "twisted/dist/constants";
import type { ChampionMasteryDTO, ChampionsDataDragonDetails } from "twisted/dist/models-dto";
import { z } from "zod";

import type { ChallengeId } from "../../../../utils/champsUtils";
import {
    getChallengesThresholds,
    getPlayerChallengesData,
    masteryBySummoner,
    regionToConstant,
} from "../../../../utils/champsUtils";

import { useApi } from "~/app/_components/use-api";
import { getUserByNameAndServer } from "~/server/api/differentHelper";
import rolesJson from "../roles.json";
import { Client } from "./client";

interface Roles {
    role: string;
}

export type CompleteChampionInfo = ChampionMasteryDTO & ChampionsDataDragonDetails & Roles;

const paramsSchema = z.object({
    server: z.string(),
    username: z.string(),
});

export default async function Page({ params }) {
    const { server, username: parsedUsername } = paramsSchema.parse(params);
    const username = parsedUsername.replace("-", "#");
    const region = regionToConstant(server.toUpperCase());

    const { prisma, lolApi, riotApi } = useApi();

    const user = await getUserByNameAndServer({ prisma, lolApi, riotApi }, username, region);

    const [completeChampsData, playerChallenges, challengesThresholds] = await Promise.all([
        getCompleteChampionData(lolApi, region, user),
        getPlayerChallengesData(lolApi, region, user),
        getChallengesThresholds(lolApi, region),
    ]);

    const challengeIds: ChallengeId[] = [202303, 210001, 401106];

    const props = {
        username,
        server,
        champData: completeChampsData.completeChampsData,
        patch: completeChampsData.patch,
        challengeIds: stringify(challengeIds),
        playerChallengesData: stringify(playerChallenges),
        challengesThresholds: stringify(challengesThresholds),
    };

    return <Client {...props} />;
}

async function getCompleteChampionData(lolApi: LolApi, region: Regions, user: Summoner) {
    const championMasteries = await masteryBySummoner(lolApi, region, user);
    const championsDD = await lolApi.DataDragon.getChampion();

    const completeChampsData = Object.values(championsDD.data)
        .map((champion) => {
            const role = rolesJson[champion.id as keyof typeof championsDD.data] || "Bottom";

            const personalChampData = championMasteries.find((champ) => champ.championId.toString() === champion.key);

            if (personalChampData) {
                const { championPoints = 0, championLevel = 0 } = personalChampData;

                return {
                    ...champion,
                    ...personalChampData,
                    championPoints,
                    championLevel,
                    role: role,
                    name: champion.name === "Nunu & Willump" ? "Nunu" : champion.name,
                } as CompleteChampionInfo;
            }
            return {
                ...champion,
                championPoints: 0,
                championLevel: 0,
                championId: parseInt(champion.key, 10),
                role,
            } as CompleteChampionInfo;
        })
        .filter(Boolean);

    const patch = championsDD.version;

    return { completeChampsData, patch };
}
