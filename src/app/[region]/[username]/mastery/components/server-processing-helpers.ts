"use server";

import { type ChampionDetails, type Match, type MatchInfo, type Summoner } from "@prisma/client";
import "react-lazy-load-image-component/src/effects/opacity.css";
import type { Regions } from "twisted/dist/constants";
import { prisma } from "~/server/db";
import { lolApi } from "~/server/lolApi";
import { riotApi } from "~/server/riotApi";

import { masteryBySummoner } from "../../../../../utils/champsUtils";

import { type ChampionMasteryDTO } from "twisted/dist/models-dto";
import rolesJson from "../../roles.json";

interface Roles {
    role: string;
}

export type CompleteChampionInfo = Partial<Omit<ChampionMasteryDTO, "championPoints" | "championLevel">> &
    Pick<ChampionMasteryDTO, "championPoints" | "championLevel"> &
    ChampionDetails &
    Roles;
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

export async function getMatches(user: Summoner) {
    const matches: (Match & {
        MatchInfo: MatchInfo | null;
        participants: Summoner[];
    })[] = await prisma.match.findMany({
        where: {
            participants: {
                some: user,
            },
        },
        include: {
            MatchInfo: true,
            participants: true,
        },
        take: 25,
        orderBy: {
            MatchInfo: {
                gameStartTimestamp: "desc",
            },
        },
    });

    // Filter out null values and ensure MatchInfo is not null
    const filteredMatches = matches.filter((match): match is CompleteMatch => match?.MatchInfo !== null);

    return filteredMatches;
}
