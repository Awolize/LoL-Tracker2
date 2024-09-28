import type { Challenge } from "@prisma/client";
import { useChampionStore } from "./use-challenge-champion-store";

interface ChallengeProgressProps {
	selectedChallenge: Challenge | null;
	completedChampionsSize: number;
	profileId: string;
}

export function DifferentHeaderProgress({
	selectedChallenge,
	completedChampionsSize,
	profileId,
}: ChallengeProgressProps) {
	if (!selectedChallenge?.value) return null;

	const finishedValue = selectedChallenge.value;
	const missingValue = finishedValue - completedChampionsSize;

	return (
		<div className="flex flex-col">
			<div className="flex gap-1">
				<div className="text-gray-400">According to Riot, you have finished</div>
				<b>{finishedValue}</b>

				{missingValue > 0 ? (
					<>
						<div className="text-gray-400">which means lol.awot.dev is missing</div>
						<div className="flex flex-row">
							<b>{missingValue}</b>
							<div className="text-gray-400">.</div>
						</div>
					</>
				) : (
					<div className="text-gray-400">which means everything is tracked!</div>
				)}
			</div>
			{missingValue > 0 && (
				<div className="text-gray-400">Please make sure to double-check the missing ones.</div>
			)}
		</div>
	);
}
