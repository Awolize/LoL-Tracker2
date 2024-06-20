import type { Match, MatchInfo, Summoner } from "@prisma/client";
import { type Regions, regionToRegionGroup } from "twisted/dist/constants";
import type { RateLimitError } from "twisted/dist/errors";
import { summonersFromGames } from "./summoner";

import { prisma } from "~/server/db";
import { lolApi } from "~/server/lolApi";
import type { CompleteMatch } from "./champions";

export const updateGames = async (user: Summoner, region: Regions) => {
	try {
		const matchIds = await fetchMatchIds(user.puuid, region);

		console.log(`UpdateGames for user ${user.gameName}#${user.tagLine} (${user.region}), ${matchIds.length} games`);

		const { addedGames, skippedGames, failedGames } = await processMatches(user, region, matchIds);

		console.log({
			addedGames: addedGames.length,
			failedGames: failedGames.length,
			skipAddingGames: skippedGames.length,
		});

		return { addedGames, failedGames, skippedGames };
	} catch (error) {
		console.log("error:", JSON.stringify(error));
	}
};

const fetchMatchIds = async (puuid: string, region: Regions): Promise<string[]> => {
	let totalCount = 1000; // Total number of matches requested
	const matchIds: string[] = [];
	let start = 0;

	while (totalCount > 0) {
		const count = Math.min(100, totalCount); // Maximum count per request is 100
		const matchIdsResponse = await lolApi.MatchV5.list(puuid, regionToRegionGroup(region), {
			count: count,
			start: start,
			startTime: new Date("2022-05-11T00:00:00Z").getTime() / 1000,
		});

		if (matchIdsResponse.response.length === 0) break;

		matchIds.push(...matchIdsResponse.response);
		start += count;
		totalCount -= count;
	}

	return matchIds;
};

const processMatches = async (
	user: Summoner,
	region: Regions,
	matchIds: string[],
): Promise<{ addedGames: string[]; skippedGames: string[]; failedGames: string[] }> => {
	const addedGames: string[] = [];
	const skippedGames: string[] = [];
	const failedGames: string[] = [];

	const existingGames = await prisma.match.findMany({
		where: {
			gameId: { in: matchIds },
		},
	});

	const newMatchIds = matchIds.filter((matchId) => {
		const newGame = !existingGames.some((existingGame) => existingGame.gameId === matchId);
		if (!newGame) {
			skippedGames.push(matchId);
		}
		return newGame;
	});

	for (let index = 0; index < newMatchIds.length; index++) {
		const matchId = newMatchIds[index];

		if (!matchId) {
			continue;
		}

		if (index % 50 === 0) {
			console.log(`${user.gameName}#${user.tagLine} (${user.region}) progress: ${index} / ${newMatchIds.length}`);
		}

		try {
			const existingGame = await prisma.match.findFirst({
				where: {
					gameId: matchId,
				},
			});

			if (existingGame) {
				skippedGames.push(matchId);
				continue;
			}

			await processSingleMatch(region, matchId);

			addedGames.push(matchId);
		} catch (error) {
			if (failedGames.includes(matchId)) {
				continue;
			}

			console.error(
				`[Game error] ${user.gameName}#${user.tagLine} (${user.region}) progress: ${index} / ${newMatchIds.length}`,
			);

			const rateLimitError = error as RateLimitError;
			// error instanceof RateLimitError - did not work for some reason
			if (rateLimitError.status === 429) {
				const retryAfter = (rateLimitError.rateLimits?.RetryAfter || 60) + 1;
				console.error(`[Game] Rate limited. Retrying after ${retryAfter} seconds...`);
				await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
				newMatchIds.push(matchId);
			} else {
				console.error("something went wrong on gameId:", matchId);
				console.error({ error });
				failedGames.push(matchId);
			}
		}
	}

	return { addedGames, skippedGames, failedGames };
};

const processSingleMatch = async (region: Regions, matchId: string) => {
	const gameResponse = await lolApi.MatchV5.get(matchId, regionToRegionGroup(region));
	const game = gameResponse.response;

	const creationPromises = summonersFromGames(game);
	const summoners = await Promise.all(
		creationPromises.map(async (createPromise) => {
			try {
				return await createPromise;
			} catch (error) {
				console.error("Error creating summoner:", error);
				return null;
			}
		}),
	);

	const validSummoners = summoners.filter((summoner): summoner is Summoner => summoner !== null);

	await prisma.match.create({
		data: {
			gameId: matchId,
			MatchInfo: {
				create: {
					gameCreation: new Date(game.info.gameCreation),
					gameDuration: game.info.gameDuration,
					gameEndTimestamp: new Date(game.info.gameStartTimestamp + game.info.gameDuration), // wrong
					gameMode: game.info.gameMode,
					gameName: game.info.gameName,
					gameStartTimestamp: new Date(game.info.gameStartTimestamp),
					gameType: game.info.gameType,
					gameVersion: game.info.gameVersion,
					mapId: game.info.mapId,
					participants: game.info.participants as never,
					platformId: game.info.platformId,
					queueId: game.info.queueId,
					teams: game.info.teams as never,
					tournamentCode: game.info.tournamentCode,
				},
			},
			participants: {
				connect: validSummoners.map((summoner) => ({
					puuid: summoner.puuid,
				})),
			},
		},
	});
};

export async function getMatches(user: Summoner, take = 25) {
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
		take,
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

// Arena Map, https://static.developer.riotgames.com/docs/lol/maps.json
export async function getArenaMatches(user: Summoner) {
	const matches: (Match & {
		MatchInfo: MatchInfo | null;
		participants: Summoner[];
	})[] = await prisma.match.findMany({
		where: {
			participants: {
				some: user,
			},
			MatchInfo: {
				mapId: 30, // Filter by mapId 30 (Arena Map)
				gameStartTimestamp: {
					gte: new Date("2024-01-01T00:00:00Z"), // Unix timestamp of January 1, 2024
				},
				gameMode: "CHERRY",
				gameType: "MATCHED_GAME",
			},
		},
		include: {
			MatchInfo: true,
			participants: true,
		},
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
