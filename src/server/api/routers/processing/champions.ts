import type { Match, MatchInfo, Summoner } from "@prisma/client";
import type { Regions } from "twisted/dist/constants";
import type { ChampionsDataDragonDetails } from "twisted/dist/models-dto";
import type { CompleteChampionInfo } from "~/app/[region]/[username]/mastery/page";

import { prisma } from "~/server/db";
import { lolApi } from "~/server/lolApi";
import rolesJson from "./roles.json";
import { masteryBySummoner } from "./summoner";

export async function updateChampionDetails() {
	const data = await lolApi.DataDragon.getChampion();
	const champions = Object.values(data.data);

	await Promise.all(
		champions.map(async (champion) => {
			if (!champion) return;

			const championDetails = flattenChamp(champion);

			await prisma.championDetails.upsert({
				where: { id: championDetails.id },
				update: championDetails,
				create: championDetails,
			});
		}),
	);
}

export async function getCompleteChampionData(region: Regions, user: Summoner) {
	const championMasteries = await masteryBySummoner(region, user);
	const champions = await prisma.championDetails.findMany();

	const completeChampionsData = champions.map((champion) => {
		const role = rolesJson[champion.key] || "Bottom";
		const personalChampData = championMasteries.find((champ) => champ.championId === champion.id) ?? {
			championPoints: 0,
			championLevel: 0,
		};

		const { championPoints, championLevel } = personalChampData;

		return {
			...champion,
			...personalChampData,
			championPoints,
			championLevel,
			role: role,
			name: champion.name === "Nunu & Willump" ? "Nunu" : champion.name,
		} as CompleteChampionInfo;
	});

	const version = champions.at(0)?.version ?? "";

	return { completeChampionsData, version };
}

export type CompleteMatch = Match & {
	MatchInfo: MatchInfo;
	participants: Summoner[];
};

export const flattenChamp = (obj: ChampionsDataDragonDetails) => {
	const flattenedObj = {
		id: Number(obj.key),
		version: obj.version,
		key: obj.id,
		name: obj.name,
		title: obj.title,
		blurb: obj.blurb,
		attack: obj.info.attack,
		defense: obj.info.defense,
		magic: obj.info.magic,
		difficulty: obj.info.difficulty,
		full: obj.image.full,
		sprite: obj.image.sprite,
		group: obj.image.group,
		x: obj.image.x,
		y: obj.image.y,
		w: obj.image.w,
		h: obj.image.h,
		tags: obj.tags,
		partype: obj.partype,
		hp: obj.stats.hp,
		hpperlevel: obj.stats.hpperlevel,
		mp: obj.stats.mp,
		mpperlevel: obj.stats.mpperlevel,
		movespeed: obj.stats.movespeed,
		armor: obj.stats.armor,
		armorperlevel: obj.stats.armorperlevel,
		spellblock: obj.stats.spellblock,
		spellblockperlevel: obj.stats.spellblockperlevel,
		attackrange: obj.stats.attackrange,
		hpregen: obj.stats.hpregen,
		hpregenperlevel: obj.stats.hpregenperlevel,
		mpregen: obj.stats.mpregen,
		mpregenperlevel: obj.stats.mpregenperlevel,
		crit: obj.stats.crit,
		critperlevel: obj.stats.critperlevel,
		attackdamage: obj.stats.attackdamage,
		attackdamageperlevel: obj.stats.attackdamageperlevel,
		attackspeedperlevel: obj.stats.attackspeedperlevel,
		attackspeed: obj.stats.attackspeed,
	};

	return flattenedObj;
};
