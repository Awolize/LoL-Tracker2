import React, { useState } from "react";

import type { NextPage, InferGetServerSidePropsType } from "next";
import Head from "next/head";

import "react-lazy-load-image-component/src/effects/opacity.css";
import { LolApi } from "twisted";
import type { ChampionMasteryDTO, ChampionsDataDragonDetails } from "twisted/dist/models-dto";
import { z } from "zod";

import { DifferentChampionItem } from "../../../differentComponents/DifferentChampionItem";
import { DifferentHeader } from "../../../differentComponents/DifferentHeader";
import { DifferentRoleHeader } from "../../../differentComponents/DifferentRoleHeader";
import { DifferentSideBar } from "../../../differentComponents/DifferentSideBar";
import { api } from "../../../utils/api";
import {
    getChallengesData,
    getChallengesThresholds,
    masteryBySummoner,
    regionToConstant,
} from "../../../utils/champsUtils";

import rolesJson from "./roles.json";

interface Roles {
    role: string;
}

export type CompleteChampionInfo = ChampionMasteryDTO & ChampionsDataDragonDetails & Roles;

const Different: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (props) => {
    const challenges = props.challenges;
    const challengesThresholds = props.challengesThresholds;

    const { username, server, patch, champData: champs } = props;

    const [selectedItem, setSelectedItem] = useState(null);

    return (
        <div className="flex h-screen w-screen">
            <Head>
                <title>
                    LoL Mastery Tracker for {props.username} on {props.server}.
                </title>
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
                <aside>
                    <DifferentSideBar
                        server={server}
                        username={username}
                        selectedItem={selectedItem}
                        setSelectedItem={setSelectedItem}
                    />
                </aside>

                <div className="flex flex-1 flex-col">
                    <header className="h-24">
                        <DifferentHeader finished={100} total={champs.length} patch={patch} />
                    </header>

                    <div className="flex-1  overflow-y-auto border-t-2 border-gray-800">
                        <main className="flex-grow overflow-y-auto flex flex-row p-7 gap-2 ">
                            {["Top", "Jungle", "Mid", "Bottom", "Support"].map((role) => {
                                if (!champs[0]) return;

                                const champsWithRole = champs.filter((champ) => champ?.role === role);

                                return (
                                    <div className="w-full p-4" key={role}>
                                        <DifferentRoleHeader role={role} />
                                        <ul
                                            className="grid justify-between"
                                            style={{ gridTemplateColumns: "repeat(auto-fill, 90px)" }}
                                        >
                                            {champsWithRole?.map((champ) => (
                                                <DifferentChampionItem key={`${champ.championId}-todo`} champ={champ} />
                                            ))}
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
    const { server, username } = paramsSchema.parse(params);
    const region = regionToConstant(server.toUpperCase());
    const api = new LolApi();

    const { response: user } = await api.Summoner.getByName(username, region);

    const [{ completeChampsData, patch }, playerChallenges, challengesThresholds] = await Promise.all([
        masteryBySummoner(api, region, user).then(async (championMasteries) => {
            const championsDD = await api.DataDragon.getChampion();
            return {
                completeChampsData: Object.keys(championsDD.data)
                    .map((champName) => {
                        const element: ChampionsDataDragonDetails = championsDD.data[champName]!;
                        const role = rolesJson[champName as keyof typeof championsDD.data] ?? "Unknown";

                        const personalChampData = championMasteries!
                            .filter((champ) => champ.championId.toString() == element.key)
                            .at(0);

                        if (personalChampData) {
                            return {
                                image: element.image,
                                id: element.id,
                                key: element.key,
                                ...personalChampData,
                                championPoints: personalChampData?.championPoints ?? 0,
                                championLevel: personalChampData?.championLevel ?? 0,
                                role: role,
                                name: element.name === "Nunu & Willump" ? "Nunu" : element.name,
                            } as CompleteChampionInfo;
                        } else {
                            return {
                                ...element,
                                championPoints: 0,
                                championLevel: 0,
                                championId: parseInt(element.key, 10),
                                role,
                            } as CompleteChampionInfo;
                        }
                    })
                    .filter(Boolean),
                patch: championsDD.version,
            };
        }),
        getChallengesData(api, region, user),
        getChallengesThresholds(api, region),
    ]);

    // const apiChampsData = await getChampionsAndMastery(username);

    return {
        props: {
            username,
            server,
            champData: completeChampsData,
            challenges: playerChallenges,
            challengesThresholds: challengesThresholds,
            patch,
        },
    };
};

export default Different;
