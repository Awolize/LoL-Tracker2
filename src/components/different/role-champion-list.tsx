import type { ChampionDetails } from "@prisma/client";
import { useState } from "react";

import type { CompleteChampionInfo } from "~/app/[region]/[username]/mastery/page";
import { DifferentChampionItem } from "~/components/different/different-champion-item";
import { DifferentRoleHeader } from "~/components/different/different-role-header";

interface RoleChampionListProps {
	playerChampions: CompleteChampionInfo[];
	selectedChallengeData?: ChampionDetails[];
	version: string;
}

export function RoleChampionList({
	playerChampions: playerChampionInfo,
	selectedChallengeData,
	version,
}: RoleChampionListProps) {
	const [manuallyMarked, setManuallyMarked] = useState(new Set());

	return (
		<main className="flex flex-grow flex-row gap-2 overflow-y-auto">
			{["Top", "Jungle", "Mid", "Bottom", "Support"].map((role) => {
				const champsWithRole = playerChampionInfo.filter((champ) => champ?.role === role);

				return (
					<div className="w-full px-4" key={role}>
						<DifferentRoleHeader role={role} />
						<ul className="grid justify-between" style={{ gridTemplateColumns: "repeat(auto-fill, 90px)" }}>
							{champsWithRole.map((champ) => {
								const jacks = selectedChallengeData?.map((el) => el.key) ?? [];
								const hide = jacks.includes(champ.key) || manuallyMarked.has(champ.id);

								return (
									<DifferentChampionItem
										key={champ.key}
										hide={hide}
										champ={champ}
										version={version}
										onClick={() => {
											console.log(`${champ.key} pressed`);
											setManuallyMarked((prev) => {
												const newSet = new Set(prev);
												if (newSet.has(champ.id)) {
													newSet.delete(champ.id);
												} else {
													newSet.add(champ.id);
												}
												return newSet;
											});
										}}
									/>
								);
							})}
						</ul>
					</div>
				);
			})}
		</main>
	);
}
