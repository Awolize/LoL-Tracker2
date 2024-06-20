import { differentApiRouter } from "~/server/api/routers/differentApiRouter";
import { processingApiRouter } from "~/server/api/routers/processingApiRouter";
import { riotApiRouter } from "~/server/api/routers/riot";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
	riotApi: riotApiRouter,
	differentApi: differentApiRouter,
	processingApi: processingApiRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
