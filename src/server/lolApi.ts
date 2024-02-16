import { LolApi } from "twisted";
import { env } from "~/env";

const globalForLolApi = globalThis as unknown as {
    lolApi: LolApi | undefined;
};

export const lolApi = globalForLolApi.lolApi ?? new LolApi();

if (env.NODE_ENV !== "production") {
    globalForLolApi.lolApi = lolApi;
}
