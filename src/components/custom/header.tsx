"use client";

import { SwitchWithLabel } from "~/components/custom/switch-with-label";
import LoadingComponent from "~/components/old/loading-spinner";
import { ToggleEye } from "~/components/old/toggle-eye";
import { useMatchHistoryStore } from "~/components/stores/match-history-store";
import { useOptionsPersistentContext } from "~/components/stores/options-persistent-store";
import { useUserContext } from "~/components/stores/user-store";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";
import { type Choice, Dropdown } from "./dropdown";
import { FullSummonerUpdate } from "./full-summoner-update";
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

	const filteredChoices: Choice[] = [
		{ text: "100", value: 100 },
		{ text: "500", value: 500 },
		{ text: "1,000", value: 1000 },
		{ text: "1,800 (Level 2)", value: 1800 },
		{ text: "5,000", value: 5000 },
		{ text: "6000 (Level 3)", value: 6000 },
		{ text: "10,000", value: 10000 },
		{ text: "12,600 (Level 4)", value: 12600 },
		{ text: "21,600 (Level 5)", value: 21600 },
		{ text: "50,000", value: 50000 },
		{ text: "100,000", value: 100000 },
		{
			text: "All",
			value: Number.MAX_SAFE_INTEGER,
		},
	];

	const sortOrderChoices: Choice[] = [
		{ text: "Points", value: SortOrder2.Points },
		{ text: "A-Z", value: SortOrder2.AZ },
		{ text: "Level", value: SortOrder2.Level },
	];

	return (
		<div className="flex flex-row items-center justify-center gap-4 px-4 py-2">
			<FullSummonerUpdate user={user} />
			<div className="h-8 w-[1px] bg-gray-500" />
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
			<ToggleEye
				label="Hide selected champions"
				checked={!showSelectedChampions}
				onChange={toggleShowSelectedChampions}
			/>
			<div className="h-8 w-[1px] bg-gray-500" />
			<SwitchWithLabel label={"Mastery Points"} checked={showMasteryPoints} onChange={toggleMasteryPoints} />
			<SwitchWithLabel
				label={"Available Chests"}
				checked={showAvailableChests}
				onChange={toggleAvailableChests}
			/>
			<SwitchWithLabel label={"Levels"} checked={showLevels} onChange={toggleLevels} />
			<div className="flex flex-col items-center gap-3">
				<Label>Image size</Label>
				<ScaleSlider />
			</div>
			<div className="h-8 w-[1px] bg-gray-500" />
			<Button size={"sm"} variant="secondary" className="w-32" onClick={toggleShowMatchHistory}>
				Match history
			</Button>
		</div>
	);
}
