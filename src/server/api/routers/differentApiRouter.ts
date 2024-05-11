import { z } from "zod";

import type { Regions } from "twisted/dist/constants";
import { prisma } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { getUserByNameAndRegion } from "./processing/summoner";

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

    getChampionOcean: publicProcedure
        .input(z.object({ username: z.string(), region: z.string() }))
        .query(async ({ input }) => {
            const region = input.region as Regions;
            const user = await getUserByNameAndRegion(input.username.toLowerCase(), region);

            const getChampionOcean = async (puuid) => {
                return (
                    await prisma.challenges.findFirst({
                        where: {
                            puuid: puuid,
                        },
                        include: {
                            championOcean: true,
                        },
                    })
                )?.championOcean;
            };

            return await getChampionOcean(user.puuid);
        }),
    getJackOfAllChamps: publicProcedure
        .input(z.object({ username: z.string(), region: z.string() }))
        .query(async ({ input }) => {
            const region = input.region as Regions;
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
