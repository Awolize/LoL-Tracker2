import type { Regions } from "twisted/dist/constants";
import { z } from "zod";

import { prisma } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { getPlayerChallengesDataAll } from "./processing/challenges";
import { getUserByNameAndRegion } from "./processing/summoner";

export const differentApiRouter = createTRPCRouter({
	getChallengesConfigDescriptions: publicProcedure
		.input(z.object({ username: z.string(), region: z.string() }))
		.query(async () => {
			const data = await prisma.challengesConfig.findMany({
				select: {
					id: true,
					localizedNames: true,
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

	getChallengesConfig: publicProcedure
		.input(z.object({ username: z.string(), region: z.string() }))
		.query(async () => {
			const data = await prisma.challengesConfig.findMany();

			// Ensure thresholds field is cast to Record<string, number>
			const challengeConfigs = data.map((config) => ({
				...config,
				thresholds: config.thresholds as Record<string, number>, // Explicit cast
			}));

			return { data: challengeConfigs };
		}),

	getPlayerChallengesData: publicProcedure
		.input(z.object({ username: z.string(), region: z.string() }))
		.query(async ({ input }) => {
			const region = input.region as Regions;
			const user = await getUserByNameAndRegion(input.username.toLowerCase(), region);

			return getPlayerChallengesDataAll(user);
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

			return (await getChampionOcean(user.puuid)) ?? [];
		}),

	getChampionOcean2024Split3: publicProcedure
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
							championOcean2024Split3: true,
						},
					})
				)?.championOcean2024Split3;
			};

			return (await getChampionOcean(user.puuid)) ?? [];
		}),

	getAdaptToAllSituations: publicProcedure
		.input(z.object({ username: z.string(), region: z.string() }))
		.query(async ({ input }) => {
			const region = input.region as Regions;
			const user = await getUserByNameAndRegion(input.username.toLowerCase(), region);

			const getAdaptToAllSituations = async (puuid) => {
				return (
					await prisma.challenges.findFirst({
						where: {
							puuid: puuid,
						},
						include: {
							adaptToAllSituations: true,
						},
					})
				)?.adaptToAllSituations;
			};

			return (await getAdaptToAllSituations(user.puuid)) ?? [];
		}),
	getInvincible: publicProcedure
		.input(z.object({ username: z.string(), region: z.string() }))
		.query(async ({ input }) => {
			const region = input.region as Regions;
			const user = await getUserByNameAndRegion(input.username.toLowerCase(), region);

			const getInvincible = async (puuid) => {
				return (
					await prisma.challenges.findFirst({
						where: {
							puuid: puuid,
						},
						include: {
							invincible: true,
						},
					})
				)?.invincible;
			};

			return (await getInvincible(user.puuid)) ?? [];
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

			return (await getJackOfAllChamps(user.puuid)) ?? [];
		}),
});
