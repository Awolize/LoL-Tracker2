import { RiotApi } from "twisted";

import { env } from "../env/server.mjs";

declare global {
    // eslint-disable-next-line no-var
    var riotApi: RiotApi;
}

export const riotApi = global.riotApi || new RiotApi();

if (env.NODE_ENV !== "production") {
    global.riotApi = riotApi;
}
