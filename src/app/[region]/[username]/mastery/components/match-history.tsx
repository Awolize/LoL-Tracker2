// ChampionList.jsx
import MatchItem from "./match-history-item";
import { type CompleteMatch } from "./server-processing-helpers";

const MatchHistory = ({ matches }: { matches: CompleteMatch[] }) => {
    return (
        <div className="flex flex-col gap-6 pr-4">
            {matches.map((match) => {
                return <MatchItem key={match.gameId} match={match} />;
            })}
        </div>
    );
};

export default MatchHistory;
