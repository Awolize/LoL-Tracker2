// ChampionList.jsx
import MatchItem from "./match-history-item";
import { type CompleteMatch } from "./server-processing-helpers";

const MatchHistory = ({ matches }: { matches: CompleteMatch[] }) => {
    return (
        <div className="w-full p-4">
            <div className="flex flex-col gap-2">
                {matches.map((match) => {
                    return <MatchItem key={match.gameId} match={match} />;
                })}
            </div>
        </div>
    );
};

export default MatchHistory;
