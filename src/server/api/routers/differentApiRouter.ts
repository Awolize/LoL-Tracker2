import { Constants } from "twisted";
import type { Regions } from "twisted/dist/constants";
import { regionToRegionGroup } from "twisted/dist/constants";
import { z } from "zod";

import type { Participant } from "../../../types/different_types";
import { regionToConstant } from "../../../utils/champsUtils";
import {
    getUserByNameAndServer,
    updateChampionDetails,
    prepareSummonersCreation,
    getMatchesForSummonerBySummoner,
} from "../differentHelper";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const differentApiRouter = createTRPCRouter({
    updateChallengeConfig: publicProcedure
        .input(z.object({ username: z.string(), server: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const region = regionToConstant(input.server.toUpperCase());
            const data = (await ctx.lolApi.Challenges.getConfig(region)).response;

            try {
                await ctx.prisma.$transaction([
                    // upsertMany hack
                    ctx.prisma.challengesConfig.deleteMany(),
                    ctx.prisma.challengesConfig.createMany({
                        data: data.map((challenge: any) => {
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
                    ctx.prisma.challengeLocalization.createMany({
                        data: data.map((challenge: any) => {
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

    getChallengesConfig: publicProcedure
        .input(z.object({ username: z.string(), server: z.string() }))
        .query(async ({ ctx }) => {
            const data = await ctx.prisma.challengesConfig.findMany({
                select: {
                    id: true,
                    localizedNames: true,
                },
                where: {
                    id: { gte: 10 },
                },
            });

            const keystones = await ctx.prisma.challengesConfig.findMany({
                select: {
                    id: true,
                    localizedNames: true,
                },
                where: {
                    id: { lt: 10 },
                },
            });
            return { data, keystones };
        }),

    updateGames: publicProcedure
        .input(z.object({ username: z.string(), server: z.string(), count: z.number() }))
        .mutation(async ({ input, ctx }) => {
            try {
                console.log("UpdateGames for user", input.username, input.server.toUpperCase());

                const region = regionToConstant(input.server.toUpperCase());

                const user = await getUserByNameAndServer(ctx, input.username, region);

                let totalCount = input.count; // Total number of matches requested
                const matchIds: string[] = [];

                let start = 0;
                while (totalCount > 0) {
                    const count = Math.min(100, totalCount); // Maximum count per request is 100
                    const matchIdsResponse = await ctx.lolApi.MatchV5.list(user.puuid, regionToRegionGroup(region), {
                        count: count,
                        start: start,
                        startTime: new Date("2022-05-11T00:00:00Z").getTime() / 1000,
                    });
                    if (matchIdsResponse.response.length === 0) break;

                    matchIds.push(...matchIdsResponse.response);
                    start += count;
                    totalCount -= count;
                }
                console.log("Fetching", matchIds.length, "matches. For user", user.username);

                const successfullyAddedGameIds: string[] = [];
                const skipAddedGameIds: string[] = [];
                const failedGameIds: string[] = [];

                for (let index = 0; index < matchIds.length; index++) {
                    // Delay for 5000 milliseconds (0.2 times per second)
                    await new Promise((resolve) => setTimeout(resolve, 5000));

                    const matchId = matchIds[index];

                    const gameServer: Regions | null = matchId?.split("_")[0] as Regions | null;
                    const gameId = matchId?.split("_")[1];

                    try {
                        if (!matchId || !gameId || !gameServer) continue;

                        // Create the Match record
                        const existingGame = await ctx.prisma.match.findFirst({
                            where: {
                                gameId: gameId,
                            },
                        });
                        if (existingGame) {
                            skipAddedGameIds.push(gameId);
                            continue;
                        }

                        const gameResponse = await ctx.lolApi.MatchV5.get(matchId, regionToRegionGroup(gameServer));
                        const game = gameResponse.response;

                        const creationPromises = prepareSummonersCreation(ctx, game);
                        const summoners = await Promise.all(creationPromises);

                        const createdMatch = await ctx.prisma.match.create({
                            data: {
                                gameId: gameId,
                                server: gameServer,
                                MatchInfo: {
                                    create: {
                                        gameCreation: new Date(game.info.gameCreation),
                                        gameDuration: game.info.gameDuration,
                                        gameEndTimestamp: new Date(
                                            game.info.gameStartTimestamp + game.info.gameDuration
                                        ), // wrong
                                        gameMode: game.info.gameMode,
                                        gameName: game.info.gameName,
                                        gameStartTimestamp: new Date(game.info.gameStartTimestamp),
                                        gameType: game.info.gameType,
                                        gameVersion: game.info.gameVersion,
                                        mapId: game.info.mapId,
                                        participants: game.info.participants as any,
                                        platformId: game.info.platformId,
                                        queueId: game.info.queueId,
                                        teams: game.info.teams as any,
                                        tournamentCode: game.info.tournamentCode,
                                    },
                                },
                                participants: {
                                    connect: summoners.map((summoner) => ({
                                        puuid: summoner.puuid,
                                    })),
                                },
                            },
                        });

                        successfullyAddedGameIds.push(gameId);
                    } catch (error) {
                        if (!gameId) {
                            console.error("gameid doesnt exist?", gameId);
                            console.error({ error });
                            continue;
                        }

                        // Retry the same game by decrementing the index
                        if (failedGameIds.includes(gameId)) {
                            console.error("something went wrong on gameId:", gameId);
                            console.warn("continue");
                            continue;
                        } else {
                            console.error("something went wrong on gameId:", gameId);
                            console.warn("retry");
                            index--;
                            console.log(user.username, "progress:", index, "/", matchIds.length);
                        }

                        failedGameIds.push(gameId);
                    }
                }
                console.log({
                    successfullyAddedGameIds: successfullyAddedGameIds.length,
                    failedGameIds: failedGameIds.length,
                    skipAddedGameIds: skipAddedGameIds.length,
                });
                return { successfullyAddedGameIds, failedGameIds, skipAddedGameIds };
            } catch (error) {
                console.log("error:", JSON.stringify(error));
            }
        }),
    updateJackOfAllChamps: publicProcedure
        .input(z.object({ username: z.string(), server: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const region = regionToConstant(input.server.toUpperCase());

            const user = await ctx.prisma.summoner.findFirst({
                where: {
                    username: {
                        mode: "insensitive",
                        equals: input.username,
                    },
                },
            });

            if (!user) return;

            const matches = await getMatchesForSummonerBySummoner(ctx, user);

            if (!matches) return;

            const filteredInfoParticipants = matches
                .map((match) =>
                    (match.MatchInfo?.participants as any as Participant[] | undefined)?.filter(
                        (par) => par.puuid === user.puuid /* && par.champ == "champ" ish */
                    )
                )
                .flat()
                .filter(Boolean) as Participant[];

            console.log(user.username, "Found", filteredInfoParticipants?.length, "games");

            const loses: Participant[] = [];
            const wins: Participant[] = [];

            for (const participantInfo of filteredInfoParticipants) {
                if (participantInfo.win) {
                    wins.push(participantInfo);
                } else {
                    loses.push(participantInfo);
                }
            }

            const challenges = (
                await ctx.prisma.summoner.findFirst({
                    where: { puuid: user.puuid },
                    include: { challenges: true },
                })
            )?.challenges;

            if (!challenges) {
                await ctx.prisma.challenges.create({
                    data: {
                        summoner: { connect: { puuid: user.puuid } },
                    },
                });
            }

            const uniqueWins: Set<number> = new Set(wins.map((win) => win.championId));
            const uniqueLoses: Set<number> = new Set(loses.map((lose) => lose.championId));

            try {
                await ctx.prisma.challenges.update({
                    where: {
                        puuid: user.puuid,
                    },
                    data: {
                        jackOfAllChamps: {
                            connect: [...uniqueWins].map((win) => ({ id: win })),
                        },
                    },
                });
            } catch (error) {
                await updateChampionDetails(ctx);
                console.error("Missing champ??");
            }

            console.log(user.username, matches.length, {
                wins: uniqueWins.size,
                loses: uniqueLoses.size,
            });

            return { numberOfGames: matches.length, uniqueWins: uniqueWins.size, uniqueLoses: uniqueLoses.size };
        }),
    getJackOfAllChamps: publicProcedure
        .input(z.object({ username: z.string(), server: z.string() }))
        .query(async ({ input, ctx }) => {
            const region = regionToConstant(input.server.toUpperCase());
            const user = await getUserByNameAndServer(ctx, input.username, region);

            const getJackOfAllChamps = async (puuid) => {
                return (
                    await ctx.prisma.challenges.findFirst({
                        where: {
                            puuid: puuid,
                        },
                        include: {
                            jackOfAllChamps: true,
                        },
                    })
                )?.jackOfAllChamps;
            };

            return await getJackOfAllChamps(user.puuid);
        }),
    updateChampions: publicProcedure
        .input(z.object({ username: z.string(), server: z.string() }))
        .query(async ({ input, ctx }) => {
            const region = regionToConstant(input.server.toUpperCase());

            return {};
        }),
    updateInvincible: publicProcedure
        .input(z.object({ username: z.string(), server: z.string() }))
        .query(async ({ input, ctx }) => {
            const region = regionToConstant(input.server.toUpperCase());

            return {};
        }),
    updatePerfectionist: publicProcedure
        .input(z.object({ username: z.string(), server: z.string() }))
        .query(async ({ input, ctx }) => {
            const region = regionToConstant(input.server.toUpperCase());

            return {};
        }),
});
