"use server";

import "react-lazy-load-image-component/src/effects/opacity.css";
import { z } from "zod";
import { getCompleteChampionData } from "~/server/api/routers/processing/champions";
import { getUserByNameAndRegion } from "~/server/api/routers/processing/summoner";
import { regionToConstant } from "~/utils/champsUtils";
import Client from "./client";

const paramsSchema = z.object({
    region: z.string(),
    username: z.string(),
});

export default async function Page({ params }) {
    const { region: rawRegion, username: rawUsername } = paramsSchema.parse(params);
    const username = rawUsername.replace("-", "#").toLowerCase();
    const region = regionToConstant(rawRegion.toUpperCase());

    const user = await getUserByNameAndRegion(username, region);

    const completeChampsData = await getCompleteChampionData(region, user);

    const props = {
        user,
        region,
        playerChampionInfo: completeChampsData.completeChampionsData.sort((a,b) => a.name.localeCompare(b.name)),
        patch: completeChampsData.patch,
    };

    return <Client {...props} />;
}
