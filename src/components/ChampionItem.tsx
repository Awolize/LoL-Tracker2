import React from "react";

import Image from "next/image";

import type { CompleteChampionInfo } from "../pages/[server]/[username]/mastery";
import { filteredOut } from "../utils/champsUtils";
import { DATA_DRAGON_URL } from "../utils/constants";

interface ChampionItemProps {
    champ: CompleteChampionInfo;
    handleChampionClick: (championId: number) => void;
    filterPoints: number;
    showFinished: boolean;
    showChest: boolean;
    showLevel: boolean;
    hiddenChamps: Set<number>;
}

const ChampionItem: React.FC<ChampionItemProps> = ({
    champ,
    handleChampionClick,
    filterPoints,
    showFinished,
    showChest,
    showLevel,
    hiddenChamps,
}) => {
    const disabled = filteredOut(champ, filterPoints);
    const hide = disabled && !showFinished;

    if (hide) return <></>;

    return (
        <li
            className="flex flex-col pb-2"
            key={champ.key as React.Key}
            onClick={() => handleChampionClick(champ.championId)}
        >
            <div className="relative z-10">
                {showLevel && (
                    <span className="absolute top-[3px] left-[3px] flex h-6 w-6 items-center justify-center bg-blue-800 px-[0.40rem] text-center text-xs leading-5">
                        {champ.championLevel}
                    </span>
                )}
                {showChest && !champ.chestGranted && (
                    <span className="absolute top-[3px] right-[3px] flex h-6 w-6 items-center justify-center px-[0.20rem] ">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-6 h-6"
                        >
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
                    src={`${DATA_DRAGON_URL}${champ.image.full}`}
                    style={{
                        zIndex: -1,
                        opacity: disabled ? "40%" : "100%",
                    }}
                    className={`${hiddenChamps.has(champ.championId) ? "grayscale brightness-50" : ""} ${
                        disabled ? "grayscale" : ""
                    }`}
                    alt={`${champ.name}`}
                    height={90}
                    width={90}
                    // hidden={hideAll}
                    // placeholderSrc="/placeholder.png"
                />
            </div>

            <div className="text-center text-xs">{champ.name}</div>
            <div className="items-center justify-center text-center text-xs">{champ.championPoints}</div>
        </li>
    );
};

export default ChampionItem;
