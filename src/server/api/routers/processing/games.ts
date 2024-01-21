import { type PrismaClient, type Summoner } from "@prisma/client";
import { type LolApi } from "twisted";
import { regionToRegionGroup, type Regions } from "twisted/dist/constants";
import { summonersFromGames } from "./summoner";

export const updateGames = async (prisma: PrismaClient, lolApi: LolApi, user: Summoner, region: Regions) => {
    try {
        console.log(`UpdateGames for user ${user.gameName}#${user.tagLine} (${region.toUpperCase()})`);

        let totalCount = 1000; // Total number of matches requested
        const matchIds: string[] = [];

        let start = 0;
        while (totalCount > 0) {
            const count = Math.min(100, totalCount); // Maximum count per request is 100
            const matchIdsResponse = await lolApi.MatchV5.list(user.puuid, regionToRegionGroup(region), {
                count: count,
                start: start,
                startTime: new Date("2022-05-11T00:00:00Z").getTime() / 1000,
            });
            if (matchIdsResponse.response.length === 0) break;

            matchIds.push(...matchIdsResponse.response);
            start += count;
            totalCount -= count;
        }

        console.log("Fetching", matchIds.length, "matches. For user", user.gameName, user.tagLine);

        const addedGames: string[] = [];
        const skippedGames: string[] = [];
        const failedGames: string[] = [];

        for (let index = 0; index < matchIds.length; index++) {
            const matchId = matchIds[index];

            const gameRegion: Regions | null = matchId?.split("_")[0] as Regions | null;
            const gameId = matchId?.split("_")[1];

            if (index % 50 === 0) {
                console.log(`${user.gameName}#${user.tagLine} progress: ${index} / ${matchIds.length}`);
            }

            try {
                if (!matchId || !gameId || !gameRegion) continue;

                // Create the Match record
                const existingGame = await prisma.match.findFirst({
                    where: {
                        gameId: gameId,
                    },
                });

                if (existingGame) {
                    skippedGames.push(gameId);
                    continue;
                }

                const gameResponse = await lolApi.MatchV5.get(matchId, regionToRegionGroup(gameRegion));
                const game = gameResponse.response;

                const creationPromises = summonersFromGames(prisma, lolApi, game);
                const summoners = await Promise.all(creationPromises);

                await prisma.match.create({
                    data: {
                        gameId: gameId,
                        region: gameRegion,
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
                            connect: summoners.map((summoner) => ({
                                puuid: summoner.puuid,
                            })),
                        },
                    },
                });

                addedGames.push(gameId);

                // Delay for 5000 milliseconds (0.2 times per second)
                await new Promise((resolve) => setTimeout(resolve, 5000));
            } catch (error) {
                if (!gameId) {
                    console.error("gameid doesnt exist?", gameId);
                    console.error({ error });
                    continue;
                }

                // Retry the same game by decrementing the index
                if (failedGames.includes(gameId)) {
                    console.error("something went wrong on gameId:", gameId);
                    console.warn("continue");
                    continue;
                }

                console.error("something went wrong on gameId:", gameId);
                console.warn("retry");
                index--;
                console.log(
                    `${user.gameName}#${user.tagLine}`,
                    "progress:",
                    index,
                    "/",
                    matchIds.length,
                    "(rate limit!)",
                );

                failedGames.push(gameId);
            }
        }
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
