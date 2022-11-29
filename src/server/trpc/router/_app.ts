import { router } from "../trpc";
import { authRouter } from "./auth";
import { riotApiRouter } from "./riot";

export const appRouter = router({
  riotApi: riotApiRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
