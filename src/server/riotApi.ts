import { RiotApi } from "twisted";
import { env } from "~/env";

const globalForRiotApi = globalThis as unknown as {
	riotApi: RiotApi | undefined;
};

export const riotApi = globalForRiotApi.riotApi ?? new RiotApi();

if (env.NODE_ENV !== "production") {
	globalForRiotApi.riotApi = riotApi;
}
