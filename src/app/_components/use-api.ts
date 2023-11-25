import { PrismaClient } from "@prisma/client";
import { RiotApi } from "twisted";
import { LolApi } from "twisted";

export function useApi() {
    const prisma = new PrismaClient();
    const lolApi = new LolApi();
    const riotApi = new RiotApi();

    return { prisma, lolApi, riotApi };
}
