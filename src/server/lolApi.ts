import { env } from "../env/server.mjs";
import { LolApi } from "twisted";

declare global {
    // eslint-disable-next-line no-var
    var lolApi: LolApi;
}

export const lolApi = global.lolApi || new LolApi();

if (env.NODE_ENV !== "production") {
    global.lolApi = lolApi;
}
