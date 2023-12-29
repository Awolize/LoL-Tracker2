"use server";

import type { ChampionDetails, PrismaClient, Summoner } from "@prisma/client";
import "react-lazy-load-image-component/src/effects/opacity.css";
import type { Regions } from "twisted/dist/constants";

import { masteryBySummoner } from "../../../../utils/champsUtils";

import { type ChampionMasteryDTO } from "twisted/dist/models-dto";
import rolesJson from "../roles.json";

interface Roles {
    role: string;
}

export type CompleteChampionInfo = ChampionMasteryDTO & ChampionDetails & Roles;
export async function getCompleteChampionData(prisma: PrismaClient, region: Regions, user: Summoner) {
    const championMasteries = await masteryBySummoner(prisma, region, user);
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
