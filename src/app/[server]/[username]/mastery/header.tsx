"use client";

import { SwitchWithLabel } from "~/app/_components/switch-w-label";
import { processingApi } from "~/trpc/react";
import { useOptionsStore } from "./stores/options-store";
import { useUserContext } from "./stores/user-store";

export default function Header() {
    const {
        showAvailableChests,
        showLevels,
        showMasteryPoints,
        byRole,
        toggleAvailableChests,
        toggleLevels,
        toggleMasteryPoints,
        toggleSortedByRole,
    } = useOptionsStore();

    const user = useUserContext((s) => s.user);

    const updateChampions = processingApi.processingApi.updateChampions.useMutation();

    return (
        <div className="flex flex-row gap-4">
            <SwitchWithLabel label={"Mastery Points"} checked={showMasteryPoints} onChange={toggleMasteryPoints} />
            <SwitchWithLabel
                label={"Available Chests"}
                checked={showAvailableChests}
                onChange={toggleAvailableChests}
            />
            <SwitchWithLabel label={"Levels"} checked={showLevels} onChange={toggleLevels} />
            <SwitchWithLabel label={"By role"} checked={byRole} onChange={toggleSortedByRole} />
            <SwitchWithLabel
                label={"Update"}
                checked={false}
                onChange={async () => {
                    console.log("UPDATE USER");
                    if (user.gameName && user.tagLine) {
                        updateChampions.mutate({
                            gameName: user.gameName,
                            tagLine: user.tagLine,
                            region: user.server,
                        });
                    }
                }}
            />
        </div>
    );
}
