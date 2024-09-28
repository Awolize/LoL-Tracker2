"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
import { FunnelIcon as OutlineFunnelIcon } from "@heroicons/react/24/outline";
import { FunnelIcon as SolidFunnelIcon } from "@heroicons/react/24/solid";
import type { ChallengeLocalization, Summoner } from "@prisma/client";
import React, { type Dispatch, type SetStateAction, useState, useCallback } from "react";
import type { Regions } from "twisted/dist/constants";

import { api } from "~/trpc/react";
import LoadingComponent from "../old/loading-spinner";

export const DifferentSideBar = ({
	region,
	user,
	selectedChallenge,
	setSelectedChallenge,
	mappedCases,
}: {
	region: Regions;
	user: Summoner;
	selectedChallenge: number | null;
	setSelectedChallenge: Dispatch<SetStateAction<number | null>>;
	mappedCases: number[];
}) => {
	const [drawerOpen, setDrawerOpen] = useState(true);
	const [showAll, setShowAll] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	const handleItemClick = useCallback(
		(itemId) => {
			setSelectedChallenge((prev) => (prev !== itemId ? itemId : 0));
		},
		[setSelectedChallenge],
	);

	const utils = api.useUtils();

	const refreshJackOfAllChamps = api.processingApi.updateJackOfAllChamps.useMutation({
		onSuccess: async () => {
			await Promise.all([
				utils.differentApi.getChallengesConfigDescriptions.invalidate(),
				utils.differentApi.getJackOfAllChamps.invalidate(),
			]);
		},
	});

	const refreshChampionOcean = api.processingApi.updateChampionOcean.useMutation({
		onSuccess: async () => {
			await Promise.all([
				utils.differentApi.getChallengesConfigDescriptions.invalidate(),
				utils.differentApi.getChampionOcean.invalidate(),
			]);
		},
	});

	const refreshChampionOcean2024Split3 = api.processingApi.updateChampionOcean2024Split3.useMutation({
		onSuccess: async () => {
			await Promise.all([
				utils.differentApi.getChallengesConfigDescriptions.invalidate(),
				utils.differentApi.getChampionOcean2024Split3.invalidate(),
			]);
		},
	});

	const refreshAdaptToAllSituations = api.processingApi.updateAdaptToAllSituations.useMutation({
		onSuccess: async () => {
			await Promise.all([
				utils.differentApi.getChallengesConfigDescriptions.invalidate(),
				utils.differentApi.getAdaptToAllSituations.invalidate(),
			]);
		},
	});

	const refreshInvincible = api.processingApi.updateInvincible.useMutation({
		onSuccess: async () => {
			await Promise.all([
				utils.differentApi.getChallengesConfigDescriptions.invalidate(),
				utils.differentApi.getInvincible.invalidate(),
			]);
		},
	});

	const refreshQueryUpdateChallengeConfig = api.processingApi.updateChallengeConfig.useMutation({
		onSuccess: async () => {
			await utils.differentApi.getChallengesConfigDescriptions.invalidate();
		},
	});

	const refreshQueryUpdateGames = api.processingApi.updateGames.useMutation({
		onSuccess: async () => {
			refreshAllChallenges();
		},
	});

	const refreshAllChallenges = () => {
		refreshJackOfAllChamps.mutate({
			region,
			username: `${user.gameName}#${user.tagLine}`,
		});
		refreshChampionOcean.mutate({
			region,
			username: `${user.gameName}#${user.tagLine}`,
		});
		refreshChampionOcean2024Split3.mutate({
			region,
			username: `${user.gameName}#${user.tagLine}`,
		});
		refreshAdaptToAllSituations.mutate({
			region,
			username: `${user.gameName}#${user.tagLine}`,
		});
		refreshInvincible.mutate({
			region,
			username: `${user.gameName}#${user.tagLine}`,
		});
	};

	const { data: challenges } = api.differentApi.getChallengesConfigDescriptions.useQuery({
		username: `${user.gameName}#${user.tagLine}`,
		region,
	});

	// Filter challenges based on search term and mappedCases
	const filteredChallenges = challenges?.data
		.filter((item) => {
			const local = item?.localizedNames;
			const enUSName = local.find((name) => name.language === "en_US")?.name;
			const enUSDescription = local.find((name) => name.language === "en_US")?.description;

			const nameMatch = enUSName?.toLowerCase().includes(searchTerm.toLowerCase());
			const descriptionMatch = enUSDescription?.toLowerCase().includes(searchTerm.toLowerCase());

			return nameMatch || descriptionMatch;
		})
		.sort((a, b) => a.id - b.id);

	const UpdateGlobalConfig = ({ selected }) => {
		const handleClick = () => {
			refreshQueryUpdateChallengeConfig.mutate({
				username: `${user.gameName}#${user.tagLine}`,
				region,
			});
		};

		const isLoading = refreshQueryUpdateChallengeConfig.isLoading;

		return (
			<button
				type="button"
				className={`cursor-pointer px-4 py-2 text-center duration-300 ${
					selected ? "bg-background" : ""
				} flex flex-row justify-center gap-2`}
				onClick={handleClick}
			>
				{isLoading && <LoadingComponent />}
				Update global config
			</button>
		);
	};

	const UpdatePlayerChallenges = ({ selected }) => {
		const handleClick = () => {
			refreshQueryUpdateGames.mutate({
				gameName: `${user.gameName}`,
				tagLine: `${user.tagLine}`,
				region,
			});
		};

		const isLoading =
			refreshQueryUpdateGames.isLoading ||
			refreshJackOfAllChamps.isLoading ||
			refreshChampionOcean.isLoading ||
			refreshChampionOcean2024Split3.isLoading ||
			refreshAdaptToAllSituations.isLoading ||
			refreshInvincible.isLoading;

		return (
			<button
				type="button"
				className={`cursor-pointer px-4 py-2 text-center duration-300 ${
					selected ? "bg-background" : ""
				} flex flex-row justify-center gap-2`}
				onClick={handleClick}
			>
				{isLoading && <LoadingComponent />}
				Update
			</button>
		);
	};

	return (
		<nav
			className={`sticky top-[84px] left-0 max-h-[calc(100vh-168px)] bg-primary-foreground py-4 ${
				drawerOpen ? "w-72 pr-2 pl-2" : "w-0 px-2"
			} relative border-t-2 duration-300`}
		>
			{drawerOpen ? (
				<ArrowLeftIcon
					className="-right-4 absolute top-[52px] w-8 cursor-pointer rounded-full border-2 border-background bg-primary-foreground p-1 text-foreground"
					onClick={() => setDrawerOpen(!drawerOpen)}
				/>
			) : (
				<ArrowRightIcon
					className="-right-4 absolute top-[52px] w-8 cursor-pointer rounded-full border-2 border-background bg-primary-foreground p-1 text-foreground"
					onClick={() => setDrawerOpen(!drawerOpen)}
				/>
			)}

			{drawerOpen && (
				<div className="flex h-full flex-col gap-1">
					<p className="text-center">Challenges</p>
					<div className="flex max-h-[1px] min-h-[1px] w-full bg-gray-600" />
					<div className="inline-flex justify-evenly gap-1 py-1">
						<input
							type="text"
							placeholder="Search title..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="rounded bg-background px-2 text-foreground"
						/>
						{showAll ? (
							<OutlineFunnelIcon
								onClick={() => setShowAll(!showAll)}
								className="h-8 rounded bg-background px-2 py-1 text-foreground"
								aria-checked={showAll}
							/>
						) : (
							<SolidFunnelIcon
								onClick={() => setShowAll(!showAll)}
								className="h-8 rounded bg-background px-2 py-1 text-foreground"
								aria-checked={showAll}
							/>
						)}
					</div>
					<ul className="flex flex-col gap-1 overflow-y-auto">
						{filteredChallenges?.map((item) => {
							const implemented = mappedCases.includes(item.id);

							if (!showAll && !implemented) {
								return null;
							}

							return (
								<Item
									key={item.id}
									item={item}
									selected={selectedChallenge === item.id}
									onItemClick={handleItemClick}
									implemented={implemented}
								/>
							);
						})}
					</ul>
					{user.tagLine === "dev" && <UpdateGlobalConfig selected />}
					<UpdatePlayerChallenges selected />
				</div>
			)}
		</nav>
	);
};

const Item = React.memo(
	({
		item,
		selected,
		onItemClick,
		implemented,
	}: {
		item: {
			id: number;
			localizedNames: ChallengeLocalization[];
		};
		selected: boolean;
		onItemClick: (itemId: number) => void;
		implemented: boolean;
	}) => {
		const handleClick = () => {
			onItemClick(item.id);
		};

		const localized = item.localizedNames.find((el) => el.language === "en_US");

		if (!localized) return null;

		const text = localized.name;
		const description = localized.description;

		return (
			// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
			<li
				className={`relative cursor-pointer rounded-sm border py-2 duration-300 ${selected ? "bg-background" : ""}`}
				onClick={handleClick}
			>
				<div className="flex gap-x-2 px-2">
					<span className="w-3 text-green-500">{implemented && "●"}</span>
					<div className="w-full">
						<p className="text-sm">{text}</p>
						<p className="text-xs opacity-50">{description}</p>
					</div>
				</div>
			</li>
		);
	},
);
