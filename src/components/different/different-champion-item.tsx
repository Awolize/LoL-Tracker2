import type React from "react";

import Image from "next/image";

import type { ChampionDetails } from "@prisma/client";
import { useDataDragonPath } from "../old/use-data-dragon-path";

export const DifferentChampionItem = ({ champ, hide }: { champ: ChampionDetails; hide: boolean }) => {
	const { getChampionImage } = useDataDragonPath();
	return (
		<li className="flex flex-col pb-2" key={champ.key as React.Key}>
			<div className="relative z-10">
				<Image
					src={getChampionImage(champ.full)}
					style={{
						zIndex: -1,
					}}
					className={`${hide && "brightness-50 grayscale"}`}
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
