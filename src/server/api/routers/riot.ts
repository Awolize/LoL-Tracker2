import { Constants } from "twisted";
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
        .input(z.object({ username: z.string(), region: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const region = regionToConstant(input.region.toUpperCase());

            console.log("[refreshSummoner] Someone pressed the update button with user", input.username, input.region);

            await updateSummoner(ctx, input.username, region);

            return true;
        }),
});
