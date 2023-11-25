import { PrismaClient, type Summoner } from "@prisma/client";
import PQueue from "p-queue";
import pRetry from "p-retry";
import { Constants, RiotApi } from "twisted";

const prisma = new PrismaClient();
const riotApi = new RiotApi();

const queue = new PQueue({ concurrency: 1 });

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchDataHandler(summoner: Summoner, index: number) {
    await pRetry(() => fetchData(summoner, index), {
        onFailedAttempt: async (error) => {
            console.log(`Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`);
            console.error(error.message);
            console.log("Waiting 2 seconds before trying again.");
            await sleep(1000);
        },
        retries: 50,
    });
}

async function fetchData(summoner: Summoner, index: number) {
    try {
        const newUserData = (await riotApi.Account.getByPUUID(summoner.puuid, Constants.RegionGroups.EUROPE)).response;

        console.log(index, newUserData.gameName, newUserData.tagLine);

        await prisma.summoner.update({
            where: {
                puuid: summoner.puuid,
            },
            data: {
                gameName: newUserData.gameName,
                tagLine: newUserData.tagLine,
            },
        });
    } catch (error) {
        console.error("Could not find user by PUUID", summoner.puuid);
        throw error;
    }
}

async function main() {
    const summoners = await prisma.summoner.findMany();

    console.log("summoners.length", summoners.filter((e) => !e.gameName).length);

    await Promise.all(
        summoners
            .filter((e) => !e.gameName)
            .map((summoner, index) => queue.add(() => fetchDataHandler(summoner, index))),
    );
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
