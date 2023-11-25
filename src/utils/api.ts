/**
 * This is the client-side entrypoint for your tRPC API.
 * It's used to create the `api` object which contains the Next.js App-wrapper
 * as well as your typesafe react-query hooks.
 *
 * We also create a few inference helpers for input and output types
 */
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

import type { ProcessingRouter, AppRouter } from "../server/api/root";

const getBaseUrl = () => {
    if (typeof window !== "undefined") return ""; // browser should use relative url
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
    return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

const getProcessingUrl = () => {
    return `https://processing-lol.awot.dev`; // dev SSR should use localhost
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

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export const processingApi = createTRPCNext<ProcessingRouter>({
    config() {
        return {
            transformer: superjson,
            links: [
                loggerLink({
                    enabled: (opts) =>
                        process.env.NODE_ENV === "development" ||
                        (opts.direction === "down" && opts.result instanceof Error),
                }),
                httpBatchLink({
                    url: `${getProcessingUrl()}/api/trpc`,
                }),
            ],
        };
    },
    ssr: false,
});

export type ProcessingRouterInputs = inferRouterInputs<ProcessingRouter>;
export type ProcessingRouterOutputs = inferRouterOutputs<ProcessingRouter>;
