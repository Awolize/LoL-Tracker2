import { useUserContext } from "../stores/user-store";
import MatchTable from "./match-history-item-table";
import { type CompleteMatch } from "./server-processing-helpers";

const MatchItem = ({ match }: { match: CompleteMatch }) => {
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
        <div className="flex flex-row gap-4">
            <MatchTable players={match.MatchInfo.participants as unknown as Array<any>} teamId={200} />
            <MatchTable players={match.MatchInfo.participants as unknown as Array<any>} teamId={100} />
            <div className="flex flex-col">
                <div>{match.MatchInfo.gameStartTimestamp.toLocaleString()}</div>
                <div>Mode: {match.MatchInfo.gameMode}</div>
                <div>Type: {match.MatchInfo.gameType}</div>
                <div>Map: {match.MatchInfo.mapId}</div>
                <div>{isWin ? "Win ✅" : "Lose ❌"}</div>
                <div>{(match.MatchInfo.gameDuration / 60).toPrecision(3)} min</div>
            </div>
            {/* <div>{JSON.stringify(match.MatchInfo)}</div> */}{" "}
        </div>
    );
};

export default MatchItem;
