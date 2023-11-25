"use client";

import { useMemo, useState } from "react";

import type { ChampionDetails } from "@prisma/client";
import "react-lazy-load-image-component/src/effects/opacity.css";

import { DifferentChampionItem } from "~/app/_components/differentComponents/different-champion-item";
import { DifferentHeader } from "~/app/_components/differentComponents/different-header";
import { DifferentRoleHeader } from "~/app/_components/differentComponents/different-role-header";
import { DifferentSideBar } from "~/app/_components/differentComponents/different-side-bar";
import { api } from "~/trpc/react";
import { type CompleteChampionInfo } from "./page";

export default function Client({
    username,
    region,
    patch,
    champData: champs,
}: {
    username: string;
    region: string;
    champData: CompleteChampionInfo[];
    patch: string | null | undefined;
}) {
    const [selectedItem, setSelectedItem] = useState(null);

    const selectedChallenge = api.differentApi.getJackOfAllChamps.useQuery({ region, username });

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

    const completedChampsLength = selectedChallengeQuery?.data.length;

    return (
        <div className="flex h-screen w-screen justify-center">
            <aside className="z-10">
                <DifferentSideBar
                    region={region}
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

                                            return <DifferentChampionItem key={champ.key} hide={hide} champ={champ} />;
                                        })}
                                    </ul>
                                </div>
                            );
                        })}
                    </main>
                </div>
            </div>
        </div>
    );
}
