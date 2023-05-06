import React from "react";
import { filteredOut } from "../utils/champsUtils";
import Image from "next/image";
import { DATA_DRAGON_URL } from "../utils/constants";
import type { CompleteChampionInfo } from "../pages/[server]/[username]/mastery";

interface ChampionItemProps {
    champ: CompleteChampionInfo;
    handleChampionClick: (championId: number) => void;
    filterPoints: number;
    showFinished: boolean;
    showLevel: boolean;
    hiddenChamps: Set<number>;
}

const ChampionItem: React.FC<ChampionItemProps> = ({
    champ,
    handleChampionClick,
    filterPoints,
    showFinished,
    showLevel,
    hiddenChamps,
}) => {
    const disabled = filteredOut(champ, filterPoints);
    const hide = disabled && !showFinished;

    return (
        <li
            className="flex flex-col pb-2"
            key={champ.key as React.Key}
            onClick={() => handleChampionClick(champ.championId)}
        >
            <div className="relative z-10">
                {showLevel && !hide && (
                    <span className="absolute top-[3px] left-[3px] flex h-6 w-6 items-center justify-center bg-blue-800 px-[0.40rem] text-center text-xs leading-5">
                        {champ.championLevel}
                    </span>
                )}
                {!hide && (
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
                )}
            </div>

            <div className="text-center text-xs">{!hide && champ.name}</div>
            <div className="items-center justify-center text-center text-xs">{!hide && champ.championPoints}</div>
        </li>
    );
};

export default ChampionItem;
