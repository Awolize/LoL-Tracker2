import type { Challenge, Summoner } from "@prisma/client";
import type { Regions } from "twisted/dist/constants";
import type { ChallengeV1DTO } from "twisted/dist/models-dto";

import { prisma } from "~/server/db";
import { lolApi } from "~/server/lolApi";
import { type ChallengeIds, isChallengeId } from "~/utils/champsUtils";

export const upsertChallenges = async (region: Regions, user: Summoner) => {
	const response = (await lolApi.Challenges.getPlayerData(user.puuid, region)).response;

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
						percentile: response.totalPoints.percentile,
					},
					create: {
						current: response.totalPoints.current,
						level: response.totalPoints.level,
						max: response.totalPoints.max,
						percentile: response.totalPoints.percentile,
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
						percentile: categoryData.percentile,
					},
					create: {
						category,
						level: categoryData.level,
						current: categoryData.current,
						max: categoryData.max,
						percentile: categoryData.percentile,
					},
				})),
			},
			preferences: {
				update: {
					bannerAccent: response.preferences.bannerAccent,
					title: response.preferences.title,
					challengeIds: response.preferences.challengeIds,
					crestBorder: response.preferences.crestBorder,
					prestigeCrestBorderLevel: response.preferences.prestigeCrestBorderLevel,
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
						position: challenge.position,
						playersInLevel: challenge.playersInLevel,
					},
					create: {
						challengeId: challenge.challengeId,
						percentile: challenge.percentile,
						level: challenge.level,
						value: challenge.value,
						achievedTime: challenge.achievedTime ? new Date(challenge.achievedTime) : null,
						position: challenge.position,
						playersInLevel: challenge.playersInLevel,
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
					percentile: response.totalPoints.percentile,
				},
			},
			categoryPoints: {
				createMany: {
					data: Object.entries(response.categoryPoints).map(([category, categoryData]) => ({
						category,
						level: categoryData.level,
						current: categoryData.current,
						max: categoryData.max,
						percentile: categoryData.percentile,
					})),
				},
			},
			preferences: {
				create: {
					bannerAccent: response.preferences.bannerAccent,
					title: response.preferences.title,
					challengeIds: response.preferences.challengeIds,
					crestBorder: response.preferences.crestBorder,
					prestigeCrestBorderLevel: response.preferences.prestigeCrestBorderLevel,
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
						position: challenge.position,
						playersInLevel: challenge.playersInLevel,
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
