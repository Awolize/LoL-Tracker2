import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import MatchItem from "./match-history-item";
import { type CompleteMatch } from "./server-processing-helpers";

const MatchHistory = ({ matches }: { matches: CompleteMatch[] }) => {
    if (!matches.length)
        return (
            <Sheet>
                <SheetTrigger asChild>
                    <Button>Match History</Button>
                </SheetTrigger>
                <SheetContent className="w-[1100px] flex flex-col sm:max-w-none">
                    <SheetHeader>
                        <SheetTitle className="text-center">Match history</SheetTitle>
                        <SheetDescription className="text-center">
                            If this is empty don't forget to press the update button!
                            <br />
                            This can take a LONG time but you should start seeing your latest games in a few minutes.
                        </SheetDescription>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
        );

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button>Match History</Button>
            </SheetTrigger>
            <SheetContent className="w-[1100px] flex flex-col sm:max-w-none">
                <SheetHeader>
                    <SheetTitle className="text-center">Match history</SheetTitle>
                    <SheetDescription className="text-center">
                        Remember to click the update button to receive the latest list of matches.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="rounded-md border">
                    <div className="flex flex-col p-4 gap-6">
                        {matches.map((match) => {
                            return <MatchItem key={match.gameId} match={match} />;
                        })}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};

export default MatchHistory;
