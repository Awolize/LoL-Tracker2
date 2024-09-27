import type { Prisma } from "@prisma/client";
import { type Regions, regionToRegionGroup } from "twisted/dist/constants";
import type { AccountDTO } from "twisted/dist/models-dto/accounts/account.dto";
import { z } from "zod";

import { prisma } from "~/server/db";
import { lolApi } from "~/server/lolApi";
import { riotApi } from "~/server/riotApi";
import type { Participant } from "~/trpc/different_types";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { upsertChallenges } from "./processing/challenges";
import { updateChallengesConfig } from "./processing/challengesConfig";
import { updateChampionDetails } from "./processing/champions";
import { upsertMastery } from "./processing/mastery";
import { getArenaMatches, getMatches, getSRMatches, updateGames } from "./processing/match";
import { getUserByNameAndRegion, upsertSummoner } from "./processing/summoner";

type SavedUserType = Prisma.PromiseReturnType<typeof prisma.summoner.upsert>;

async function clearChallenge(user: SavedUserType, challenge: string) {
	try {
		const allChampions = await prisma.championDetails.findMany({
			select: { id: true },
		});

		await prisma.challenges.update({
			where: { puuid: user.puuid },
			data: {
				[challenge]: {
					disconnect: allChampions.map((champion) => ({
						id: champion.id,
					})),
				},
			},
		});
	} catch (error) {
		console.warn(user.gameName, user.tagLine, user.region, "could not disconnect challenge", challenge);
	}
}

export const processingApiRouter = createTRPCRouter({
	updateChallengeConfig: publicProcedure
		.input(z.object({ username: z.string(), region: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const region = input.region as Regions;
			const data = (await lolApi.Challenges.getConfig(region)).response;

			try {
				await prisma.$transaction([
					// upsertMany "hack"
					prisma.challengesConfig.deleteMany(),
					prisma.challengesConfig.createMany({
						data: data.map((challenge) => {
							// There is one challenge that got an endtimestamp (id: 600012)
							//  "name":"Challenges are Here!"

							return {
								id: challenge.id,
								leaderboard: challenge.leaderboard,
								state: challenge.state,
								thresholds: challenge.thresholds,
								endTimestamp: challenge.endTimestamp ? new Date(challenge.endTimestamp) : null,
							};
						}),
						skipDuplicates: true,
					}),
					prisma.challengeLocalization.createMany({
						data: data.map((challenge) => {
							const enUSLocalization = challenge.localizedNames.en_US;

							return {
								id: challenge.id,
								language: "en_US",
								name: enUSLocalization ? enUSLocalization.name : "",
								description: enUSLocalization ? enUSLocalization.description : "",
								shortDescription: enUSLocalization ? enUSLocalization.shortDescription : "",
							};
						}),
					}),
				]);
			} catch (error) {
				console.log("differentApiRouter: ");
				console.log(error);
			}
		}),

	updateChampionOcean: publicProcedure
		.input(z.object({ username: z.string(), region: z.string() }))
		.mutation(async ({ input }) => {
			console.log(`updateChampionOcean for user ${input.username} (${input.region.toUpperCase()})`);

			const region = input.region as Regions;

			const user = await getUserByNameAndRegion(input.username, region);
			if (!user) return;

			const matches = await getArenaMatches(user);
			if (!matches) return;

			const participations = matches
				.flatMap((match) => match.MatchInfo.participants as unknown as Participant)
				.filter((p) => p.puuid === user.puuid)
				.filter(Boolean);

			console.log(
				`[updateChampionOcean] ${user.gameName}#${user.tagLine} (${user.region}) found ${participations?.length} games`,
			);

			const uniqueChampIds = new Set<number>(participations.map((p) => p.championId));

			await clearChallenge(user, "championOcean");

			try {
				await prisma.challenges.upsert({
					where: { puuid: user.puuid },
					update: {
						championOcean: {
							connect: [...uniqueChampIds].map((champId) => ({ id: champId })),
						},
					},
					create: {
						summoner: { connect: { puuid: user.puuid } },
						championOcean: {
							connect: [...uniqueChampIds].map((champId) => ({ id: champId })),
						},
					},
				});
			} catch (error) {
				await updateChampionDetails();
				console.error("Missing champ??");
			}

			console.log(`${user.gameName}#${user.tagLine} (${user.region})`, matches.length, uniqueChampIds.size);

			return { numberOfGames: matches.length, uniqueChampIds };
		}),

	updateChampionOcean2024Split3: publicProcedure
		.input(z.object({ username: z.string(), region: z.string() }))
		.mutation(async ({ input }) => {
			console.log(`updateChampionOcean for user ${input.username} (${input.region.toUpperCase()})`);

			const region = input.region as Regions;

			const user = await getUserByNameAndRegion(input.username, region);
			if (!user) return;

			const matches = await getMatches(user);
			if (!matches) return;

			const participations = matches
				.filter((m) => m.MatchInfo.gameStartTimestamp > new Date("2024-09-18"))
				.flatMap((match) => match.MatchInfo.participants as unknown as Participant)
				.filter((p) => p.puuid === user.puuid)
				.filter((p) => p.win)
				.filter(Boolean);

			console.log(
				`[updateChampionOcean2024Split3] ${user.gameName}#${user.tagLine} (${user.region}) found ${participations?.length} games`,
			);

			const uniqueChampIds = new Set<number>(participations.map((p) => p.championId));

			await clearChallenge(user, "championOcean2024Split3");

			try {
				await prisma.challenges.upsert({
					where: { puuid: user.puuid },
					update: {
						championOcean2024Split3: {
							connect: [...uniqueChampIds].map((champId) => ({ id: champId })),
						},
					},
					create: {
						summoner: { connect: { puuid: user.puuid } },
						championOcean2024Split3: {
							connect: [...uniqueChampIds].map((champId) => ({ id: champId })),
						},
					},
				});
			} catch (error) {
				await updateChampionDetails();
				console.error("Missing champ??");
			}

			console.log(`${user.gameName}#${user.tagLine} (${user.region})`, matches.length, uniqueChampIds.size);

			return { numberOfGames: matches.length, uniqueChampIds };
		}),

	updateAdaptToAllSituations: publicProcedure
		.input(z.object({ username: z.string(), region: z.string() }))
		.mutation(async ({ input }) => {
			console.log(`updateAdaptToAllSituations for user ${input.username} (${input.region.toUpperCase()})`);

			const region = input.region as Regions;

			const user = await getUserByNameAndRegion(input.username, region);
			if (!user) return;

			const matches = await getArenaMatches(user);
			if (!matches) return;

			// Arena games are special and got another field for placements.
			type ParticipantWithPlacement = Participant & { placement?: number };
			const participations = matches
				.flatMap((match) => match.MatchInfo.participants as unknown as ParticipantWithPlacement)
				.filter((p) => p.puuid === user.puuid)
				.filter((p) => p?.placement === 1)
				.filter(Boolean);

			console.log(
				`[AdaptToAllSituations] ${user.gameName}#${user.tagLine} (${user.region}) found ${participations?.length} games`,
			);

			const uniqueChampIds = new Set<number>(participations.map((p) => p.championId));

			await clearChallenge(user, "adaptToAllSituations");

			try {
				await prisma.challenges.upsert({
					where: { puuid: user.puuid },
					update: {
						adaptToAllSituations: {
							connect: [...uniqueChampIds].map((champId) => ({ id: champId })),
						},
					},
					create: {
						summoner: { connect: { puuid: user.puuid } },
						adaptToAllSituations: {
							connect: [...uniqueChampIds].map((champId) => ({ id: champId })),
						},
					},
				});
			} catch (error) {
				await updateChampionDetails();
				console.error("Missing champ??");
			}

			console.log(`${user.gameName}#${user.tagLine} (${user.region})`, matches.length, uniqueChampIds.size);

			return { numberOfGames: matches.length, uniqueChampIds };
		}),

	updateInvincible: publicProcedure
		.input(z.object({ username: z.string(), region: z.string() }))
		.mutation(async ({ input }) => {
			console.log(`updateInvincible for user ${input.username} (${input.region.toUpperCase()})`);

			const region = input.region as Regions;

			const user = await getUserByNameAndRegion(input.username, region);
			if (!user) return;

			const matches = await getSRMatches(user);
			if (!matches) return;

			const participations = matches
				.flatMap((match) => match.MatchInfo.participants as unknown as Participant)
				.filter((p) => p.puuid === user.puuid)
				.filter((p) => p.deaths === 0)
				.filter(Boolean);

			console.log(
				`[Invincible] ${user.gameName}#${user.tagLine} (${user.region}) found ${participations?.length} games`,
			);

			const uniqueChampIds = new Set<number>(participations.map((p) => p.championId));

			await clearChallenge(user, "invincible");

			try {
				await prisma.challenges.upsert({
					where: { puuid: user.puuid },
					update: {
						invincible: {
							connect: [...uniqueChampIds].map((champId) => ({ id: champId })),
						},
					},
					create: {
						summoner: { connect: { puuid: user.puuid } },
						invincible: {
							connect: [...uniqueChampIds].map((champId) => ({ id: champId })),
						},
					},
				});
			} catch (error) {
				await updateChampionDetails();
				console.error("Missing champ??");
			}

			console.log(`${user.gameName}#${user.tagLine} (${user.region})`, matches.length, uniqueChampIds.size);

			return { numberOfGames: matches.length, uniqueChampIds };
		}),

	updateJackOfAllChamps: publicProcedure
		.input(z.object({ username: z.string(), region: z.string() }))
		.mutation(async ({ input, ctx }) => {
			console.log(`updateJackOfAllChamps for user ${input.username} (${input.region.toUpperCase()})`);

			const region = input.region as Regions;

			const user = await getUserByNameAndRegion(input.username, region);
			if (!user) return;

			const matches = await getSRMatches(user);
			if (!matches) return;

			const participations = matches
				.flatMap((match) => match.MatchInfo?.participants as unknown as Participant[])
				.filter((p) => p.puuid === user.puuid)
				.filter((p) => p.win)
				.filter(Boolean);

			console.log(
				`[JackOfAllChamps] ${user.gameName}#${user.tagLine} (${user.region}) found ${participations?.length} games`,
			);

			const loses: Participant[] = [];
			const wins: Participant[] = [];

			for (const participantInfo of participations) {
				if (participantInfo.win) {
					wins.push(participantInfo);
				} else {
					loses.push(participantInfo);
				}
			}
			console.log(participations.map((e) => e.win).length);

			const uniqueWins = new Set<number>(wins.map((win) => win.championId));
			const uniqueLoses = new Set<number>(loses.map((lose) => lose.championId));

			await clearChallenge(user, "jackOfAllChamps");

			try {
				await prisma.challenges.upsert({
					where: { puuid: user.puuid },
					update: {
						jackOfAllChamps: {
							connect: [...uniqueWins].map((champId) => ({ id: champId })),
						},
					},
					create: {
						summoner: { connect: { puuid: user.puuid } },
						jackOfAllChamps: {
							connect: [...uniqueWins].map((champId) => ({ id: champId })),
						},
					},
				});
			} catch (error) {
				await updateChampionDetails();
				console.error("Missing champ??");
			}

			console.log(`${user.gameName}#${user.tagLine} (${user.region})`, matches.length, {
				wins: uniqueWins.size,
				loses: uniqueLoses.size,
			});

			return {
				numberOfGames: matches.length,
				uniqueWins: uniqueWins.size,
				uniqueLoses: uniqueLoses.size,
			};
		}),

	updateGames: publicProcedure
		.input(
			z.object({
				gameName: z.string(),
				tagLine: z.string(),
				region: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			console.time("updateSummoner");

			const region = input.region as Regions;
			const regionGroup = regionToRegionGroup(region);

			const user = (await riotApi.Account.getByGameNameAndTagLine(input.gameName, input.tagLine, regionGroup))
				.response;

			if (!user.puuid) {
				console.log("This user does not exist", user);
				console.timeEnd("updateSummoner");
				return false;
			}

			// Update profile
			console.time("upsertSummoner");
			const updatedUser = await upsertSummoner(user.puuid, region);
			console.timeEnd("upsertSummoner");

			if (!updatedUser) {
				console.log("Could not update user");
				console.timeEnd("updateSummoner");
				return false;
			}

			// update games
			await timeIt("upsertChallenges", user, updateGames, updatedUser, region);

			// update challenges
			await timeIt("upsertChallenges", user, upsertChallenges, region, updatedUser);
		}),

	updateGlobals: publicProcedure.mutation(async () => {
		console.time("Globals");

		// Update global challenges
		console.time("Globals updateChallengesConfig");
		await updateChallengesConfig("EUW1" as Regions);
		console.timeEnd("Globals updateChallengesConfig");

		// Update global champions
		console.time("Globals updateChampionDetails");
		await updateChampionDetails();
		console.timeEnd("Globals updateChampionDetails");

		console.timeEnd("Globals");
	}),

	fullUpdateSummoner: publicProcedure
		.input(
			z.object({
				gameName: z.string(),
				tagLine: z.string(),
				region: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			async function fullUpdateSummoner() {
				const region = input.region as Regions;
				const regionGroup = regionToRegionGroup(region);

				const user = (await riotApi.Account.getByGameNameAndTagLine(input.gameName, input.tagLine, regionGroup))
					.response;

				if (!user.puuid) {
					console.log("This user does not exist", user);
					return false;
				}

				// Update global challenges
				await timeIt("updateChallengesConfig", user, updateChallengesConfig, region);

				// Update global champions
				await timeIt("updateChampionDetails", user, updateChampionDetails);

				// Update profile
				const updatedUser = await timeIt("upsertSummoner", user, upsertSummoner, user.puuid, region);

				if (!updatedUser) {
					console.log(`${user.gameName}#${user.tagLine}: Could not update user`);
					return false;
				}

				// Update championMasteries
				await timeIt("upsertMastery", user, upsertMastery, updatedUser, region);

				// update challenges
				await timeIt("upsertChallenges", user, upsertChallenges, region, updatedUser);

				// update games
				await timeIt("updateGames", user, updateGames, updatedUser, region);
			}

			await timeIt(
				"fullUpdateSummoner",
				{ gameName: input.gameName, tagLine: input.tagLine },
				fullUpdateSummoner,
			);
		}),
});

// biome-ignore lint/suspicious/noExplicitAny: not sure what a function type is.
type AnyFunction = (...args: any[]) => Promise<any>;

async function timeIt<T extends AnyFunction>(
	functionName: string,
	user: Pick<AccountDTO, "gameName" | "tagLine">,
	func: T,
	...args: Parameters<T>
): Promise<ReturnType<T>> {
	console.time(`${user.gameName}#${user.tagLine}: ${functionName}`);
	const result = await func(...args);
	console.timeEnd(`${user.gameName}#${user.tagLine}: ${functionName}`);
	return result;
}
