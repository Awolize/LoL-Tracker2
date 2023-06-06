/**
 * This is the client-side entrypoint for your tRPC API.
 * It's used to create the `api` object which contains the Next.js App-wrapper
 * as well as your typesafe react-query hooks.
 *
 * We also create a few inference helpers for input and output types
 */
import { httpBatchLink, httpLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

import { type AppRouter } from "../server/api/root";

const getBaseUrl = () => {
    return `https://processing-lol.awot.dev`; // dev SSR should use localhost
    if (typeof window !== "undefined") return ""; // browser should use relative url
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
    return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

/**
 * A set of typesafe react-query hooks for your tRPC API
 */
export const api = createTRPCNext<AppRouter>({
    config() {
        return {
            /**
             * Transformer used for data de-serialization from the server
             * @see https://trpc.io/docs/data-transformers
             **/
            transformer: superjson,

            /**
             * Links used to determine request flow from client to server
             * @see https://trpc.io/docs/links
             * */
            links: [
                loggerLink({
                    enabled: (opts) =>
                        process.env.NODE_ENV === "development" ||
                        (opts.direction === "down" && opts.result instanceof Error),
                }),
                httpBatchLink({
                    url: `${getBaseUrl()}/api/trpc`,
                }),
            ],
        };
    },
    /**
     * Whether tRPC should await queries when server rendering pages
     * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
     */
    ssr: false,
});

/**
 * Inference helper for inputs
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;
/**
 * Inference helper for outputs
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export const client = createTRPCNext<AppRouter>({
    config() {
        return {
            transformer: superjson,
            links: [
                // create a custom ending link
                (runtime) => {
                    // initialize the different links for different targets
                    const servers = {
                        riotApi: httpLink({ url: `${getBaseUrl()}/api/trpc` })(runtime),
                        differentApi: httpLink({ url: `https://processing-lol.awot.dev/api/trpc` })(runtime),
                    };
                    return (ctx) => {
                        const { op } = ctx;
                        // split the path by `.` as the first part will signify the server target name
                        const pathParts = op.path.split(".");

                        // first part of the query should be `server1` or `server2`
                        const serverName = pathParts.shift() as string as keyof typeof servers;

                        // combine the rest of the parts of the paths
                        // -- this is what we're actually calling the target server with
                        const path = pathParts.join(".");
                        console.log(`calling ${serverName} on path ${path}`, {
                            input: op.input,
                        });

                        const link = servers[serverName];

                        return link({
                            ...ctx,
                            op: {
                                ...op,
                                // override the target path with the prefix removed
                                path,
                            },
                        });
                    };
                },
            ],
        };
    },
});
