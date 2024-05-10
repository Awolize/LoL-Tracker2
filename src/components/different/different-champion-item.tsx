import type React from "react";

import Image from "next/image";

import type { ChampionDetails } from "@prisma/client";
import { DATA_DRAGON_URL } from "~/utils/constants";

export const DifferentChampionItem = ({ champ, hide }: { champ: ChampionDetails; hide: boolean }) => {
    return (
        <li className="flex flex-col pb-2" key={champ.key as React.Key}>
            <div className="relative z-10">
                <Image
                    src={`${DATA_DRAGON_URL}/${champ.full}`}
                    style={{
                        zIndex: -1,
                    }}
                    className={`${hide && "grayscale brightness-50"}`}
                    alt={`${champ.name}`}
                    height={90}
                    width={90}
                    // fill
                    // hidden={hideAll}
                    // blurDataURL="/placeholder.png"
                />
            </div>

            <div className="text-center text-xs">{champ.name}</div>
        </li>
    );
};
