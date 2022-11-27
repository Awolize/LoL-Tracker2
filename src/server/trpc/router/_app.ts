import { router } from "../trpc";
import { authRouter } from "./auth";
import { exampleRouter, riotApiRouter } from "./example";

export const appRouter = router({
  example: exampleRouter,
  riotApi: riotApiRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
