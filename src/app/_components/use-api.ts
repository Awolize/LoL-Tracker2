import { prisma } from "~/server/db";
import { lolApi } from "~/server/lolApi";
import { riotApi } from "~/server/riotApi";

export function useApi() {
    return { prisma, lolApi, riotApi };
}
