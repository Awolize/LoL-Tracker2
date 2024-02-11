import type { PrismaClient, Summoner } from "@prisma/client";
import type { LolApi, RiotApi } from "twisted";
import { type Regions, regionToRegionGroup } from "twisted/dist/constants";
import type { ChampionsDataDragonDetails, MatchV5DTOs } from "twisted/dist/models-dto";

const splitUsername = (username) => {
    return {
        gameName: decodeURI(username.split("#")[0]),
        tagLine: username.split("#")[1],
    };
};

const getUserInfo = async (ctx, username, region) => {
    const { gameName, tagLine } = splitUsername(username);
    const accountInfo = (
        await (ctx.riotApi as RiotApi).Account.getByGameNameAndTagLine(gameName, tagLine, regionToRegionGroup(region))
    ).response;
    const userInfo = (await (ctx.lolApi as LolApi).Summoner.getByPUUID(accountInfo.puuid, region)).response;
    return { userInfo, accountInfo };
};

export async function getUserByNameAndRegion(
    ctx: {
        prisma: PrismaClient;
        lolApi: LolApi;
        riotApi: RiotApi;
    },
    username: string,
    region: Regions,
) {
    try {
        const user = await ctx.prisma.summoner.findFirst({
            where: {
                gameName: {
                    equals: username.split("#")[0],
                    mode: "insensitive",
                },
                tagLine: {
                    equals: username.split("#")[1],
                    mode: "insensitive",
                },
                region: region,
            },
        });

        if (user) {
            return user; // is existing user;
        }

        console.log("Could not find summoner in DB", username, region);

        const { userInfo, accountInfo } = await getUserInfo(ctx, username, region);

        // Map API response to Summoner
        const newUser: Summoner = {
            puuid: userInfo.puuid,
            summonerId: userInfo.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            region,
            username: userInfo.name,
            gameName: accountInfo.gameName ?? null,
            tagLine: accountInfo.tagLine ?? null,
            profileIconId: userInfo.profileIconId,
            summonerLevel: userInfo.summonerLevel,
            revisionDate: new Date(userInfo.revisionDate),
            accountId: userInfo.accountId,
        };

        // Use upsert to save the new user or update an existing one
        const savedUser = await ctx.prisma.summoner.upsert({
            where: {
                puuid: newUser.puuid,
            },
            update: newUser,
            create: newUser,
        });

        return savedUser;
    } catch (error) {
        console.error("error:", new Date().toLocaleString(), new Date(), username, region, error);
        throw new Error("Could not fetch summoner^", { cause: error });
    }
}

export const prepareSummonersCreation = (
    ctx: {
        prisma: PrismaClient;
        lolApi: LolApi;
    },
    game: MatchV5DTOs.MatchDto,
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
        }
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
                region: region,
                username: user.name,
                profileIconId: user.profileIconId,
                summonerLevel: user.summonerLevel,
                revisionDate: new Date(user.revisionDate),
                accountId: user.accountId,
            },
            create: {
                puuid: user.puuid,
                summonerId: user.id,
                region: region,
                username: user.name,
                profileIconId: user.profileIconId,
                summonerLevel: user.summonerLevel,
                revisionDate: new Date(user.revisionDate),
                accountId: user.accountId,
            },
        });

        return upsertedSummoner;
    });

    return summonerPromises;
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

export const updateChampionDetails = async (ctx: {
    prisma: PrismaClient;
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
        prisma: PrismaClient;
        lolApi: LolApi;
    },
    user: Summoner,
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
export async function getMatchesForSummonerByMatch(prisma: PrismaClient, user) {
    const matches = await prisma.match.findMany({
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
