import Image from "next/image";
import { useDataDragonPath } from "~/app/_components/use-data-dragon-path";
import { useUserContext } from "../stores/user-store";
import { type CompleteMatch } from "./server-processing-helpers";

const MatchItem = ({ match }: { match: CompleteMatch }) => {
    // console.log(match.MatchInfo);

    const { getChampionImage } = useDataDragonPath();
    const user = useUserContext((s) => s.user);

    // riotIdGameName
    // riotIdTagline
    // championName
    // kills
    // deaths
    // assists

    const isWin: boolean = (match.MatchInfo.participants as unknown as Array<any>)?.find(
        (p) => p.puuid === user.puuid,
    ).win;

    return (
        <div className="w-full p-4 flex flex-row gap-2">
            <div className="flex flex-col">
                <div>{match.MatchInfo.gameStartTimestamp.toLocaleString()}</div>
                <div>{match.MatchInfo.gameMode}</div>
                <div>{isWin ? "Win ✅" : "Lose ❌"}</div>
                <div>{(match.MatchInfo.gameDuration / 60).toPrecision(3)} min</div>
            </div>
            <div className="flex flex-row gap-4">
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
                            {(match.MatchInfo.participants as unknown as Array<any>)
                                ?.filter((a) => a.teamId === 200)
                                .map((player) => (
                                    <tr
                                        className={
                                            user.puuid === player.puuid
                                                ? "bg-gray-50 border-b dark:bg-gray-700 dark:border-gray-700"
                                                : "bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                        }
                                        key={player.puuid}
                                    >
                                        <th
                                            scope="row"
                                            className="px-2 py-2 gap-1 flex flex-col justify-center font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                        >
                                            <div className="flex justify-center">
                                                <Image
                                                    src={getChampionImage(`${player.championName}.png`)}
                                                    className="rounded"
                                                    alt={`${player.championName}`}
                                                    height={40}
                                                    width={40}
                                                    // fill
                                                    unoptimized={true}
                                                    // hidden={hideAll}
                                                    placeholder="blur"
                                                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                                                />
                                            </div>
                                            <div className="flex justify-center">{player.championName}</div>
                                        </th>
                                        <th
                                            scope="row"
                                            className={
                                                "px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                            }
                                        >
                                            {player.riotIdGameName}
                                        </th>
                                        <th
                                            scope="row"
                                            className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                        >
                                            {player.kills}/{player.deaths}/{player.assists}
                                        </th>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
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
                            {(match.MatchInfo.participants as unknown as Array<any>)
                                ?.filter((a) => a.teamId === 100)
                                .map((player) => (
                                    <tr
                                        className={
                                            user.puuid === player.puuid
                                                ? "bg-gray-50 border-b dark:bg-gray-700 dark:border-gray-700"
                                                : "bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                        }
                                        key={player.puuid}
                                    >
                                        <th
                                            scope="row"
                                            className="px-2 py-2 gap-1 flex flex-col justify-center font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                        >
                                            <div className="flex justify-center">
                                                <Image
                                                    src={getChampionImage(`${player.championName}.png`)}
                                                    className="rounded"
                                                    alt={`${player.championName}`}
                                                    height={40}
                                                    width={40}
                                                    // fill
                                                    unoptimized={true}
                                                    // hidden={hideAll}
                                                    placeholder="blur"
                                                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                                                />
                                            </div>
                                            <div className="flex justify-center">{player.championName}</div>
                                        </th>
                                        <th
                                            scope="row"
                                            className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                        >
                                            {player.riotIdGameName}
                                        </th>
                                        <th
                                            scope="row"
                                            className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                        >
                                            {player.kills}/{player.deaths}/{player.assists}
                                        </th>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* <div>{JSON.stringify(match.MatchInfo)}</div> */}
        </div>
    );
};

export default MatchItem;
