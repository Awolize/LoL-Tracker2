"use server";

import "react-lazy-load-image-component/src/effects/opacity.css";
import { z } from "zod";

import { getCompleteChampionData } from "~/server/api/routers/processing/champions";
import { getUserByNameAndRegion } from "~/server/api/routers/processing/summoner";
import { prisma } from "~/server/db";
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
	const version = (await prisma.championDetails.findFirst())?.version ?? "14.12.1";

	return (
		<Client
			user={user}
			region={region}
			champions={completeChampsData.completeChampionsData.sort((a, b) => a.name.localeCompare(b.name))}
			version={version}
		/>
	);
}
