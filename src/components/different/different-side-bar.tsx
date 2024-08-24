"use client";

import { type Dispatch, type SetStateAction, useState } from "react";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
import { FunnelIcon as OutlineFunnelIcon } from "@heroicons/react/24/outline";
import { FunnelIcon as SolidFunnelIcon } from "@heroicons/react/24/solid";
import type { ChallengeLocalization, Summoner } from "@prisma/client";
import type { Regions } from "twisted/dist/constants";
import { api } from "~/trpc/react";
import LoadingComponent from "../old/loading-spinner";

export const DifferentSideBar = ({
	region,
	user,
	selectedItem,
	setSelectedItem,
	mappedCases,
}: {
	region: Regions;
	user: Summoner;
	selectedItem: number | null;
	setSelectedItem: Dispatch<SetStateAction<number | null>>;
	mappedCases: number[];
}) => {
	const [drawerOpen, setDrawerOpen] = useState(true);
	const [showAll, setShowAll] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	const handleItemClick = (itemId) => {
		if (selectedItem !== itemId) {
			setSelectedItem(itemId);
		} else {
			setSelectedItem(0);
		}
	};
	const utils = api.useUtils();

	const refreshQueryUpdateChallengeConfig = api.processingApi.updateChallengeConfig.useMutation();
	const refreshQueryUpdateGames = api.processingApi.updateGames.useMutation({
		onSuccess: async () => {
			refreshQueryUpdateJackOfAllChamps.mutate({ region, username: `${user.gameName}#${user.tagLine}` });
			refreshQueryUpdateChampionOcean.mutate({ region, username: `${user.gameName}#${user.tagLine}` });
			refreshQueryUpdateAdaptToAllSituations.mutate({ region, username: `${user.gameName}#${user.tagLine}` });
			refreshQueryUpdateInvincible.mutate({ region, username: `${user.gameName}#${user.tagLine}` });
		},
	});
	const refreshQueryUpdateJackOfAllChamps = api.processingApi.updateJackOfAllChamps.useMutation({
		onSuccess: async () => {
			await utils.differentApi.getChallengesConfig.invalidate();
			await utils.differentApi.getJackOfAllChamps.invalidate();
		},
	});
	const refreshQueryUpdateChampionOcean = api.processingApi.updateChampionOcean.useMutation({
		onSuccess: async () => {
			await utils.differentApi.getChallengesConfig.invalidate();
			await utils.differentApi.getChampionOcean.invalidate();
		},
	});
	const refreshQueryUpdateAdaptToAllSituations = api.processingApi.updateAdaptToAllSituations.useMutation({
		onSuccess: async () => {
			await utils.differentApi.getChallengesConfig.invalidate();
			await utils.differentApi.getAdaptToAllSituations.invalidate();
		},
	});
	const refreshQueryUpdateInvincible = api.processingApi.updateInvincible.useMutation({
		onSuccess: async () => {
			await utils.differentApi.getChallengesConfig.invalidate();
			await utils.differentApi.getInvincible.invalidate();
		},
	});

	const { data: challenges } = api.differentApi.getChallengesConfig.useQuery({
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

			return nameMatch ?? descriptionMatch;
		})
		.sort((a, b) => a.id - b.id);

	// const keystoneChallenges = challenges?.keystones;

	const UpdateGlobalConfig = ({ selected }) => {
		const handleClick = () => {
			refreshQueryUpdateChallengeConfig.mutate({ username: `${user.gameName}#${user.tagLine}`, region });
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
				{!!isLoading && <LoadingComponent />}
				Update global config
			</button>
		);
	};
	const UpdatePlayerChallenges = ({ selected }) => {
		const handleClick = () => {
			refreshQueryUpdateGames.mutate({ gameName: `${user.gameName}`, tagLine: `${user.tagLine}`, region });
		};

		const isLoading =
			refreshQueryUpdateGames.isLoading ||
			refreshQueryUpdateJackOfAllChamps.isLoading ||
			refreshQueryUpdateAdaptToAllSituations.isLoading ||
			refreshQueryUpdateInvincible.isLoading ||
			refreshQueryUpdateChampionOcean.isLoading;

		return (
			<button
				type="button"
				className={`cursor-pointer px-4 py-2 text-center duration-300 ${
					selected ? "bg-background" : ""
				} flex flex-row justify-center gap-2`}
				onClick={handleClick}
			>
				{!!isLoading && <LoadingComponent />}
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
								return <></>;
							}

							return (
								<Item
									key={item.id}
									item={item}
									selected={selectedItem === item.id}
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

const Item = ({
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

	if (!localized) return <></>;

	const text = localized.name;
	const description = localized.description;

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <Not sure how to fix this and keep the current formatting, not worth the time at this point in time>
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
};
