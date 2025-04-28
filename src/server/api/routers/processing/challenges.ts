import type { Challenge, Summoner } from "@prisma/client";
import type { Regions } from "twisted/dist/constants";
import { prisma } from "~/server/db";
import { lolApi } from "~/server/lolApi";

export const upsertChallenges = async (region: Regions, user: Summoner) => {
	const response = (await lolApi.Challenges.PlayerChallenges(user.puuid, region)).response;

	const upsertedChallenges = await prisma.challengesDetails.upsert({
		where: {
			puuid: user.puuid,
		},
		update: {
			puuid: user.puuid,
			totalPoints: {
				upsert: {
					update: {
						current: response.totalPoints.current,
						level: response.totalPoints.level,
						max: response.totalPoints.max,
					},
					create: {
						current: response.totalPoints.current,
						level: response.totalPoints.level,
						max: response.totalPoints.max,
					},
				},
			},
			categoryPoints: {
				upsert: Object.entries(response.categoryPoints).map(([category, categoryData]) => ({
					where: { category_challengesDetailsId: { category, challengesDetailsId: user.puuid } },
					update: {
						level: categoryData.level,
						current: categoryData.current,
						max: categoryData.max,
						percentile: categoryData.percentile ?? -1,
					},
					create: {
						category,
						level: categoryData.level,
						current: categoryData.current,
						max: categoryData.max,
						percentile: categoryData.percentile ?? -1,
					},
				})),
			},
			preferences: {
				update: {
					bannerAccent: response.preferences.bannerAccent,
					title: response.preferences.title,
					challengeIds: response.preferences.challengeIds,
				},
			},
			challenges: {
				upsert: response.challenges.map((challenge) => ({
					where: {
						challengeId_challengesDetailsId: {
							challengeId: challenge.challengeId,
							challengesDetailsId: user.puuid,
						},
					},
					update: {
						percentile: challenge.percentile,
						level: challenge.level,
						value: challenge.value,
						achievedTime: challenge.achievedTime ? new Date(challenge.achievedTime) : null,
					},
					create: {
						challengeId: challenge.challengeId,
						percentile: challenge.percentile,
						level: challenge.level,
						value: challenge.value,
						achievedTime: challenge.achievedTime ? new Date(challenge.achievedTime) : null,
					},
				})),
			},
		},
		create: {
			puuid: user.puuid,
			totalPoints: {
				create: {
					current: response.totalPoints.current,
					level: response.totalPoints.level,
					max: response.totalPoints.max,
				},
			},
			categoryPoints: {
				createMany: {
					data: Object.entries(response.categoryPoints).map(([category, categoryData]) => ({
						category,
						level: categoryData.level,
						current: categoryData.current,
						max: categoryData.max,
						percentile: categoryData.percentile ?? -1,
					})),
				},
			},
			preferences: {
				create: {
					bannerAccent: response.preferences.bannerAccent,
					title: response.preferences.title,
					challengeIds: response.preferences.challengeIds,
				},
			},
			challenges: {
				createMany: {
					data: response.challenges.map((challenge) => ({
						challengeId: challenge.challengeId,
						percentile: challenge.percentile,
						level: challenge.level,
						value: challenge.value,
						achievedTime: challenge.achievedTime ? new Date(challenge.achievedTime) : null,
					})),
				},
			},
		},
	});

	return upsertedChallenges;
};

export const getPlayerChallengesDataAll = async (user: Summoner) => {
	const challengesDetails = await prisma.challengesDetails.findFirst({
		where: { puuid: user.puuid },
		include: { challenges: true },
	});

	if (!challengesDetails) {
		console.error(`Could not find summoner challenge data, puuid: ${user.puuid}`);
		return new Map<number, Challenge>();
	}

	const filteredChallenges = challengesDetails.challenges;
	const challengesMap = filteredChallenges.reduce((map, challenge) => {
		map.set(challenge.challengeId as number, challenge);
		return map;
	}, new Map<number, Challenge>());

	return challengesMap;
};
