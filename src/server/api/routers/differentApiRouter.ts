import { z } from "zod";

import { regionToConstant } from "../../../utils/champsUtils";
import { getUserByNameAndRegion } from "../differentHelper";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { prisma } from "~/server/db";

export const differentApiRouter = createTRPCRouter({
    getChallengesConfig: publicProcedure
        .input(z.object({ username: z.string(), region: z.string() }))
        .query(async () => {
            const data = await prisma.challengesConfig.findMany({
                select: {
                    id: true,
                    localizedNames: true,
                },
                where: {
                    id: { gte: 10 },
                },
            });

            const keystones = await prisma.challengesConfig.findMany({
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
        .input(z.object({ username: z.string(), region: z.string() }))
        .query(async ({ input }) => {
            const region = regionToConstant(input.region.toUpperCase());
            const user = await getUserByNameAndRegion(input.username.toLowerCase(), region);

            const getJackOfAllChamps = async (puuid) => {
                return (
                    await prisma.challenges.findFirst({
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
