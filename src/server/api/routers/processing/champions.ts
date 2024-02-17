import { Match, MatchInfo, Summoner } from "@prisma/client";
import { Regions } from "twisted/dist/constants";
import { CompleteChampionInfo } from "~/app/[region]/[username]/mastery/page";
import { flattenChamp } from "../../differentHelper";

import { prisma } from "~/server/db";
import { lolApi } from "~/server/lolApi";
import { riotApi } from "~/server/riotApi";
import rolesJson from "./roles.json";
import { masteryBySummoner } from "./summoner";

export async function updateChampionDetails() {
    const data = await lolApi.DataDragon.getChampion();
    const champions = Object.values(data.data);

    await Promise.all(
        champions.map(async (champion) => {
            if (!champion) return;

            const championDetails = flattenChamp(champion);

            await prisma.championDetails.upsert({
                where: { id: championDetails.id },
                update: championDetails,
                create: championDetails,
            });
        }),
    );
}

export async function getCompleteChampionData(region: Regions, user: Summoner) {
    const championMasteries = await masteryBySummoner(region, user);
    const champions = await prisma.championDetails.findMany();

    const completeChampionsData = champions.map((champion) => {
        const role = rolesJson[champion.key] || "Bottom";
        const personalChampData = championMasteries.find((champ) => champ.championId === champion.id) ?? {
            championPoints: 0,
            championLevel: 0,
        };

        const { championPoints, championLevel } = personalChampData;

        return {
            ...champion,
            ...personalChampData,
            championPoints,
            championLevel,
            role: role,
            name: champion.name === "Nunu & Willump" ? "Nunu" : champion.name,
        } as CompleteChampionInfo;
    });

    const patch = champions.at(0)?.version ?? "";

    return { completeChampionsData, patch };
}

export type CompleteMatch = Match & {
    MatchInfo: MatchInfo;
    participants: Summoner[];
};
