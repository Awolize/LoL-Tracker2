import { useMemo, useState } from "react";

import type { InferGetServerSidePropsType, NextPage } from "next";
import Head from "next/head";

import type { ChampionDetails } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import "react-lazy-load-image-component/src/effects/opacity.css";
import { LolApi, RiotApi } from "twisted";
import type { ChampionMasteryDTO, ChampionsDataDragonDetails } from "twisted/dist/models-dto";
import { z } from "zod";

import { DifferentChampionItem } from "../../../differentComponents/DifferentChampionItem";
import { DifferentHeader } from "../../../differentComponents/DifferentHeader";
import { DifferentRoleHeader } from "../../../differentComponents/DifferentRoleHeader";
import { DifferentSideBar } from "../../../differentComponents/DifferentSideBar";
import { getUserByNameAndServer } from "../../../server/api/differentHelper";
import { api } from "../../../utils/api";
import { regionToConstant } from "../../../utils/champsUtils";

import rolesJson from "./roles.json";

interface Roles {
    role: string;
}

export type CompleteChampionInfo = ChampionMasteryDTO & ChampionsDataDragonDetails & Roles;

const Different: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (props) => {
    const { username, server, patch, champData: champs } = props;
    const [selectedItem, setSelectedItem] = useState(null);

    const selectedChallenge = api.differentApi.getJackOfAllChamps.useQuery({ server, username });
    // const selectedChallenge2 = api.differentApi.getJackOfAllChamps2.useQuery({ server, username });
    // const selectedChallenge3 = api.differentApi.getJackOfAllChamps3.useQuery({ server, username });

    const selectedChallengeQuery = useMemo(() => {
        console.log("selected challenge", selectedItem);

        const challengeDataMap = {
            401106: selectedChallenge?.data ?? [],
        };

        const mappedData: ChampionDetails[] = selectedItem ? challengeDataMap[selectedItem] : [];
        const mappedCases = Object.keys(challengeDataMap)
            .map(Number)
            .filter((key) => challengeDataMap[key] !== null);

        return {
            data: mappedData,
            cases: mappedCases,
        };
    }, [selectedItem, selectedChallenge]);

    const title = `LoL Mastery Tracker for ${props.username} on ${props.server}.`;

    const completedChampsLength = selectedChallengeQuery?.data.length;

    return (
        <div className="flex h-screen w-screen">
            <Head>
                <title>{title}</title>
                <meta property="og:title" content="LoL Mastery Tracker, brought to you by me!" key="title" />
                <meta
                    property="og:description"
                    name="description"
                    content="Generated using Riot API. Repo can be found using https://github.com/Awolize. Boilerplate was generated using https://create.t3.gg/"
                />
                <meta property="og:image" content="https://lol.awot.dev/favicon.png" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="h-screen w-screen flex">
                <aside className="z-10">
                    <DifferentSideBar
                        server={server}
                        username={username}
                        selectedItem={selectedItem}
                        setSelectedItem={setSelectedItem}
                        mappedCases={selectedChallengeQuery.cases}
                    />
                </aside>

                <div className="flex flex-1 flex-col">
                    <header className="h-24">
                        <DifferentHeader finished={completedChampsLength} total={champs.length} patch={patch} />
                    </header>

                    <div className="flex-1 overflow-y-auto border-t-2 border-gray-800">
                        <main className="flex-grow overflow-y-auto flex flex-row gap-2 ">
                            {["Top", "Jungle", "Mid", "Bottom", "Support"].map((role) => {
                                if (!champs[0]) return;

                                const champsWithRole = champs.filter((champ) => champ?.role === role);

                                return (
                                    <div className="w-full px-4" key={role}>
                                        <DifferentRoleHeader role={role} />
                                        <ul
                                            className="grid justify-between"
                                            style={{ gridTemplateColumns: "repeat(auto-fill, 90px)" }}
                                        >
                                            {champsWithRole?.map((champ) => {
                                                const jacks = selectedChallengeQuery?.data.map((el) => el.key) ?? [];
                                                const hide = jacks.includes(champ.key);

                                                return (
                                                    <DifferentChampionItem key={champ.key} hide={hide} champ={champ} />
                                                );
                                            })}
                                        </ul>
                                    </div>
                                );
                            })}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};

const paramsSchema = z.object({
    server: z.string(),
    username: z.string(),
});

export const getServerSideProps = async (context) => {
    const { res, params } = context;
    res.setHeader("Cache-Control", "public, s-maxage=50, stale-while-revalidate=59");
    const { server, username: parsedUsername } = paramsSchema.parse(params);
    const username = parsedUsername.replace("-", "#");

    const region = regionToConstant(server.toUpperCase());

    const prisma = new PrismaClient();
    const lolApi = new LolApi();
    const riotApi = new RiotApi();

    const user = await getUserByNameAndServer({ prisma, lolApi, riotApi }, username, region);

    const championsDD = await prisma.championDetails.findMany();

    const completeChampsData = championsDD
        .map((champion) => {
            const role = rolesJson[champion.key] ?? "Bottom";

            return {
                ...champion,
                role: role,
                name: champion.name === "Nunu & Willump" ? "Nunu" : champion.name,
                image: {
                    full: champion.full,
                    sprite: champion.sprite,
                    group: champion.group,
                    x: champion.x,
                    y: champion.y,
                    w: champion.w,
                    h: champion.h,
                },
            };
        })
        .filter(Boolean);

    return {
        props: {
            username,
            server,
            champData: completeChampsData,
            patch: championsDD[0]?.version,
        },
    };
};

export default Different;
