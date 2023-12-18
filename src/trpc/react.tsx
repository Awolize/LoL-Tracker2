"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";

import { type ProcessingRouter, type AppRouter } from "~/server/api/root";
import { getProcessingUrl, getUrl, transformer } from "./shared";

export const api = createTRPCReact<AppRouter>();
export const processingApi = createTRPCReact<ProcessingRouter>();

export function TRPCReactProvider(props: {
	children: React.ReactNode;
	cookies: string;
}) {
	const [queryClient] = useState(() => new QueryClient());

	const [trpcClient] = useState(() =>
		api.createClient({
			transformer,
			links: [
				loggerLink({
					enabled: (op) =>
						process.env.NODE_ENV === "development" || (op.direction === "down" && op.result instanceof Error),
				}),
				unstable_httpBatchStreamLink({
					url: getUrl(),
					headers() {
						return {
							cookie: props.cookies,
							"x-trpc-source": "react",
						};
					},
				}),
			],
		}),
	);

	const [trpcProcessorClient] = useState(() =>
		processingApi.createClient({
			transformer,
			links: [
				loggerLink({
					enabled: (op) =>
						process.env.NODE_ENV === "development" || (op.direction === "down" && op.result instanceof Error),
				}),
				unstable_httpBatchStreamLink({
					url: getProcessingUrl(),
					headers() {
						return {
							cookie: props.cookies,
							"x-trpc-source": "react",
						};
					},
				}),
			],
		}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<api.Provider client={trpcClient} queryClient={queryClient}>
				<processingApi.Provider client={trpcProcessorClient} queryClient={queryClient}>
					{props.children}
				</processingApi.Provider>
			</api.Provider>
		</QueryClientProvider>
	);
}
