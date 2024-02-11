import { ScrollArea } from "~/components/ui/scroll-area";
import MatchItem from "./match-history-item";
import { type CompleteMatch } from "./server-processing-helpers";

const MatchHistory = ({ matches }: { matches: CompleteMatch[] }) => {
    return (
        <ScrollArea className="rounded-md border">
            <div className="flex flex-col p-4 gap-6">
                {matches.map((match) => {
                    return <MatchItem key={match.gameId} match={match} />;
                })}
            </div>
        </ScrollArea>
    );
};

export default MatchHistory;
