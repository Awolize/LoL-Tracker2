import { initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";

import { prisma } from "../db";
import { lolApi } from "../lolApi";
import { riotApi } from "../riotApi";

type CreateContextOptions = Record<string, never>;

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here
 *
 * Examples of things you may need it for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createInnerTRPCContext = async (_opts: CreateContextOptions) => {
    return {
        prisma,
        lolApi,
        riotApi,
    };
};

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createTRPCContext = async (_opts: CreateNextContextOptions) => {
    return await createInnerTRPCContext({});
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create({
    transformer: superjson,
    errorFormatter({ shape }) {
        return shape;
    },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure;
