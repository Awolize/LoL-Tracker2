import { Summoner } from "@prisma/client";
import { api } from "~/trpc/react";
import LoadingComponent from "../old/loading-spinner";
import { Button } from "../ui/button";

export const FullSummonerUpdate = ({ user }: { user: Summoner }) => {
    const utils = api.useUtils();

    const updateChampions = api.processingApi.fullUpdateSummoner.useMutation({
        onSuccess() {
            utils.invalidate();
        },
    });

    const updateUser = async () => {
        if (user.gameName && user.tagLine) {
            updateChampions.mutate({
                gameName: user.gameName,
                tagLine: user.tagLine,
                region: user.region,
            });
        }
    };
    return (
        <Button
            variant="secondary"
            size={"sm"}
            className={`${
                !updateChampions.isLoading
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                    : "bg-gradient-to-r from-purple-500 to-indigo-500 w-16"
            } relative inline-flex my-2 py-1 px-3 items-center justify-center rounded w-24`}
            onClick={updateUser}
        >
            {updateChampions.isLoading ? <LoadingComponent /> : "Update"}
        </Button>
    );
};
