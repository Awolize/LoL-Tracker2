import assert from "node:assert";
import type { ChampionMastery, Summoner } from "@prisma/client";
import { type Regions, regionToRegionGroup } from "twisted/dist/constants";
import type { RateLimitError } from "twisted/dist/errors";
import type { ChampionMasteryDTO, MatchV5DTOs } from "twisted/dist/models-dto";

import { prisma } from "~/server/db";
import { lolApi } from "~/server/lolApi";
import { riotApi } from "~/server/riotApi";

export const upsertSummoner = async (puuid: string, region: Regions) => {
	const { account, summoner } = await getSummonerRateLimit(puuid, region);

	if (!summoner) {
		console.log("Could not find summoner", puuid, region);
		return;
	}

	const upsertedSummoner = await prisma.summoner.upsert({
		where: {
			puuid: summoner.puuid,
		},
		update: {
			summonerId: summoner.id,
			region: region,
			profileIconId: summoner.profileIconId,
			summonerLevel: summoner.summonerLevel,
			revisionDate: new Date(summoner.revisionDate),
			accountId: summoner.accountId,
			gameName: account.gameName,
			tagLine: account.tagLine,
		},
		create: {
			puuid: summoner.puuid,
			summonerId: summoner.id,
			region: region,
			username: "deprecated",
			profileIconId: summoner.profileIconId,
			summonerLevel: summoner.summonerLevel,
			revisionDate: new Date(summoner.revisionDate),
			accountId: summoner.accountId,
			gameName: account.gameName,
			tagLine: account.tagLine,
		},
	});

	return upsertedSummoner;
};

export const createSummoner = async (puuid: string, region: Regions) => {
	const existingSummoner = await prisma.summoner.findUnique({
		where: {
			puuid: puuid,
		},
	});

	if (existingSummoner) {
		return existingSummoner;
	}

	const { account, summoner } = await getSummonerRateLimit(puuid, region);

	const upsertedSummoner = await prisma.summoner.create({
		data: {
			puuid: summoner.puuid,
			summonerId: summoner.id,
			region: region,
			username: "deprecated",
			profileIconId: summoner.profileIconId,
			summonerLevel: summoner.summonerLevel,
			revisionDate: new Date(summoner.revisionDate),
			accountId: summoner.accountId,
			gameName: account.gameName,
			tagLine: account.tagLine,
		},
	});
	return upsertedSummoner;
};

export const summonersFromGames = (game: MatchV5DTOs.MatchDto) => {
	const participantSummoners = game.metadata.participants;

	// Create or find existing Summoner records for each participant

	const summonerPromises = participantSummoners.map(async (participant) => {
		const region: Regions | null = game.metadata.matchId.split("_")[0] as Regions | null;
		if (!region) {
			console.log(`could not summonersFromGames based on matchId splice ${game.metadata.matchId}`);
			throw new Error(`could not summonersFromGames based on matchId splice ${game.metadata.matchId}`);
		}

		const upsertedSummoner = createSummoner(participant, region);

		return upsertedSummoner;
	});

	return summonerPromises;
};

// biome-ignore lint/suspicious/noExplicitAny: this could be a list of anything
type RateLimitedCallback<T> = (...args: any[]) => Promise<T>;

// biome-ignore lint/suspicious/noExplicitAny: this could be a list of anything
const rateLimitWrapper = async <T>(callback: RateLimitedCallback<T>, ...args: any[]): Promise<T> => {
	let retryCount = 0;
	const maxRetries = 30;

	while (retryCount < maxRetries) {
		try {
			return await callback(...args);
		} catch (error) {
			const rateLimitError = error as RateLimitError;
			if (rateLimitError.status === 429) {
				const retryAfter = (rateLimitError.rateLimits?.RetryAfter ?? 60) + 1;
				console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
				await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
				retryCount++;
			} else {
				throw error;
			}
		}
	}

	// If max retries are reached, throw an error or handle it accordingly
	throw new Error(`Max retries (${maxRetries}) reached. Unable to complete the request.`);
};

const riotApiAccountByUsername = async (gameName: string, tagLine: string, region: Regions) => {
	const regionGroup = regionToRegionGroup(region);
	return (await rateLimitWrapper(riotApi.Account.getByGameNameAndTagLine, gameName, tagLine, regionGroup)).response;
};

const lolApiSummonerByPUUID = async (puuid: string, region: Regions) => {
	return (await rateLimitWrapper(lolApi.Summoner.getByPUUID, puuid, region)).response;
};

const riotApiAccountByPUUID = async (puuid: string, region: Regions) => {
	const regionGroup = regionToRegionGroup(region);
	return (await rateLimitWrapper(riotApi.Account.getByPUUID, puuid, regionGroup)).response;
};

const getSummonerRateLimit = async (puuid: string, region: Regions) => {
	const account = await riotApiAccountByPUUID(puuid, region);
	const summoner = await lolApiSummonerByPUUID(puuid, region);
	return { account, summoner };
};

const getSummonerByUsernameRateLimit = async (username: string, region: Regions) => {
	assert(username.includes("#"), "Username did not include a #");

	const [gameNameEncoded, tagLine] = username.split("#");
	assert(gameNameEncoded, "Game name part is missing");
	assert(tagLine, "Tag line part is missing");

	const gameName = decodeURI(gameNameEncoded);
	const account = await riotApiAccountByUsername(gameName, tagLine, region);
	const summoner = await lolApiSummonerByPUUID(account.puuid, region);

	return { summoner, account };
};

export const masteryBySummoner = async (region: Regions, user: Summoner) => {
	try {
		// Check if the summoner exists in the database
		const dbUser = await prisma.summoner.findFirst({
			where: { puuid: user.puuid },
			include: {
				championData: true,
			},
		});

		if (dbUser) {
			console.log(
				new Date().toLocaleString(),
				`Summoner found in database: ${dbUser.gameName}#${dbUser.tagLine}, ${dbUser.championData.length}`,
			);
		} else {
			console.log(
				new Date().toLocaleString(),
				`Summoner NOT found in database: ${user.gameName} ${user.tagLine}, ${region}`,
			);
		}

		if (!dbUser?.championData) return [];
		// throw new Error(`Could not find championMasteryData, server: ${region}, accountId: ${user.summonerId}`);

		const championMastery: ChampionMasteryDTO[] = dbUser.championData.map((mastery) => ({
			summonerId: dbUser.summonerId,
			championId: mastery.championId,
			championLevel: mastery.championLevel,
			championPoints: mastery.championPoints,
			lastPlayTime: new Date(mastery.lastPlayTime).getTime(),
			championPointsSinceLastLevel: mastery.championPointsSinceLastLevel,
			championPointsUntilNextLevel: mastery.championPointsUntilNextLevel,
			chestGranted: mastery.chestGranted,
			tokensEarned: mastery.tokensEarned,
		}));

		return championMastery;
	} catch (error) {
		console.log(
			`Error fetching champion mastery data for summoner ${user.gameName}#${user.tagLine} (${user.region}):`,
			error,
		);
		throw error;
	}
};

export const updateSummoner = async (username: string, region: Regions) => {
	const user = await getUserByNameAndRegion(username.toLowerCase(), region);

	await updateMasteryBySummoner(user, region);
};

export const updateMasteryBySummoner = async (user: Summoner, region: Regions) => {
	try {
		// Check if the summoner exists in the database
		let dbUser = await prisma.summoner.findUnique({
			where: { puuid: user.puuid },
			include: {
				championData: true,
			},
		});

		console.log("Updating summoner in db with mastery scores");
		try {
			const masteryData = (await lolApi.Champion.masteryByPUUID(user.puuid, region)).response;
			await updateSummonerDb(user, region, masteryData);
			console.log("Done - Updating summoner in db with mastery scores");
		} catch (error) {
			console.error("Failed - Updating summoner in db with mastery scores");
		}

		// Now the user should exist in the db, fetch championData.
		dbUser = await prisma.summoner.findUnique({
			where: { puuid: user.puuid },
			include: {
				championData: true,
			},
		});

		const championMasteryData = dbUser?.championData ?? [];

		const championMastery: ChampionMasteryDTO[] = championMasteryData.map((mastery) => ({
			summonerId: user.summonerId,
			championId: mastery.championId,
			championLevel: mastery.championLevel,
			championPoints: mastery.championPoints,
			lastPlayTime: new Date(mastery.lastPlayTime).getTime(),
			championPointsSinceLastLevel: mastery.championPointsSinceLastLevel,
			championPointsUntilNextLevel: mastery.championPointsUntilNextLevel,
			chestGranted: mastery.chestGranted,
			tokensEarned: mastery.tokensEarned,
		}));

		return championMastery;
	} catch (error) {
		console.log(
			`Error fetching champion mastery data for summoner ${user.gameName}#${user.tagLine} (${user.region}):`,
			error,
		);
		throw error;
	}
};

const updateSummonerDb = async (
	user: Summoner,
	region: Regions,
	championMasteryData: ChampionMastery[] | ChampionMasteryDTO[],
) => {
	try {
		// Step 1: Upsert Summoner
		const upsertedSummoner = await prisma.summoner.upsert({
			where: {
				puuid: user.puuid,
			},
			update: {
				summonerId: user.summonerId,
				region: region,
				profileIconId: user.profileIconId,
				summonerLevel: user.summonerLevel,
				revisionDate: new Date(user.revisionDate),
				accountId: user.accountId,
			},
			create: {
				puuid: user.puuid,
				summonerId: user.summonerId,
				region: region,
				username: "deprecated",
				profileIconId: user.profileIconId,
				summonerLevel: user.summonerLevel,
				revisionDate: new Date(user.revisionDate),
				accountId: user.accountId,
			},
		});

		console.log(`New summoner added/updated: ${upsertedSummoner.username}`);

		// Step 2: Upsert Champion Mastery Data
		const upsertedChampionMasteryData = await Promise.all(
			championMasteryData.map((mastery) =>
				prisma.championMastery.upsert({
					where: {
						championId_puuid: {
							championId: mastery.championId,
							puuid: user.puuid,
						},
					},
					update: {
						championLevel: mastery.championLevel,
						championPoints: mastery.championPoints,
						lastPlayTime: new Date(mastery.lastPlayTime),
						championPointsSinceLastLevel: mastery.championPointsSinceLastLevel,
						championPointsUntilNextLevel: mastery.championPointsUntilNextLevel,
						chestGranted: mastery.chestGranted ?? false,
						tokensEarned: mastery.tokensEarned,
					},
					create: {
						championId: mastery.championId,
						puuid: user.puuid,
						championLevel: mastery.championLevel,
						championPoints: mastery.championPoints,
						lastPlayTime: new Date(mastery.lastPlayTime),
						championPointsSinceLastLevel: mastery.championPointsSinceLastLevel,
						championPointsUntilNextLevel: mastery.championPointsUntilNextLevel,
						chestGranted: mastery.chestGranted ?? false,
						tokensEarned: mastery.tokensEarned,
					},
				}),
			),
		);

		// Step 3: Logging
		console.log(`New summoner ${upsertedSummoner.username}, updated: ${upsertedChampionMasteryData.length}`);
	} catch (error) {
		console.log("Error:", error);
	}
};

export async function getUserByNameAndRegion(username: string, region: Regions) {
	try {
		const user = await prisma.summoner.findFirst({
			where: {
				gameName: {
					equals: username.split("#")[0],
					mode: "insensitive",
				},
				tagLine: {
					equals: username.split("#")[1],
					mode: "insensitive",
				},
				region: region,
			},
		});

		if (user) {
			return user; // is existing user;
		}

		console.log("Could not find summoner in DB", username, region);

		const { summoner, account } = await getSummonerByUsernameRateLimit(username, region);

		// Use upsert to save the new user or update an existing one
		const savedUser = await prisma.summoner.upsert({
			where: {
				puuid: summoner.puuid,
			},
			update: {
				puuid: summoner.puuid,
				summonerId: summoner.id,
				createdAt: new Date(),
				updatedAt: new Date(),
				region,
				username: "deprecated",
				gameName: account.gameName ?? null,
				tagLine: account.tagLine ?? null,
				profileIconId: summoner.profileIconId,
				summonerLevel: summoner.summonerLevel,
				revisionDate: new Date(summoner.revisionDate),
				accountId: summoner.accountId,
			},
			create: {
				puuid: summoner.puuid,
				summonerId: summoner.id,
				createdAt: new Date(),
				updatedAt: new Date(),
				region,
				username: "deprecated",
				gameName: account.gameName ?? null,
				tagLine: account.tagLine ?? null,
				profileIconId: summoner.profileIconId,
				summonerLevel: summoner.summonerLevel,
				revisionDate: new Date(summoner.revisionDate),
				accountId: summoner.accountId,
			},
		});

		return savedUser;
	} catch (error) {
		console.error("error:", new Date().toLocaleString(), new Date(), username, region, error);
		throw new Error("Could not fetch summoner^", { cause: error });
	}
}
