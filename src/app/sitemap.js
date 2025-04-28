import { PrismaClient } from "@prisma/client";

const BASE_URL = "https://lol.awot.dev";
const SUMMONERS_PER_SITEMAP = 10000;

export async function generateSitemaps() {
	const prisma = new PrismaClient();
	const summonersSize = await prisma.summoner.count();
	const numberOfSitemaps = Math.ceil(summonersSize / SUMMONERS_PER_SITEMAP);
	const resultArray = Array.from({ length: numberOfSitemaps }, (_, index) => ({
		id: index,
	}));
	return resultArray;
}

export default async function sitemap({ id: sitemapId }) {
	const summoners = (await getSummoners(sitemapId)).filter((e) => e.gameName && e.tagLine);
	const summonersSitemaps = summoners.map(({ gameName, tagLine, updatedAt }) => ({
		url: `${BASE_URL}/EUW/${gameName}-${tagLine}`,
		lastModified: updatedAt,
	}));
	return [
		{
			url: BASE_URL,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 1,
		},
		{
			url: `${BASE_URL}/search`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		...summonersSitemaps,
	];
}

/**
 * @param {number} sitemapId
 */
async function getSummoners(sitemapId) {
	const prisma = new PrismaClient();
	const summoners = await prisma.summoner.findMany({
		skip: 10000 * sitemapId,
		take: 10000,
	});
	return summoners;
}
