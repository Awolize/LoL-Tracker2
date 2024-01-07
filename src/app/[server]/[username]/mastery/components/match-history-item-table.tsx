import Image from "next/image";
import React from "react";
import { useDataDragonPath } from "~/app/_components/use-data-dragon-path";
import { useUserContext } from "../stores/user-store";

interface MatchTableProps {
    players: Array<any>;
    teamId: number;
}

const MatchTable: React.FC<MatchTableProps> = ({ players, teamId }) => {
    const { getChampionImage } = useDataDragonPath();
    const user = useUserContext((s) => s.user);

    return (
        <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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
                                        ? "bg-gray-50 border-b dark:bg-gray-700 dark:border-gray-700"
                                        : "bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                }
                                key={player.puuid}
                            >
                                <td className="px-2 py-2 gap-1 flex flex-col min-w-24 justify-center font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <div className="flex justify-center">
                                        <Image
                                            src={getChampionImage(`${player.championName}.png`)}
                                            className="rounded"
                                            alt={`${player.championName}`}
                                            height={40}
                                            width={40}
                                            unoptimized={true}
                                            placeholder="blur"
                                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                                        />
                                    </div>
                                    <div className="flex justify-center">{player.championName}</div>
                                </td>
                                <td className="px-2 py-2 font-medium min-w-48 text-gray-900 whitespace-nowrap dark:text-white">
                                    {player.riotIdGameName}
                                </td>
                                <td className="px-4 py-2 font-medium min-w-24 text-gray-900 whitespace-nowrap dark:text-white">
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
