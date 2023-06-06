/* eslint-disable import/no-unresolved */
import type { NextApiRequest, NextApiResponse } from "next";

import type { AnyRouter, CombinedDataTransformer } from "@trpc/server";
import { defaultTransformer } from "@trpc/server";
import { createNextApiHandler } from "@trpc/server/adapters/next";
import type { MergeRouters } from "@trpc/server/dist/core/internals/mergeRouters.js";
import { createRouterFactory } from "@trpc/server/dist/core/router.js";
import { defaultFormatter } from "@trpc/server/dist/error/formatter.js";

import { env } from "../../../env/server.mjs";
import { appRouter, processingRouter } from "../../../server/api/root";
import { createTRPCContext } from "../../../server/api/trpc";

export function mergeWithoutOverrides<TType extends Record<string, unknown>>(
    obj1: TType,
    ...objs: Partial<TType>[]
): TType {
    const newObj: TType = Object.assign(Object.create(null), obj1);

    for (const overrides of objs) {
        for (const key in overrides) {
            if (key in newObj && newObj[key] !== overrides[key]) {
                throw new Error(`Duplicate key ${key}`);
            }
            newObj[key as keyof TType] = overrides[key] as TType[keyof TType];
        }
    }
    return newObj;
}

export function mergeRouters<TRouters extends AnyRouter[]>(...routerList: [...TRouters]): MergeRouters<TRouters> {
    const record = mergeWithoutOverrides({}, ...routerList.map((r) => r._def.record));
    const errorFormatter = routerList.reduce((currentErrorFormatter, nextRouter) => {
        if (nextRouter._def._config.errorFormatter && nextRouter._def._config.errorFormatter !== defaultFormatter) {
            if (
                currentErrorFormatter !== defaultFormatter &&
                currentErrorFormatter !== nextRouter._def._config.errorFormatter
            ) {
                throw new Error("You seem to have several error formatters");
            }
            return nextRouter._def._config.errorFormatter;
        }
        return currentErrorFormatter;
    }, defaultFormatter);

    const transformer = routerList.reduce((prev, current) => {
        if (current._def._config.transformer && current._def._config.transformer !== defaultTransformer) {
            if (prev !== defaultTransformer && prev !== current._def._config.transformer) {
                throw new Error("You seem to have several transformers");
            }
            return current._def._config.transformer;
        }
        return prev;
    }, defaultTransformer as CombinedDataTransformer);

    const router = createRouterFactory({
        errorFormatter,
        transformer,
        isDev: routerList.some((r) => r._def._config.isDev),
        allowOutsideOfServer: routerList.some((r) => r._def._config.allowOutsideOfServer),
        isServer: routerList.some((r) => r._def._config.isServer),
        $types: routerList[0]?._def._config.$types as any,
    })(record);
    return router as any;
}

// create the API handler, but don't return it yet
const nextApiHandler = createNextApiHandler({
    router: mergeRouters(appRouter, processingRouter)!,
    createContext: createTRPCContext,
    onError:
        env.NODE_ENV === "development"
            ? ({ path, error }) => {
                  console.error(`❌ tRPC failed on ${path}: ${error}`);
              }
            : undefined,
});
// @see https://nextjs.org/docs/api-routes/introduction
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // We can use the response object to enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Request-Method", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    // If you need to make authenticated CORS calls then
    // remove what is above and uncomment the below code
    // Allow-Origin has to be set to the requesting domain that you want to send the credentials back to
    // res.setHeader('Access-Control-Allow-Origin', 'http://example:6006');
    // res.setHeader('Access-Control-Request-Method', '*');
    // res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    // res.setHeader('Access-Control-Allow-Headers', 'content-type');
    // res.setHeader('Referrer-Policy', 'no-referrer');
    // res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === "OPTIONS") {
        res.writeHead(200);
        return res.end();
    }
    // finally pass the request on to the tRPC handler
    return nextApiHandler(req, res);
}
