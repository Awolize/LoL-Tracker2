import { router } from "../trpc";
import { riotApiRouter } from "./riot";

export const appRouter = router({
  riotApi: riotApiRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
