import { type Regions, regionToRegionGroup } from "twisted/dist/constants";
import { z } from "zod";

import { type Participant } from "~/trpc/different_types";
import { regionToConstant } from "~/utils/champsUtils";
import { getMatchesForSummonerBySummoner } from "../differentHelper";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { upsertChallenges } from "./processing/challenges";
import { updateChallengesConfig } from "./processing/challengesConfig";
import { updateChampionDetails } from "./processing/champions";
import { updateGames } from "./processing/games";
import { upsertMastery } from "./processing/mastery";
import { upsertSummoner } from "./processing/summoner";

import { prisma } from "~/server/db";
import { lolApi } from "~/server/lolApi";
import { riotApi } from "~/server/riotApi";

export const processingApiRouter = createTRPCRouter({
    updateChallengeConfig: publicProcedure
        .input(z.object({ username: z.string(), region: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const region = regionToConstant(input.region.toUpperCase());
            const data = (await lolApi.Challenges.getConfig(region)).response;

            try {
                await ctx.prisma.$transaction([
                    // upsertMany "hack"
                    ctx.prisma.challengesConfig.deleteMany(),
                    ctx.prisma.challengesConfig.createMany({
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
                    ctx.prisma.challengeLocalization.createMany({
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
    updateJackOfAllChamps: publicProcedure
        .input(z.object({ username: z.string(), region: z.string() }))
        .mutation(async ({ input, ctx }) => {
            console.log(`updateJackOfAllChamps for user ${input.username} (${input.region.toUpperCase()})`);

            const region = regionToConstant(input.region.toUpperCase());

            const user = await ctx.prisma.summoner.findFirst({
                where: {
                    username: {
                        mode: "insensitive",
                        equals: input.username,
                    },
                    region: region,
                },
            });

            if (!user) return;

            const matches = await getMatchesForSummonerBySummoner(user);

            if (!matches) return;

            const filteredInfoParticipants = matches
                .flatMap((match) =>
                    (match.MatchInfo?.participants as unknown as Participant[] | undefined)?.filter(
                        (par) => par.puuid === user.puuid /* && par.champ == "champ" ish */,
                    ),
                )
                .filter(Boolean) as Participant[];

            console.log(
                `${user.gameName}#${user.tagLine} (${user.region}) found ${filteredInfoParticipants?.length} games`,
            );

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

            const uniqueWins = new Set<number>(wins.map((win) => win.championId));
            const uniqueLoses = new Set<number>(loses.map((lose) => lose.championId));

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
                await updateChampionDetails();
                console.error("Missing champ??");
            }

            console.log(`${user.gameName}#${user.tagLine} (${user.region})`, matches.length, {
                wins: uniqueWins.size,
                loses: uniqueLoses.size,
            });

            return { numberOfGames: matches.length, uniqueWins: uniqueWins.size, uniqueLoses: uniqueLoses.size };
        }),
    updateGames: publicProcedure
        .input(z.object({ gameName: z.string(), tagLine: z.string(), region: z.string() }))
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
            console.time("updateGames");
            await updateGames(updatedUser, region);
            console.timeEnd("updateGames");
        }),
    updateChampions: publicProcedure
        .input(z.object({ gameName: z.string(), tagLine: z.string(), region: z.string() }))
        .mutation(async ({ ctx, input }) => {
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

            // Update global challenges
            console.time("updateChallengesConfig");
            await updateChallengesConfig(region);
            console.timeEnd("updateChallengesConfig");

            // Update global champions
            console.time("championDetails");
            await updateChampionDetails();
            console.timeEnd("championDetails");

            // Update profile
            console.time("upsertSummoner");
            const updatedUser = await upsertSummoner(user.puuid, region);
            console.timeEnd("upsertSummoner");

            if (!updatedUser) {
                console.log("Could not update user");
                console.timeEnd("updateSummoner");
                return false;
            }

            // Update championMasteries
            console.time("upsertMastery");
            await upsertMastery(updatedUser, region);
            console.timeEnd("upsertMastery");

            // update challenges
            console.time("upsertChallenges");
            await upsertChallenges(region, updatedUser);
            console.timeEnd("upsertChallenges");

            // update games
            console.time("updateGames");
            await updateGames(updatedUser, region);
            console.timeEnd("updateGames");

            console.timeEnd("updateSummoner");
        }),
});
