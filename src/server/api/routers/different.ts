import { z } from "zod";

import { regionToConstant } from "../../../utils/champsUtils";
import { createTRPCRouter, publicProcedure } from "../trpc";

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
                        data: data.map((challenge) => {
                            // There is one challenge that got an endtimestamp (id: 600012)
                            //  "name":"Challenges are Here!"
                            // Remove localization that isn't en_US
                            return {
                                ...challenge,
                                endTimestamp: challenge.endTimestamp ? new Date(challenge.endTimestamp) : null,
                                localizedNames: { en_US: challenge.localizedNames.en_US },
                            };
                        }),
                        skipDuplicates: true,
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
});
