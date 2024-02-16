"use server";

import { type ChampionDetails } from "@prisma/client";
import "react-lazy-load-image-component/src/effects/opacity.css";
import { z } from "zod";

import { prisma } from "~/server/db";
import rolesJson from "../roles.json";
import Client from "./client";

interface Roles {
    role: string;
}

export type CompleteChampionInfo = ChampionDetails &
    Roles & {
        image: {
            full: string;
            sprite: string;
            group: string;
            x: number;
            y: number;
            w: number;
            h: number;
        };
    };

const paramsSchema = z.object({
    region: z.string(),
    username: z.string(),
});

export default async function Page({ params }) {
    const { region, username: parsedUsername } = paramsSchema.parse(params);
    const username = parsedUsername.replace("-", "#");

    const championsDD = await prisma.championDetails.findMany();

    const completeChampsData: CompleteChampionInfo[] = championsDD
        .map((champion) => {
            const roles: Roles = { role: (rolesJson[champion.key] ?? "Bottom") as string };

            return {
                ...champion,
                role: roles.role,
                name: champion.name === "Nunu & Willump" ? "Nunu" : champion.name,
                image: {
                    full: champion.full,
                    sprite: champion.sprite,
                    group: champion.group,
                    x: champion.x,
                    y: champion.y,
                    w: champion.w,
                    h: champion.h,
                },
            };
        })
        .filter(Boolean);

    const props = {
        username,
        region,
        champData: completeChampsData,
        patch: championsDD[0]?.version,
    };

    return <Client {...props} />;
}
