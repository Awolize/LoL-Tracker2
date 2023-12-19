"use client";

import { useMemo, useState } from "react";

import type { ChampionDetails } from "@prisma/client";
import "react-lazy-load-image-component/src/effects/opacity.css";

import { api } from "~/trpc/react";
import { DifferentSideBar } from "~/app/_components/differentComponents/DifferentSideBar";
import { DifferentHeader } from "~/app/_components/differentComponents/DifferentHeader";
import { DifferentRoleHeader } from "~/app/_components/differentComponents/DifferentRoleHeader";
import { DifferentChampionItem } from "~/app/_components/differentComponents/DifferentChampionItem";
import { type CompleteChampionInfo } from "./page";

export default function Client({
    username,
    server,
    patch,
    champData: champs,
}: {
    username: string;
    server: string;
    champData: CompleteChampionInfo[];
    patch: string | null | undefined;
}) {
    const [selectedItem, setSelectedItem] = useState(null);

    const selectedChallenge = api.differentApi.getJackOfAllChamps.useQuery({ server, username });

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
        <div>
            <div className="flex h-screen w-screen justify-center">
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
}
