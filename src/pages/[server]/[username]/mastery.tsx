import React, { useEffect, useState } from "react";

import type { NextPage, InferGetServerSidePropsType } from "next";
import Head from "next/head";

import { ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon as RefreshIcon } from "@heroicons/react/20/solid";
import { PrismaClient } from "@prisma/client";
import "react-lazy-load-image-component/src/effects/opacity.css";
import { LolApi, RiotApi } from "twisted";
import type { ChampionMasteryDTO, ChampionsDataDragonDetails } from "twisted/dist/models-dto";
import type { ChallengeV1DTO } from "twisted/dist/models-dto/challenges/challenges.dto";
import { z } from "zod";

import ChampionItem from "../../../components/ChampionItem";
import Dropdown from "../../../components/Dropdown";
import RoleHeader from "../../../components/RoleHeader";
import { SwitchWithLabel } from "../../../components/SwitchWithLabel";
import { ToggleEye } from "../../../components/ToggleEye";
import { getUserByNameAndServer } from "../../../server/api/differentHelper";
import { api } from "../../../utils/api";
import {
    filteredOut,
    getChallengesData,
    getChallengesThresholds,
    masteryBySummoner,
    partition,
    regionToConstant,
    sortAlgorithm,
} from "../../../utils/champsUtils";

import rolesJson from "./roles.json";

interface Roles {
    role: string;
}

export type CompleteChampionInfo = ChampionMasteryDTO & ChampionsDataDragonDetails & Roles;

const Mastery: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (props) => {
    const champs = props.champData;
    const championMastery = props.champData;
    const patch = props.patch;
    const challenges = props.challenges;
    const challengesThresholds = props.challengesThresholds;
    const username = props.username;
    const server = props.server;

    const [filterPoints, setFilterPoints] = useState(0);
    const [sortOrder, setSortOrder] = useState(0);
    const [showLevel, setShowLevel] = useState(false);
    const [showFinished, setShowFinished] = useState(false);
    const [showChests, setShowChests] = useState(false);
    const [hideChampionsMode, setHideChampionsMode] = useState(false);
    const markedSize: number = championMastery.filter((champ) => filteredOut(champ, filterPoints)).length ?? 0;
    const [alignHeaderRight, setAlignHeaderRight] = useState(false);

    const [hiddenChamps, setHiddenChamps] = useState(new Set<number>());

    const refreshQuery = api.riotApi.refreshSummoner.useQuery({ server, username }, { enabled: false });

    useEffect(() => {
        // Check if the hiddenChamps item is present in local storage
        const hiddenChampsString = localStorage.getItem("hiddenChamps");

        if (hiddenChampsString) {
            let savedHiddenChamps = JSON.parse(hiddenChampsString);

            // Check if the saved data is an array (old format)
            if (Array.isArray(savedHiddenChamps)) {
                // Migrate the old format to the new object structure
                savedHiddenChamps = {
                    [username]: savedHiddenChamps,
                };

                // Save the migrated data back to local storage
                localStorage.setItem("hiddenChamps", JSON.stringify(savedHiddenChamps));
            }

            // Check if the saved data contains hidden champs for the current username
            if (savedHiddenChamps[username]) {
                // If present, set the hiddenChamps state to the value stored in local storage
                setHiddenChamps(new Set(savedHiddenChamps[username]));
            } else {
                // If not present, create an empty entry for the current username
                savedHiddenChamps[username] = [];
                localStorage.setItem("hiddenChamps", JSON.stringify(savedHiddenChamps));
            }
        } else {
            // If hiddenChamps data doesn't exist in local storage, create it with an empty entry for the current username
            const hiddenChampsData = {
                [username]: [],
            };
            localStorage.setItem("hiddenChamps", JSON.stringify(hiddenChampsData));
        }
    }, []);

    const handleChampionClick = (championId: number) => {
        if (hideChampionsMode === true) {
            // Create a copy of the current hidden champs set
            const updatedHiddenChamps = new Set(hiddenChamps);

            if (updatedHiddenChamps.has(championId)) {
                updatedHiddenChamps.delete(championId);
            } else {
                updatedHiddenChamps.add(championId);
            }

            setHiddenChamps(updatedHiddenChamps);

            let hiddenChampsString = localStorage.getItem("hiddenChamps");
            if (!hiddenChampsString) {
                hiddenChampsString = JSON.stringify({
                    [username]: [],
                });
            }
            const savedHiddenChamps = JSON.parse(hiddenChampsString);

            // Update the hidden champs data with the new value for the current username
            savedHiddenChamps[username] = [...updatedHiddenChamps];

            // Save the updated hidden champs data back to local storage
            localStorage.setItem("hiddenChamps", JSON.stringify(savedHiddenChamps));
        }
    };

    function renderChallenge(challenge: ChallengeV1DTO, index: number) {
        const descriptions = ["Win a game without dying", "Earn an S+ grade", "Win a game"];

        const values = Object.entries(challengesThresholds[index]!).map((threshold) => ({
            value: threshold[1],
            style: "text-gray-400",
        }));
        values.push({ value: challenge.value, style: "text-gray-100" });
        values.sort((a, b) => a.value - b.value);
        const title = values.join(" ");

        return (
            <>
                <div title={title}>{descriptions[index]}</div>
                <div className="flex gap-1">
                    {values.map((v) => (
                        <span key={`${v.value}-${v.style}`} className={v.style}>
                            {v.value}
                        </span>
                    ))}
                </div>
            </>
        );
    }

    const title = `LoL Mastery Tracker for ${props.username} on ${props.server}.`;
    return (
        <div>
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

            <header className="relative mt-2 flex flex-row gap-8 z-50 px-5">
                <div
                    className={`w-full min-w-fit flex items-center justify-start gap-4 ${
                        alignHeaderRight ? "flex-row-reverse" : "flex-row"
                    }`}
                >
                    <div className="w-32">
                        <Dropdown
                            callback={setFilterPoints}
                            saveName="points"
                            choices={[
                                {
                                    text: "All",
                                    value: Number.MAX_SAFE_INTEGER,
                                },
                                { text: "100", value: 100 },
                                { text: "500", value: 500 },
                                { text: "1,000", value: 1000 },
                                { text: "5,000", value: 5000 },
                                { text: "10,000", value: 10000 },
                                { text: "21,600", value: 21600 },
                                { text: "50,000", value: 50000 },
                                { text: "100,000", value: 100000 },
                            ]}
                        />
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <div className="w-32">
                            <Dropdown
                                callback={setSortOrder}
                                saveName="sortOrder"
                                choices={[
                                    { text: "Points", value: 0 },
                                    { text: "A-Z", value: 1 },
                                    { text: "Level", value: 2 },
                                ]}
                            />
                        </div>
                    </div>

                    <SwitchWithLabel label="Show Levels" checked={showLevel} onChange={setShowLevel} />

                    <SwitchWithLabel label="Show finished" checked={showFinished} onChange={setShowFinished} />

                    <SwitchWithLabel label="Show chests" checked={showChests} onChange={setShowChests} />

                    <ToggleEye label="Custom visibility" checked={hideChampionsMode} onChange={setHideChampionsMode} />

                    <div className="flex pr-4">
                        <button
                            onClick={() => setAlignHeaderRight((prev) => !prev)}
                            accessKey="s"
                            aria-label="change side"
                        >
                            <span className="absolute inset-y-0 flex items-center pr-2">
                                {alignHeaderRight ? (
                                    <ChevronLeftIcon className="h-5 w-5 text-gray-100" aria-hidden="true" />
                                ) : (
                                    <ChevronRightIcon className="h-5 w-5 text-gray-100" aria-hidden="true" />
                                )}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="w-80 min-w-fit">
                    <div className="rounded-xl bg-gradient-to-r from-green-500 via-sky-500 to-purple-500 p-[3px]">
                        <div className="flex h-full flex-col justify-between rounded-lg bg-black px-4 py-2 text-center text-white ">
                            <p className="text-2xl">
                                {markedSize} /{" "}
                                {championMastery.filter((champ) => !hiddenChamps.has(champ.championId))?.length}
                                {championMastery.length !=
                                championMastery.filter((champ) => !hiddenChamps.has(champ.championId))?.length
                                    ? "*"
                                    : ""}
                            </p>
                            <p className="text-sm">
                                {(
                                    (100 * markedSize) /
                                    championMastery.filter((champ) => !hiddenChamps.has(champ.championId))?.length
                                ).toFixed(2)}{" "}
                                %
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex w-full min-w-fit justify-between">
                    <div className="flex flex-col gap-0">
                        <div className="text-md">Different champions</div>
                        {challenges.length == 3 ? (
                            <div className="grid grid-cols-2 text-xs text-gray-400">
                                {challenges.map((el, index) => renderChallenge(el, index))}
                            </div>
                        ) : (
                            <></>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            refreshQuery.refetch();
                        }}
                        className="flex flex-row gap-2 items-center"
                    >
                        <RefreshIcon className="h-5 w-5 text-gray-100" aria-hidden="true" />
                        {refreshQuery.isFetching ? (
                            <>Working... </>
                        ) : refreshQuery.dataUpdatedAt !== 0 ? (
                            <>
                                {new Date(refreshQuery.dataUpdatedAt).toLocaleTimeString()} {window.location.reload()}
                            </>
                        ) : (
                            <>{"<- Update"}</>
                        )}
                    </button>

                    <div className="fixed top-1 right-3">
                        <span className="text-gray-400">V{patch}</span>
                    </div>
                </div>
            </header>
            <main>
                <div className="flex flex-row gap-2">
                    {["Top", "Jungle", "Mid", "Bottom", "Support"].map((role) => {
                        if (!champs[0]) return;

                        const champsWithRole = champs.filter((champ) => champ?.role === role);

                        const champsWithRoleHiddenExcluded = hideChampionsMode
                            ? champsWithRole
                            : champsWithRole.filter((champ) => !hiddenChamps.has(champ.championId));

                        const [doneChamps, todoChamps] = partition(champsWithRoleHiddenExcluded, (champ) =>
                            filteredOut(champ, filterPoints)
                        );
                        doneChamps?.sort((a, b) => sortAlgorithm(sortOrder, a, b));
                        todoChamps?.sort((a, b) => sortAlgorithm(sortOrder, a, b));

                        const size = champsWithRole.filter((champ) => !hiddenChamps.has(champ.championId)).length;
                        const markedSize = champsWithRole.filter(
                            (champ) => champ && filteredOut(champ, filterPoints)
                        ).length;
                        const percentage = (100 * markedSize) / size;

                        return (
                            <div className="w-full p-4" key={role}>
                                <RoleHeader
                                    role={role}
                                    finishedSize={markedSize}
                                    hasHidden={champsWithRole.length !== size}
                                    size={size}
                                    percentage={percentage}
                                />
                                <ul
                                    className="grid justify-between"
                                    style={{ gridTemplateColumns: "repeat(auto-fill, 90px)" }}
                                >
                                    {todoChamps?.map((champ) => (
                                        <ChampionItem
                                            key={`${champ.championId}-todo`}
                                            champ={champ}
                                            handleChampionClick={handleChampionClick}
                                            filterPoints={filterPoints}
                                            showFinished={showFinished}
                                            showChest={showChests}
                                            showLevel={showLevel}
                                            hiddenChamps={hiddenChamps}
                                        />
                                    ))}
                                    {doneChamps?.map((champ) => (
                                        <ChampionItem
                                            key={`${champ.championId}-done`}
                                            champ={champ}
                                            handleChampionClick={handleChampionClick}
                                            filterPoints={filterPoints}
                                            showFinished={showFinished}
                                            showChest={showChests}
                                            showLevel={showLevel}
                                            hiddenChamps={hiddenChamps}
                                        />
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </main>
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

    const [{ completeChampsData, patch }, playerChallenges, challengesThresholds] = await Promise.all([
        masteryBySummoner(lolApi, region, user).then(async (championMasteries) => {
            const championsDD = await lolApi.DataDragon.getChampion();
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
        getChallengesData(lolApi, region, user),
        getChallengesThresholds(lolApi, region),
    ]);

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

export default Mastery;
