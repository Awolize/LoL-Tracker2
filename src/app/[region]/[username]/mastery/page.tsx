"use server";

import "react-lazy-load-image-component/src/effects/opacity.css";
import type { ChampionDetails } from "@prisma/client";
import type { ChampionMasteryDTO } from "twisted/dist/models-dto";
import { z } from "zod";
import { getCompleteChampionData } from "~/server/api/routers/processing/champions";
import { getMatches } from "~/server/api/routers/processing/match";
import { getUserByNameAndRegion } from "~/server/api/routers/processing/summoner";
import { type ChallengeIds, regionToConstant } from "~/utils/champsUtils";
import { Client } from "./client";

const paramsSchema = z.object({
	region: z.string(),
	username: z.string(),
});

interface Roles {
	role: string;
}

export type CompleteChampionInfo = Partial<Omit<ChampionMasteryDTO, "championPoints" | "championLevel">> &
	Pick<ChampionMasteryDTO, "championPoints" | "championLevel"> &
	ChampionDetails &
	Roles;

export default async function Page(props) {
	const params = await props.params;
	const { region: rawRegion, username: rawUsername } = paramsSchema.parse(params);
	const username = rawUsername.replace("-", "#").toLowerCase();
	const region = regionToConstant(rawRegion.toUpperCase());

	const user = await getUserByNameAndRegion(username, region);

	const [completeChampionsData, matches] = await Promise.all([
		getCompleteChampionData(region, user),
		getMatches(user, 25),
	]);

	const challengeIds: ChallengeIds[] = [202303, 210001, 401106];

	return (
		<Client
			user={user}
			playerChampionInfo={completeChampionsData.completeChampionsData}
			version={completeChampionsData.version}
			matches={matches}
		/>
	);
}
