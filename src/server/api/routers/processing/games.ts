import { type PrismaClient, type Summoner } from "@prisma/client";
import { type LolApi } from "twisted";
import { regionToRegionGroup, type Regions } from "twisted/dist/constants";
import { RateLimitError } from "twisted/dist/errors";
import { summonersFromGames } from "./summoner";

export const updateGames = async (prisma: PrismaClient, lolApi: LolApi, user: Summoner, region: Regions) => {
    try {
        console.log(`UpdateGames for user ${user.gameName}#${user.tagLine} (${user.region})`);

        const matchIds = await fetchMatchIds(lolApi, user.puuid, region);

        console.log("Fetching", matchIds.length, "matches. For user", user.gameName, user.tagLine);

        const { addedGames, skippedGames, failedGames } = await processMatches(prisma, lolApi, user, region, matchIds);

        console.log({
            addedGames: addedGames.length,
            failedGames: failedGames.length,
            skipAddingGames: skippedGames.length,
        });

        return { addedGames, failedGames, skippedGames };
    } catch (error) {
        console.log("error:", JSON.stringify(error));
    }
};

const fetchMatchIds = async (lolApi: LolApi, puuid: string, region: Regions): Promise<string[]> => {
    let totalCount = 1000; // Total number of matches requested
    const matchIds: string[] = [];
    let start = 0;

    while (totalCount > 0) {
        const count = Math.min(100, totalCount); // Maximum count per request is 100
        const matchIdsResponse = await lolApi.MatchV5.list(puuid, regionToRegionGroup(region), {
            count: count,
            start: start,
            startTime: new Date("2022-05-11T00:00:00Z").getTime() / 1000,
        });

        if (matchIdsResponse.response.length === 0) break;

        matchIds.push(...matchIdsResponse.response);
        start += count;
        totalCount -= count;
    }

    return matchIds;
};

const processMatches = async (
    prisma: PrismaClient,
    lolApi: LolApi,
    user: Summoner,
    region: Regions,
    matchIds: string[],
): Promise<{ addedGames: string[]; skippedGames: string[]; failedGames: string[] }> => {
    const addedGames: string[] = [];
    const skippedGames: string[] = [];
    const failedGames: string[] = [];

    const existingGames = await prisma.match.findMany({
        where: {
            gameId: { in: matchIds },
        },
    });

    const newMatchIds = matchIds.filter((matchId) => {
        const newGame = !existingGames.some((existingGame) => existingGame.gameId === matchId);
        if (!newGame) {
            skippedGames.push(matchId);
        }
        return newGame;
    });

    console.log(`Filtered ${skippedGames.length} before starting.`);

    for (const [index, matchId] of newMatchIds.entries()) {
        if (index % 50 === 0) {
            console.log(`${user.gameName}#${user.tagLine} (${user.region}) progress: ${index} / ${newMatchIds.length}`);
        }

        try {
            const existingGame = await prisma.match.findFirst({
                where: {
                    gameId: matchId,
                },
            });

            if (existingGame) {
                skippedGames.push(matchId);
                continue;
            }

            await processSingleMatch(prisma, lolApi, region, matchId);

            addedGames.push(matchId);
        } catch (error) {
            if (failedGames.includes(matchId)) {
                continue;
            }

            console.error(
                `[Game error] ${user.gameName}#${user.tagLine} (${user.region}) progress: ${index} / ${newMatchIds.length}`,
            );

            if (error instanceof RateLimitError && error.status === 429) {
                const retryAfter = (error.rateLimits.RetryAfter || 60) + 1;
                console.error(`[Game] Rate limited. Retrying after ${retryAfter} seconds...`);
                await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
                newMatchIds.push(matchId);
            } else {
                console.error("something went wrong on gameId:", matchId);
                console.error({ error });
            }

            failedGames.push(matchId);
        }
    }

    return { addedGames, skippedGames, failedGames };
};

const processSingleMatch = async (prisma: PrismaClient, lolApi: LolApi, region: Regions, matchId: string) => {
    const gameResponse = await lolApi.MatchV5.get(matchId, regionToRegionGroup(region));
    const game = gameResponse.response;

    const creationPromises = summonersFromGames(prisma, lolApi, game);
    const summoners = await Promise.all(
        creationPromises.map(async (createPromise) => {
            try {
                return await createPromise;
            } catch (error) {
                console.error("Error creating summoner:", error);
                return null;
            }
        }),
    );

    const validSummoners = summoners.filter((summoner): summoner is Summoner => summoner !== null);

    await prisma.match.create({
        data: {
            gameId: matchId,
            MatchInfo: {
                create: {
                    gameCreation: new Date(game.info.gameCreation),
                    gameDuration: game.info.gameDuration,
                    gameEndTimestamp: new Date(game.info.gameStartTimestamp + game.info.gameDuration), // wrong
                    gameMode: game.info.gameMode,
                    gameName: game.info.gameName,
                    gameStartTimestamp: new Date(game.info.gameStartTimestamp),
                    gameType: game.info.gameType,
                    gameVersion: game.info.gameVersion,
                    mapId: game.info.mapId,
                    participants: game.info.participants as never,
                    platformId: game.info.platformId,
                    queueId: game.info.queueId,
                    teams: game.info.teams as never,
                    tournamentCode: game.info.tournamentCode,
                },
            },
            participants: {
                connect: validSummoners.map((summoner) => ({
                    puuid: summoner.puuid,
                })),
            },
        },
    });
};
