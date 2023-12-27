"use client";

import { SwitchWithLabel } from "~/app/_components/switch-w-label";
import { useOptionsStore } from "./options-store";

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
        </div>
    );
}
