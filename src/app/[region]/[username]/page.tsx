"use server";

import { z } from "zod";

import { getUserByNameAndRegion } from "../../../server/api/differentHelper";

import { regionToConstant } from "../../../utils/champsUtils";
import Client from "./client";

import { prisma } from "~/server/db";
import { lolApi } from "~/server/lolApi";
import { riotApi } from "~/server/riotApi";

const paramsSchema = z.object({
    region: z.string(),
    username: z.string(),
});

export default async function Page({ params }) {
    const { region: rawRegion, username: rawUsername } = paramsSchema.parse(params);
    const username = rawUsername.replace("-", "#").toLowerCase();

    const region = regionToConstant(rawRegion.toUpperCase());

    const user = await getUserByNameAndRegion(username, region);

    const patch = (await prisma.championDetails.findMany())[0]?.version;

    // const apiChampsData = await getChampionsAndMastery(username);

    const props = {
        username: rawUsername,
        region,
        profileIconId: user.profileIconId,
        summonerLevel: user.summonerLevel,
        patch,
    };

    return <Client {...props} />;
}
