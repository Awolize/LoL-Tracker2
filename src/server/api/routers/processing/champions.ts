import { flattenChamp } from "../../differentHelper";

import { prisma } from "~/server/db";
import { lolApi } from "~/server/lolApi";
import { riotApi } from "~/server/riotApi";

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
