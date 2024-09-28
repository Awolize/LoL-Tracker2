import type { Challenge } from "@prisma/client";

interface ChallengeThresholdsProps {
	thresholds: Record<string, number> | null;
	selectedChallenge: Challenge | null;
}

export function DifferentHeaderThresholds({ thresholds, selectedChallenge }: ChallengeThresholdsProps) {
	const currentValue = selectedChallenge?.value;

	if (!thresholds || currentValue == null) return null;

	const uniqueSortedValues = Array.from(new Set(Object.values(thresholds).concat(currentValue))).sort(
		(a, b) => a - b,
	);

	return (
		<div className="flex flex-col items-center justify-center text-gray-400">
			<ul className="flex flex-row gap-1">
				{uniqueSortedValues.map((value) => (
					<li
						key={value}
						className={`${
							value === currentValue
								? "text-purple-500"
								: value > currentValue
									? "text-white"
									: "text-gray-500"
						}`}
					>
						{value}
					</li>
				))}
			</ul>
		</div>
	);
}
