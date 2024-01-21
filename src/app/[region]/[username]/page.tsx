"use server";

import { z } from "zod";

import { getUserByNameAndRegion } from "../../../server/api/differentHelper";

import { useApi } from "~/app/_components/use-api";
import { regionToConstant } from "../../../utils/champsUtils";
import Client from "./client";

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
