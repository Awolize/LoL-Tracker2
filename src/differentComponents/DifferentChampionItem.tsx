import React from "react";

import Image from "next/image";

import type { CompleteChampionInfo } from "../pages/[server]/[username]/mastery";
import { DATA_DRAGON_URL } from "../utils/constants";

export const DifferentChampionItem = ({ champ }: { champ: CompleteChampionInfo }) => {
    return (
        <li className="flex flex-col pb-2" key={champ.key as React.Key}>
            <div className="relative z-10">
                <Image
                    src={`${DATA_DRAGON_URL}${champ.image.full}`}
                    style={{
                        zIndex: -1,
                    }}
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
