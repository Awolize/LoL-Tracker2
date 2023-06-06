import { differentApiRouter } from "./routers/differentApiRouter";
import { processingApiRouter } from "./routers/processingApiRouter";
import { riotApiRouter } from "./routers/riot";
import { createTRPCRouter } from "./trpc";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
    riotApi: riotApiRouter,
    differentApi: differentApiRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const processingRouter = createTRPCRouter({
    processingApi: processingApiRouter,
});

export type ProcessingRouter = typeof processingRouter;
