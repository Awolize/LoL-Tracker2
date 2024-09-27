import type { ChampionDetails } from "@prisma/client";

import { DifferentChampionItem } from "~/components/different/different-champion-item";
import { DifferentRoleHeader } from "~/components/different/different-role-header";
import type { CompleteChampionInfo } from "../../mastery/page";

interface RoleChampionListProps {
	playerChampionInfo: CompleteChampionInfo[];
	selectedChallengeData?: ChampionDetails[];
	version: string;
}

export function RoleChampionList({ playerChampionInfo, selectedChallengeData, version }: RoleChampionListProps) {
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
								const hide = jacks.includes(champ.key);

								return (
									<DifferentChampionItem
										key={champ.key}
										hide={hide}
										champ={champ}
										version={version}
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
