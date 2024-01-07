"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { loggerLink, splitLink, unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";

import { type AppRouter } from "~/server/api/root";
import { getProcessingUrl, getUrl } from "./shared";

export const api = createTRPCReact<AppRouter>({});

export function TRPCReactProvider(props: {
    children: React.ReactNode;
    cookies: string;
}) {
    const [queryClient] = useState(() => new QueryClient());

    const [trpcClient] = useState(() =>
        api.createClient({
            links: [
                // adds pretty logs to your console in development and logs errors in production
                loggerLink({
                    enabled: (opts) =>
                        !!process.env.NEXT_PUBLIC_DEBUG || (opts.direction === "down" && opts.result instanceof Error),
                }),
                splitLink({
                    condition: (op) => {
                        console.log("->>>>>>", op.path);

                        return !op.path.includes("processingApi");
                    },
                    true: (runtime) => {
                        console.log("using url:", getUrl());

                        return unstable_httpBatchStreamLink({
                            url: `${getUrl()}`,
                        })(runtime);
                    },
                    false: (runtime) => {
                        console.log("using url:", getProcessingUrl());

                        return unstable_httpBatchStreamLink({
                            url: `${getProcessingUrl()}`,
                        })(runtime);
                    },
                }),
            ],
            transformer: superjson,
        }),
    );

    // const [trpcClient] = useState(() =>
    //     createTRPCProxyClient<AppRouter>({
    //         transformer: superjson,
    //         links: [
    //             // create a custom ending link
    //             (runtime) => {
    //                 // initialize the different links for different targets
    //                 const servers = {
    //                     serverA: httpBatchLink({ url: "http://localhost:2021" })(runtime),
    //                     serverB: httpBatchLink({ url: "http://localhost:2022" })(runtime),
    //                 };
    //                 return (ctx) => {
    //                     const { op } = ctx;
    //                     // split the path by `.` as the first part will signify the server target name
    //                     const pathParts = op.path.split(".");

    //                     // first part of the query should be `server1` or `server2`
    //                     const serverName = pathParts.shift()! as keyof typeof servers;

    //                     // combine the rest of the parts of the paths
    //                     // -- this is what we're actually calling the target server with
    //                     const path = pathParts.join(".");
    //                     console.log(`> calling ${serverName} on path ${path}`, {
    //                         input: op.input,
    //                     });

    //                     const link = servers[serverName];

    //                     return link({
    //                         ...ctx,
    //                         op: {
    //                             ...op,
    //                             // override the target path with the prefix removed
    //                             path,
    //                         },
    //                     });
    //                 };
    //             },
    //         ],
    //     }),
    // );

    return (
        <QueryClientProvider client={queryClient}>
            <api.Provider client={trpcClient} queryClient={queryClient}>
                {props.children}
            </api.Provider>
        </QueryClientProvider>
    );
}
