"use server";

import "react-lazy-load-image-component/src/effects/opacity.css";
import type { ChampionDetails } from "@prisma/client";
import { stringify } from "superjson";
import type { ChampionMasteryDTO } from "twisted/dist/models-dto";
import { z } from "zod";
import { getChallengesThresholds2, getPlayerChallengesData2 } from "~/server/api/routers/processing/challenges";
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

export default async function Page({ params }) {
	const { region: rawRegion, username: rawUsername } = paramsSchema.parse(params);
	const username = rawUsername.replace("-", "#").toLowerCase();
	const region = regionToConstant(rawRegion.toUpperCase());

	const user = await getUserByNameAndRegion(username, region);

	const [completeChampionsData, playerChallenges, challengesThresholds, matches] = await Promise.all([
		getCompleteChampionData(region, user),
		getPlayerChallengesData2(user),
		getChallengesThresholds2(),
		getMatches(user, 25),
	]);

	const challengeIds: ChallengeIds[] = [202303, 210001, 401106];

	return (
		<Client
			user={user}
			playerChampionInfo={completeChampionsData.completeChampionsData}
			version={completeChampionsData.version}
			challengeIds={stringify(challengeIds)}
			playerChallengesData={stringify(playerChallenges)}
			challengesThresholds={stringify(challengesThresholds)}
			matches={matches}
		/>
	);
}
