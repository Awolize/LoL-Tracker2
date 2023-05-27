import { Constants } from "twisted";
import type { Regions } from "twisted/dist/constants";
import { z } from "zod";

import { regionToConstant } from "../../../utils/champsUtils";
import { updateSummoner } from "../../../utils/champsUtilsTRPC";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const riotApiRouter = createTRPCRouter({
    getUserByName: publicProcedure.input(z.object({ username: z.string() })).query(async ({ input, ctx }) => {
        try {
            const response = await ctx.lolApi.Summoner.getByName(input.username, Constants.Regions.EU_WEST);

            return response.response;
        } catch (error) {
            console.log(error);
        }
    }),

    refreshSummoner: publicProcedure
        .input(z.object({ username: z.string(), server: z.string() }))
        .query(async ({ input, ctx }) => {
            const region = regionToConstant(input.server.toUpperCase());

            await updateSummoner(ctx.prisma, ctx.lolApi, input.username, region);

            return true;
        }),
});
