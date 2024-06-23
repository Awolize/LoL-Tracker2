import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useDataDragonPath } from "~/components/old/use-data-dragon-path";
import { useUserContext } from "~/components/stores/user-store";
import type { MatchPlayerData } from "./MatchPlayerData";

interface MatchTableProps {
	players: Array<MatchPlayerData>;
	teamId: number;
}

const MatchTable: React.FC<MatchTableProps> = ({ players, teamId }) => {
	const { getChampionImage } = useDataDragonPath();
	const user = useUserContext((s) => s.user);

	const pathname = usePathname(); // "/EUW/awot-dev/mastery"
	const regionPath = pathname.split("/")[1]; // "EUW"

	return (
		<div className="relative overflow-x-auto">
			<table className="w-full text-left text-gray-500 text-sm rtl:text-right dark:text-gray-400">
				<thead className="bg-gray-50 text-gray-700 text-xs uppercase dark:bg-gray-700 dark:text-gray-400">
					<tr>
						<th scope="col" className="px-2 py-2">
							Champion
						</th>
						<th scope="col" className="px-2 py-2">
							Player
						</th>
						<th scope="col" className="px-2 py-2">
							K/D/A
						</th>
					</tr>
				</thead>
				<tbody>
					{players
						.filter((player) => player.teamId === teamId)
						.map((player) => (
							<tr
								className={
									user.puuid === player.puuid
										? "border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-700"
										: "border-b bg-white dark:border-gray-700 dark:bg-gray-800"
								}
								key={player.puuid}
							>
								<td className="flex min-w-24 flex-col justify-center gap-1 whitespace-nowrap px-2 py-2 font-medium text-gray-900 dark:text-foreground">
									<div className="flex justify-center">
										<Image
											src={getChampionImage(`${player.championName}.png`)}
											className="rounded"
											alt={`${player.championName}`}
											height={40}
											width={40}
											unoptimized={false}
											placeholder="blur"
											blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
										/>
									</div>
									<div className="flex justify-center">{player.championName}</div>
								</td>
								<td className="min-w-48 whitespace-nowrap px-2 py-2 font-medium text-gray-900 dark:text-foreground">
									<Link
										href={`/${regionPath}/${player.riotIdGameName}-${player.riotIdTagline}`}
										className="hover:underline"
									>
										{player.riotIdGameName}
									</Link>
								</td>
								<td className="min-w-24 whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-foreground">
									{player.kills}/{player.deaths}/{player.assists}
								</td>
							</tr>
						))}
				</tbody>
			</table>
		</div>
	);
};

export default MatchTable;
