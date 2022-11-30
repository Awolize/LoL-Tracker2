import { z } from "zod";

import { router, publicProcedure } from "../trpc";
import { Constants } from "twisted";
import api from "../../common/LolApi";

export const riotApiRouter = router({
  getUserByName: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      try {
        const response = await api.Summoner.getByName(
          input.username,
          Constants.Regions.EU_WEST
        );

        return response.response;
      } catch (error) {
        console.log(error);
      }
    }),

  getMasteryPointsById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const response = await api.Champion.masteryBySummoner(
        input.id,
        Constants.Regions.EU_WEST
      );

      return response.response;
    }),

  getChampion: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const response = await api.DataDragon.getChampion(input.id);

        return response.image;
      } catch (error) {
        console.log(error);
      }
    }),

  getChampions: publicProcedure.query(async () => {
    try {
      const response = await api.DataDragon.getChampion();

      return response.data;
    } catch (error) {
      console.log(error);
    }
  }),
});
