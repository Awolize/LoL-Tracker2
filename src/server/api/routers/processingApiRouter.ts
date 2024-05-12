import { type Regions, regionToRegionGroup } from "twisted/dist/constants";
import { z } from "zod";

import type { Participant } from "~/trpc/different_types";
import { regionToConstant } from "~/utils/champsUtils";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { upsertChallenges } from "./processing/challenges";
import { updateChallengesConfig } from "./processing/challengesConfig";
import { updateChampionDetails } from "./processing/champions";
import { upsertMastery } from "./processing/mastery";
import { getArenaMatches, getMatches, updateGames } from "./processing/match";
import { getUserByNameAndRegion, upsertSummoner } from "./processing/summoner";

import type { AccountDTO } from "twisted/dist/models-dto/accounts/account.dto";
import { prisma } from "~/server/db";
import { lolApi } from "~/server/lolApi";
import { riotApi } from "~/server/riotApi";

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

            const participants = matches
                .flatMap((match) => match.MatchInfo.participants)
                .filter((p) => (p as unknown as Participant)?.puuid === user.puuid)
                .filter(Boolean) as unknown as Participant[];

            console.log(`${user.gameName}#${user.tagLine} (${user.region}) found ${participants?.length} games`);

            const uniqueChampIds: Set<number> = new Set(participants.map((p) => p.championId));

            const challenges = (
                await prisma.summoner.findFirst({
                    where: { puuid: user.puuid },
                    include: { challenges: true },
                })
            )?.challenges;

            if (!challenges) {
                await prisma.challenges.create({
                    data: {
                        summoner: { connect: { puuid: user.puuid } },
                    },
                });
            }

            try {
                await prisma.challenges.update({
                    where: {
                        puuid: user.puuid,
                    },
                    data: {
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

    updateAdaptToAllSituations: publicProcedure
        .input(z.object({ username: z.string(), region: z.string() }))
        .mutation(async ({ input }) => {
            console.log(`updateAdaptToAllSituations for user ${input.username} (${input.region.toUpperCase()})`);

            const region = input.region as Regions;

            const user = await getUserByNameAndRegion(input.username, region);
            if (!user) return;

            const matches = await getArenaMatches(user);
            if (!matches) return;

            const participants = matches
                .flatMap((match) => match.MatchInfo.participants)
                .filter((p) => (p as unknown as Participant)?.puuid === user.puuid)
                .filter((p) => (p as unknown as { placement?: number })?.placement === 1)
                .filter(Boolean) as unknown as Participant[];

            console.log(`${user.gameName}#${user.tagLine} (${user.region}) found ${participants?.length} games`);

            const uniqueChampIds: Set<number> = new Set(participants.map((p) => p.championId));

            const challenges = (
                await prisma.summoner.findFirst({
                    where: { puuid: user.puuid },
                    include: { challenges: true },
                })
            )?.challenges;

            if (!challenges) {
                await prisma.challenges.create({
                    data: {
                        summoner: { connect: { puuid: user.puuid } },
                    },
                });
            }

            try {
                await prisma.challenges.update({
                    where: {
                        puuid: user.puuid,
                    },
                    data: {
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

    updateJackOfAllChamps: publicProcedure
        .input(z.object({ username: z.string(), region: z.string() }))
        .mutation(async ({ input, ctx }) => {
            console.log(`updateJackOfAllChamps for user ${input.username} (${input.region.toUpperCase()})`);

            const region = input.region as Regions;

            const user = await getUserByNameAndRegion(input.username, region);
            if (!user) return;

            const matches = await getMatches(user, 10000);
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
                await prisma.summoner.findFirst({
                    where: { puuid: user.puuid },
                    include: { challenges: true },
                })
            )?.challenges;

            if (!challenges) {
                await prisma.challenges.create({
                    data: {
                        summoner: { connect: { puuid: user.puuid } },
                    },
                });
            }

            const uniqueWins = new Set<number>(wins.map((win) => win.championId));
            const uniqueLoses = new Set<number>(loses.map((lose) => lose.championId));

            try {
                await prisma.challenges.update({
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
        .input(z.object({ gameName: z.string(), tagLine: z.string(), region: z.string() }))
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
