import type { ChampionDetails } from "@prisma/client";
import type { CompleteChampionInfo } from "~/app/[region]/[username]/mastery/page";
import { DifferentChampionItem } from "~/components/different/different-champion-item";
import { DifferentRoleHeader } from "~/components/different/different-role-header";
import { useChampionStore } from "./challenge-champion-store";

interface RoleChampionListProps {
	playerChampions: CompleteChampionInfo[];
	challengeCompletedChampions?: ChampionDetails[];
	version: string;
	selectedChallenge: number | null;
	profileId: string;
}

export function RoleChampionList({
	playerChampions: playerChampionInfo,
	challengeCompletedChampions: selectedChallengeData,
	version,
	selectedChallenge,
	profileId,
}: RoleChampionListProps) {
	const { manuallyMarked, markChampion, unmarkChampion } = useChampionStore();

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
								const markedChampionsSet = selectedChallenge
									? manuallyMarked[profileId]?.[selectedChallenge] || new Set()
									: new Set();

								const isMarked = selectedChallenge ? markedChampionsSet.has(champ.id) : false;
								const hide = selectedChallenge ? jacks.includes(champ.key) || isMarked : false;

								return (
									<DifferentChampionItem
										key={champ.key}
										hide={hide}
										champ={champ}
										version={version}
										onClick={() => {
											if (selectedChallenge) {
												if (isMarked) {
													unmarkChampion(profileId, selectedChallenge, champ.id);
												} else {
													markChampion(profileId, selectedChallenge, champ.id);
												}
											} else {
												console.log("No challenge selected, no action taken.");
											}
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
