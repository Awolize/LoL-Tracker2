import { Constants } from "twisted";
import { RegionGroups, regionToRegionGroup } from "twisted/dist/constants";
import { z } from "zod";

import { regionToConstant } from "../../../utils/champsUtils";
import { createTRPCRouter, publicProcedure } from "../trpc";

async function getUserByNameAndServer(ctx, username, server) {
    try {
        const response = await ctx.lolApi.Summoner.getByName(username, server);

        return response.response;
    } catch (error) {
        console.log(error);
    }
}

export const differentApiRouter = createTRPCRouter({
    updateChallengeConfig: publicProcedure
        .input(z.object({ username: z.string(), server: z.string() }))
        .query(async ({ input, ctx }) => {
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
                console.log(error);
            }
        }),

    getChallenges: publicProcedure
        .input(z.object({ username: z.string(), server: z.string() }))
        .query(async ({ input, ctx }) => {
            const region = regionToConstant(input.server.toUpperCase());

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
        .query(async ({ input, ctx }) => {
            try {
                const region = regionToConstant(input.server.toUpperCase());

                const user = await getUserByNameAndServer(ctx, input.username, Constants.Regions.EU_WEST);

                // MatchQueryV5DTO {
                //     count?: number;
                //     queue?: number;
                //     start?: number;
                //     type?: string;
                //     startTime?: number;
                //     endTime?: number;
                // }

                const gameIdsResponse = await ctx.lolApi.MatchV5.list(user.puuid, regionToRegionGroup(region), {
                    count: input.count,
                });

                const gameIds = gameIdsResponse.response;

                if (gameIds[0]) {
                    const gameReponse = await ctx.lolApi.MatchV5.get(gameIds[0], regionToRegionGroup(region));

                    console.log(gameIdsResponse.response);
                    console.log(gameIdsResponse.response.at(0));
                    console.log(JSON.stringify(gameReponse.response));

                    return gameReponse.response;
                }
            } catch (error) {
                console.log("error:", JSON.stringify(error));
            }
        }),
    updateJackOfAllChamps: publicProcedure
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
