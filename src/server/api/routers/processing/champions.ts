import { type PrismaClient } from "@prisma/client";
import { type LolApi } from "twisted";
import { flattenChamp } from "../../differentHelper";

export async function updateChampionDetails(prisma: PrismaClient, lolApi: LolApi) {
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
