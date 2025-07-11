import assert from "node:assert";
import type { ChampionMastery, Summoner } from "@prisma/client";
import { type Regions, regionToRegionGroup } from "twisted/dist/constants";
import type { RateLimitError } from "twisted/dist/errors";
import type { ChampionMasteryDTO, MatchV5DTOs } from "twisted/dist/models-dto";

import { prisma } from "~/server/db";
import { lolApi } from "~/server/lolApi";
import { riotApi } from "~/server/riotApi";
import type { AccountDto } from "twisted/dist/models-dto/account/account.dto";

export const upsertSummoner = async (puuid: string, region: Regions) => {
	const { account, summoner } = await getSummonerRateLimit(puuid, region);

	if (!summoner) {
		console.log("Could not find summoner", puuid, region);
		return;
	}

	return upsertSummonerBySummoner(summoner, region, account);
};

export const upsertSummonerBySummoner = async (summoner: Summoner, region: Regions, account: AccountDto) => {
	const upsertedSummoner = prisma.summoner.upsert({
		where: {
			puuid: summoner.puuid,
		},
		update: {
			summonerId: summoner.summonerId,
			profileIconId: summoner.profileIconId,
			summonerLevel: summoner.summonerLevel,
			revisionDate: new Date(summoner.revisionDate),
			gameName: account.gameName,
			tagLine: account.tagLine,
		},
		create: {
			puuid: summoner.puuid,
			summonerId: summoner.summonerId,
			region: region,
			profileIconId: summoner.profileIconId,
			summonerLevel: summoner.summonerLevel,
			revisionDate: new Date(summoner.revisionDate),
			gameName: account.gameName,
			tagLine: account.tagLine,
		},
	});

	return upsertedSummoner;
};

const createSummoner = async (puuid: string, region: Regions) => {
	const existingSummoner = await prisma.summoner.findUnique({
		where: {
			puuid: puuid,
		},
	});

	if (existingSummoner) {
		return existingSummoner;
	}

	// const { account, summoner } = await getSummonerRateLimit(puuid, region);

	const upsertedSummoner = await prisma.summoner.create({
		data: {
			puuid: puuid,
			region: region,
			profileIconId: 0,
			revisionDate: new Date(0),
			summonerId: "unknown",
			summonerLevel: 0,
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
				console.log(`Rate limited. Retrying in ${retryAfter} seconds...`);
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
	return (await rateLimitWrapper(() => riotApi.Account.getByRiotId(gameName, tagLine, regionGroup))).response;
};

const lolApiSummonerByPUUID = async (puuid: string, region: Regions) => {
	return (await rateLimitWrapper(() => lolApi.Summoner.getByPUUID(puuid, region))).response;
};

const riotApiAccountByPUUID = async (puuid: string, region: Regions) => {
	const regionGroup = regionToRegionGroup(region);
	return (await rateLimitWrapper(() => riotApi.Account.getByPUUID(puuid, regionGroup))).response;
};

const getSummonerRateLimit = async (puuid: string, region: Regions) => {
	const account = await riotApiAccountByPUUID(puuid, region);
	const summonerV4DTO = await lolApiSummonerByPUUID(puuid, region);

	const summoner: Summoner = {
		summonerId: summonerV4DTO.id,
		createdAt: new Date(),
		updatedAt: new Date(),
		region: region,
		profileIconId: summonerV4DTO.profileIconId,
		puuid: summonerV4DTO.puuid,
		summonerLevel: summonerV4DTO.summonerLevel,
		revisionDate: new Date(summonerV4DTO.revisionDate),
		gameName: account.gameName,
		tagLine: account.tagLine,
	};

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
export async function getUserByNameAndRegion(username: string, region: Regions) {
	function isWithinThreshold(date: Date) {
		const oneDayInMillis = 24 * 60 * 60 * 1000; // Number of milliseconds in one day
		const now = new Date();
		return now.getTime() - date.getTime() <= oneDayInMillis;
	}

	const [gameName, tagLine] = username.split("#");

	try {
		const user = await prisma.summoner.findFirst({
			where: {
				gameName: {
					equals: gameName,
					mode: "insensitive",
				},
				tagLine: {
					equals: tagLine,
					mode: "insensitive",
				},
				region: region,
			},
		});

		if (user && isWithinThreshold(user.updatedAt)) {
			return user; // return existing user;
		}

		console.log("Could not find summoner in DB", username, region);

		const { summoner, account } = await getSummonerByUsernameRateLimit(username, region);

		// Check for existing users with the same gameName and tagLine
		const existingUsers = await prisma.summoner.findMany({
			where: {
				gameName: account.gameName,
				tagLine: account.tagLine,
				NOT: {
					puuid: summoner.puuid, // Exclude the current summoner
				},
				region: region,
			},
		});

		// Update existing users to null their gameName and tagLine
		if (existingUsers.length > 0) {
			await prisma.summoner.updateMany({
				where: {
					puuid: {
						in: existingUsers.map((user) => user.puuid),
					},
				},
				data: {
					gameName: null, // or "deprecated"
					tagLine: null, // or "deprecated"
				},
			});
		}

		// Use upsert to save the new user or update an existing one
		const savedUser = await prisma.summoner.upsert({
			where: {
				puuid: summoner.puuid,
			},
			update: {
				summonerId: summoner.id,
				updatedAt: new Date(),
				region,
				gameName: account.gameName,
				tagLine: account.tagLine,
				profileIconId: summoner.profileIconId,
				summonerLevel: summoner.summonerLevel,
				revisionDate: new Date(summoner.revisionDate),
			},
			create: {
				puuid: summoner.puuid,
				summonerId: summoner.id,
				createdAt: new Date(),
				updatedAt: new Date(),
				region,
				gameName: account.gameName,
				tagLine: account.tagLine,
				profileIconId: summoner.profileIconId,
				summonerLevel: summoner.summonerLevel,
				revisionDate: new Date(summoner.revisionDate),
			},
		});

		return savedUser;
	} catch (error) {
		console.error("error:", new Date().toLocaleString(), new Date(), username, region, error);
		throw new Error("Could not fetch summoner^", { cause: error });
	}
}
