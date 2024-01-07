import "server-only";

import { TRPCClientError, createTRPCProxyClient, loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import { callProcedure } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { type TRPCErrorResponse } from "@trpc/server/rpc";
import { cookies } from "next/headers";
import { cache } from "react";

import { appRouter, type AppRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { getProcessingUrl, getUrl, transformer } from "./shared";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(() => {
    return createTRPCContext({
        headers: new Headers({
            cookie: cookies().toString(),
            "x-trpc-source": "rsc",
        }),
    });
});

export const api = createTRPCProxyClient<AppRouter>({
    transformer,
    links: [
        loggerLink({
            enabled: (op) =>
                process.env.NODE_ENV === "development" || (op.direction === "down" && op.result instanceof Error),
        }),
        /**
         * Custom RSC link that lets us invoke procedures without using http requests. Since Server
         * Components always run on the server, we can just call the procedure as a function.
         */
        (runtime) => {
            const servers = {
                serverA: unstable_httpBatchStreamLink({ url: getUrl() })(runtime),
                serverB: unstable_httpBatchStreamLink({ url: getProcessingUrl() })(runtime),
            };

            return ({ op }) => {
                console.log("op.path", op.path);

                // split the path by `.` as the first part will signify the server target name
                const pathParts = op.path.split(".");

                // first part of the query should be `server1` or `server2`
                // biome-ignore lint/style/noNonNullAssertion: <explanation>
                const serverName = pathParts.shift()! as keyof typeof servers;

                const path = pathParts.join(".");
                console.log(`> calling ${serverName} on path ${path}`, {
                    input: op.input,
                });

                return observable((observer) => {
                    createContext()
                        .then((ctx) => {
                            console.log("heee", path);

                            return callProcedure({
                                procedures: appRouter._def.procedures,
                                path: path,
                                rawInput: op.input,
                                ctx,
                                type: op.type,
                            });
                        })
                        .then((data) => {
                            observer.next({ result: { data } });
                            observer.complete();
                        })
                        .catch((cause: TRPCErrorResponse) => {
                            observer.error(TRPCClientError.from(cause));
                        });
                });
            };
        },
    ],
});
