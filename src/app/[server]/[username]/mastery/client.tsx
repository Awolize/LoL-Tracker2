"use client";

import { Fragment, useEffect, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon as RefreshIcon } from "@heroicons/react/20/solid";
import "react-lazy-load-image-component/src/effects/opacity.css";
import { parse } from "superjson";
import type { ChallengeV1DTO } from "twisted/dist/models-dto/challenges/challenges.dto";

import ChampionItem from "~/app/_components/ChampionItem";
import Dropdown from "~/app/_components/Dropdown";
import RoleHeader from "~/app/_components/RoleHeader";
import { SwitchWithLabel } from "~/app/_components/SwitchWithLabel";
import { ToggleEye } from "~/app/_components/ToggleEye";
import { api } from "~/trpc/react";
import type { ChallengeId } from "../../../../utils/champsUtils";
import { SortOrder, filteredOut, isChallengeId, partition, sortAlgorithm } from "../../../../utils/champsUtils";
import { type CompleteChampionInfo } from "./page";

const ROLES = ["Top", "Jungle", "Mid", "Bottom", "Support"];

export function Client(props: {
    username: string;
    server: string;
    champData: CompleteChampionInfo[];
    patch: string;
    challengeIds: string;
    playerChallengesData: string;
    challengesThresholds: string;
}) {
    const champs = props.champData;
    const championMastery = props.champData;
    const patch = props.patch;
    const challengeIds = parse<ChallengeId[]>(props.challengeIds);
    const playerChallengesData = parse<Map<ChallengeId, ChallengeV1DTO>>(props.playerChallengesData);
    const challengesThresholds = parse<Map<ChallengeId, Record<string, number>>>(props.challengesThresholds);
    const username = props.username;
    const server = props.server;

    const championsByRole: Record<string, typeof champs> = ROLES.reduce((acc, role) => {
        const champsWithRole = champs.filter((champ) => champ?.role === role || (!champ.role && role === "Bottom")); // add champs with role null to the Bottom list
        acc[role] = champsWithRole;
        return acc;
    }, {});

    const [filterPoints, setFilterPoints] = useState(0);
    const [sortOrder, setSortOrder] = useState(SortOrder.Points);
    const [showLevel, setShowLevel] = useState(false);
    const [showFinished, setShowFinished] = useState(false);
    const [showChests, setShowChests] = useState(false);
    const [hideChampionsMode, setHideChampionsMode] = useState(false);
    const markedSize: number = championMastery.filter((champ) => filteredOut(champ, filterPoints)).length ?? 0;
    const [alignHeaderRight, setAlignHeaderRight] = useState(false);

    const [hiddenChamps, setHiddenChamps] = useState(new Set<number>());

    const refreshQuery = api.riotApi.refreshSummoner.useMutation({
        onSuccess: () => {
            window.location.reload();
        },
    });

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
    }, [username]);

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

        if (!isChallengeId(challenge.challengeId)) {
            console.log('"Invalid" challenge id is trying to get rendered', challenge.challengeId);
            return null;
        }

        const challengeThresholds = challengesThresholds.get(challenge.challengeId);
        if (!challengeThresholds) return;

        const challengesWithStyles = Object.entries(challengeThresholds).map((threshold) => ({
            value: threshold[1],
            style: "text-gray-400",
        }));

        challengesWithStyles.push({ value: challenge.value, style: "text-gray-100" });
        challengesWithStyles.sort((a, b) => a.value - b.value);
        const title = challengesWithStyles.join(" ");

        return (
            <Fragment key={challenge.challengeId}>
                <div title={title}>{descriptions[index]}</div>
                <div className="flex gap-1">
                    {challengesWithStyles.map(({ value, style }) => (
                        <span key={`${value}-${style}`} className={style}>
                            {value}
                        </span>
                    ))}
                </div>
            </Fragment>
        );
    }

    return (
        <>
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
                                    { text: "Points", value: SortOrder.Points },
                                    { text: "A-Z", value: SortOrder.AZ },
                                    { text: "Level", value: SortOrder.Level },
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
                            type="button"
                            onClick={() => setAlignHeaderRight((prev) => !prev)}
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
                                {championMastery.length !==
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
                        {challengeIds.length === 3 ? (
                            <div className="grid grid-cols-2 text-xs text-gray-400">
                                {challengeIds.map((el, index) => {
                                    const challengeData = playerChallengesData.get(el);
                                    return challengeData && renderChallenge(challengeData, index);
                                })}
                            </div>
                        ) : (
                            <></>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            refreshQuery.mutate({ server, username });
                        }}
                        className="flex flex-row gap-2 items-center"
                    >
                        <RefreshIcon className="h-5 w-5 text-gray-100" aria-hidden="true" />
                        {refreshQuery.isLoading ? <>Working... </> : <>{"<- Update"}</>}
                    </button>

                    <div className="fixed top-1 right-3">
                        <span className="text-gray-400">V{patch}</span>
                    </div>
                </div>
            </header>
            <main className="flex flex-row gap-2">
                {Object.entries(championsByRole).map(([role, champions]) => {
                    const champsWithRoleHiddenExcluded = hideChampionsMode
                        ? champions
                        : champions.filter((champ) => !hiddenChamps.has(champ.championId));

                    const { pass: doneChamps, fail: todoChamps } = partition(champsWithRoleHiddenExcluded, (champ) =>
                        filteredOut(champ, filterPoints),
                    );
                    doneChamps.sort((a, b) => sortAlgorithm(sortOrder, a, b));
                    todoChamps.sort((a, b) => sortAlgorithm(sortOrder, a, b));

                    const size = champions.filter((champ) => !hiddenChamps.has(champ.championId)).length;
                    const markedSize = champions.filter((champ) => champ && filteredOut(champ, filterPoints)).length;
                    const percentage = (100 * markedSize) / size;

                    return (
                        <div className="w-full p-4" key={role}>
                            <RoleHeader
                                role={role}
                                finishedSize={markedSize}
                                hasHidden={champions.length !== size}
                                size={size}
                                percentage={percentage}
                            />
                            <ul
                                className="grid justify-between"
                                style={{ gridTemplateColumns: "repeat(auto-fill, 90px)" }}
                            >
                                {todoChamps.map((champ) => (
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
                                {doneChamps.map((champ) => (
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
            </main>
        </>
    );
}
