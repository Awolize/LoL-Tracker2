"use client";

import type React from "react";

import Image from "next/image";

import clsx from "clsx";
import type { CompleteChampionInfo } from "~/app/[region]/[username]/mastery/page";
import { filteredOut } from "~/utils/champsUtils";
import { useDataDragonPath } from "./use-data-dragon-path";

interface ChampionItemProps {
	champ: CompleteChampionInfo;
	handleChampionClick: (championId: number) => void;
	filterPoints: number;
	showFinished: boolean;
	showChest: boolean;
	showLevel: boolean;
	hiddenChamp: boolean;
	showMasteryPoints: boolean;
}

const ChampionItem: React.FC<ChampionItemProps> = ({
	champ,
	filterPoints,
	showFinished,
	showChest,
	showLevel,
	hiddenChamp,
	showMasteryPoints,
	handleChampionClick,
}) => {
	const disabled = filteredOut(champ, filterPoints);
	const hide = disabled && !showFinished;

	const { getChampionImage } = useDataDragonPath(champ.version);

	if (hide) return <></>;

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: Not sure how to solve this. Putting it off until later date, more pressing matters
		<li key={champ.key as React.Key} className="flex flex-col pb-2" onClick={() => handleChampionClick(champ.id)}>
			<div className="relative z-10">
				{showLevel && (
					<div className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 bg-opacity-50 font-bold text-xs">
						{champ.championLevel}
					</div>
				)}
				{showChest && !champ.chestGranted && (
					<span className="absolute top-[3px] right-[3px] flex h-6 w-6 items-center justify-center px-[0.20rem] ">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							className="h-6 w-6"
						>
							<title>chestGranted</title>
							<path
								d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z"
								stroke="black"
								fill="black"
							/>
							<path
								d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.163 3.75A.75.75 0 0110 12h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75z"
								stroke="black"
								fill="black"
							/>

							<path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
							<path
								fillRule="evenodd"
								d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.163 3.75A.75.75 0 0110 12h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75z"
								clipRule="evenodd"
							/>
						</svg>
					</span>
				)}

				<Image
					src={getChampionImage(champ.full)}
					style={{
						zIndex: -1,
						opacity: disabled ? "40%" : "100%",
						boxSizing: "border-box",
					}}
					className={clsx(
						{
							"brightness-50 grayscale": hiddenChamp,
							grayscale: disabled,
							"border-4 border-sky-500 border-opacity-70": showLevel && champ.championLevel === 7,
							"border-4 border-purple-600 border-opacity-60": showLevel && champ.championLevel === 6,
							"border-4 border-red-600 border-opacity-50": showLevel && champ.championLevel === 5,
							"border-4 border-yellow-700 border-opacity-25": showLevel && champ.championLevel < 5,
						},
						"rounded",
					)}
					alt={`${champ.name}`}
					height={90}
					width={90}
					placeholder="blur"
					blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
				/>
			</div>

			<div className="text-center text-xs">{champ.name}</div>
			{showMasteryPoints && (
				<div className="items-center justify-center text-center text-xs">{champ.championPoints}</div>
			)}
		</li>
	);
};

export default ChampionItem;
