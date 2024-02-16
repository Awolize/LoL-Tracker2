"use client";

import { SwitchWithLabel } from "~/app/[region]/[username]/mastery/components/switch-with-label";
import LoadingComponent from "~/app/_components/loading-spinner";
import { ToggleEye } from "~/app/_components/toggle-eye";
import { useMatchHistoryStore } from "~/components/stores/match-history-store";
import { useOptionsPersistentContext } from "~/components/stores/options-persistent-store";
import { useUserContext } from "~/components/stores/user-store";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { Choice, Dropdown } from "./dropdown";
import { ScaleSlider } from "./scale-slider";

export enum SortOrder2 {
    Points = 0,
    AZ = 1,
    Level = 2,
}

export default function Header() {
    const {
        showAvailableChests,
        showLevels,
        showMasteryPoints,
        byRole,
        filterPoints,
        sortOrder,
        showSelectedChampions,
        setSortOrder,
        setFilterPoints,
        toggleAvailableChests,
        toggleLevels,
        toggleMasteryPoints,
        toggleSortedByRole,
        toggleShowSelectedChampions,
    } = useOptionsPersistentContext((state) => state);
    const toggleShowMatchHistory = useMatchHistoryStore((state) => state.toggleShowMatchHistory);

    const user = useUserContext((s) => s.user);

    const utils = api.useUtils();
    const updateChampions = api.processingApi.updateChampions.useMutation({
        onSuccess() {
            utils.invalidate();
        },
    });

    const updateUser = async () => {
        if (user.gameName && user.tagLine) {
            updateChampions.mutate({
                gameName: user.gameName,
                tagLine: user.tagLine,
                region: user.region,
            });
        }
    };

    const filteredChoices: Choice[] = [
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
    ];

    const sortOrderChoices: Choice[] = [
        { text: "Points", value: SortOrder2.Points },
        { text: "A-Z", value: SortOrder2.AZ },
        { text: "Level", value: SortOrder2.Level },
    ];

    return (
        <div className="flex flex-row gap-4 px-4 py-2 items-center">
            <SwitchWithLabel label={"Mastery Points"} checked={showMasteryPoints} onChange={toggleMasteryPoints} />
            <SwitchWithLabel
                label={"Available Chests"}
                checked={showAvailableChests}
                onChange={toggleAvailableChests}
            />
            <SwitchWithLabel label={"Levels"} checked={showLevels} onChange={toggleLevels} />
            <SwitchWithLabel label={"By role"} checked={byRole} onChange={toggleSortedByRole} />
            <Dropdown
                callback={(choice) => setFilterPoints(choice)}
                menuLabel="Filter by"
                // biome-ignore lint/style/noNonNullAssertion: This will always find a match
                choice={filteredChoices.find((el) => el.value === filterPoints)!}
                choices={filteredChoices}
            />
            <Dropdown
                choices={sortOrderChoices}
                menuLabel="Sort by"
                // biome-ignore lint/style/noNonNullAssertion: This will always find a match
                choice={sortOrderChoices.find((el) => el.value === sortOrder)!}
                callback={(value) => setSortOrder(value)}
            />
            <Button size={"sm"} variant="secondary" className="w-32" onClick={toggleShowMatchHistory}>
                Match history
            </Button>
            <Button
                variant="secondary"
                size={"sm"}
                className={`${
                    !updateChampions.isLoading
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                        : "bg-gradient-to-r from-purple-500 to-indigo-500 w-16"
                } relative inline-flex my-2 py-1 px-3 items-center justify-center rounded w-24`}
                onClick={updateUser}
            >
                {updateChampions.isLoading ? <LoadingComponent /> : "Update"}
            </Button>
            <ToggleEye
                label="Hide selected champions"
                checked={!showSelectedChampions}
                onChange={toggleShowSelectedChampions}
            />
            <ScaleSlider />
        </div>
    );
}
