import type { PrismaClient, Prisma, Summoner } from "@prisma/client";
import type { LolApi } from "twisted";
import type { Regions } from "twisted/dist/constants";
import type { MatchV5DTOs } from "twisted/dist/models-dto";

export async function getUserByNameAndServer(
    ctx: {
        prisma: PrismaClient<
            Prisma.PrismaClientOptions,
            never,
            Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
        >;
        lolApi: LolApi;
    },
    username: string,
    server: Regions
) {
    try {
        const user = await ctx.prisma.summoner.findFirst({
            where: {
                username: {
                    mode: "insensitive",
                    equals: username,
                },
                server: server,
            },
        });

        if (user) {
            return user; // is Summoner;
        } else {
            const response = (await ctx.lolApi.Summoner.getByName(username, server)).response;

            // Map API response to Summoner
            const userData: Summoner = {
                puuid: response.puuid,
                summonerId: response.id,
                createdAt: new Date(),
                updatedAt: new Date(),
                server: server,
                username: response.name,
                profileIconId: response.profileIconId,
                summonerLevel: response.summonerLevel,
                revisionDate: new Date(response.revisionDate),
                accountId: response.accountId,
            };

            return userData;
        }
    } catch (error) {
        console.error("error:", error);
        console.error(JSON.stringify(error));
        throw new Error("Could not fetch summoner^");
    }
}

export const prepareSummonersCreation = (
    ctx: {
        prisma: PrismaClient<
            Prisma.PrismaClientOptions,
            never,
            Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
        >;
        lolApi: LolApi;
    },
    game: MatchV5DTOs.MatchDto
) => {
    const participantSummoners = game.metadata.participants;

    // Create or find existing Summoner records for each participant
    const summonerPromises = participantSummoners.map(async (participant) => {
        const existingSummoner = await ctx.prisma.summoner.findUnique({
            where: {
                puuid: participant,
            },
        });

        if (existingSummoner) {
            return existingSummoner;
        } else {
            // Create a new Summoner record if it doesn't exist
            const region: Regions | null = game.metadata.matchId.split("_")[0] as Regions | null;
            if (!region) {
                console.log(`could not prepareSummonersCreation based on matchId splice ${game.metadata.matchId}`);
                throw new Error(`could not prepareSummonersCreation based on matchId splice ${game.metadata.matchId}`);
            }
            const user = (await ctx.lolApi.Summoner.getByPUUID(participant, region)).response;
            const upsertedSummoner = await ctx.prisma.summoner.upsert({
                where: {
                    puuid: user.puuid,
                },
                update: {
                    summonerId: user.id,
                    server: region,
                    username: user.name,
                    profileIconId: user.profileIconId,
                    summonerLevel: user.summonerLevel,
                    revisionDate: new Date(user.revisionDate),
                    accountId: user.accountId,
                },
                create: {
                    puuid: user.puuid,
                    summonerId: user.id,
                    server: region,
                    username: user.name,
                    profileIconId: user.profileIconId,
                    summonerLevel: user.summonerLevel,
                    revisionDate: new Date(user.revisionDate),
                    accountId: user.accountId,
                },
            });

            return upsertedSummoner;
        }
    });

    return summonerPromises;
};

export const flattenChamp = (obj) => {
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

export const updateChampionDetails = async (ctx: {
    prisma: PrismaClient<
        Prisma.PrismaClientOptions,
        never,
        Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >;
    lolApi: LolApi;
}) => {
    const data = await ctx.lolApi.DataDragon.getChampion();

    for (const championKey in data.data) {
        const champion = data.data[championKey];

        if (!champion) continue;

        const championDetails = flattenChamp(champion);

        await ctx.prisma.championDetails.upsert({
            where: { id: Number(champion.key) }, // data dragon champions key is the real id (the fake id is the name of the champ)
            update: championDetails,
            create: championDetails,
        });
    }
};

const matchFilterSettings = {
    gameMode: "CLASSIC",
    gameType: "MATCHED_GAME",
    queueId: {
        in: [400, 410, 420, 430, 440, 700],
    },
    gameStartTimestamp: {
        gte: new Date("2022-05-11T00:00:00Z"),
    },
};

export async function getMatchesForSummonerBySummoner(
    ctx: {
        prisma: PrismaClient<
            Prisma.PrismaClientOptions,
            never,
            Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
        >;
        lolApi: LolApi;
    },
    user: Summoner
) {
    const summoner = await ctx.prisma.summoner.findFirst({
        where: {
            puuid: user.puuid,
        },
        include: {
            matches: {
                include: {
                    MatchInfo: true,
                },
                where: {
                    MatchInfo: matchFilterSettings,
                },
            },
        },
    });

    return summoner?.matches;
}
export async function getMatchesForSummonerByMatch(ctx, user) {
    const matches = await ctx.prisma.match.findMany({
        where: {
            participants: {
                some: user,
            },
            MatchInfo: matchFilterSettings,
        },
        include: {
            MatchInfo: true,
            participants: true,
        },
    });

    return matches;
}
