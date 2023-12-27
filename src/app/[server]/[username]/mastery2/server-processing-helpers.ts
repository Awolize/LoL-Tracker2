"use server";

import type { Summoner } from "@prisma/client";
import "react-lazy-load-image-component/src/effects/opacity.css";
import { type LolApi } from "twisted";
import type { Regions } from "twisted/dist/constants";

import { masteryBySummoner } from "../../../../utils/champsUtils";

import { type ChampionMasteryDTO, type ChampionsDataDragonDetails } from "twisted/dist/models-dto";
import rolesJson from "../roles.json";

interface Roles {
    role: string;
}

export type CompleteChampionInfo = ChampionMasteryDTO & ChampionsDataDragonDetails & Roles;
export async function getCompleteChampionData(lolApi: LolApi, region: Regions, user: Summoner) {
    const championMasteries = await masteryBySummoner(lolApi, region, user);
    const champions = await lolApi.DataDragon.getChampion();

    const completeChampionsData = Object.values(champions.data).map((champion) => {
        const role = rolesJson[champion.id as keyof typeof champions.data] || "Bottom";
        const personalChampData = championMasteries.find((champ) => champ.championId.toString() === champion.key) ?? {
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

    const patch = champions.version;

    return { completeChampionsData, patch };
}
