import { z } from "zod";

import { regionToConstant } from "../../../utils/champsUtils";
import { getUserByNameAndServer } from "../differentHelper";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const differentApiRouter = createTRPCRouter({
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
});
