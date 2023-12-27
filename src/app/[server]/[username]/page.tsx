"use server";

import { z } from "zod";

import { getUserByNameAndServer } from "../../../server/api/differentHelper";

import { useApi } from "~/app/_components/use-api";
import { regionToConstant } from "../../../utils/champsUtils";
import Client from "./client";

const paramsSchema = z.object({
    server: z.string(),
    username: z.string(),
});

export default async function Page({ params }) {
    const { server, username: rawUsername } = paramsSchema.parse(params);
    const username = rawUsername.replace("-", "#");

    const region = regionToConstant(server.toUpperCase());

    const { prisma, lolApi, riotApi } = useApi();

    const user = await getUserByNameAndServer({ prisma, lolApi, riotApi }, username, region);

    const patch = (await prisma.championDetails.findMany())[0]?.version;

    // const apiChampsData = await getChampionsAndMastery(username);

    const props = {
        username: rawUsername,
        server,
        profileIconId: user.profileIconId,
        summonerLevel: user.summonerLevel,
        patch,
    };

    return <Client {...props} />;
}
