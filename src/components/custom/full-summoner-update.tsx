import type { Summoner } from "@prisma/client";
import { api } from "~/trpc/react";
import { LoadingComponent } from "../old/loading-spinner";
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
					? "bg-linear-to-r from-indigo-500 to-purple-500"
					: "w-16 bg-linear-to-r from-purple-500 to-indigo-500"
			} relative my-2 inline-flex w-24 items-center justify-center rounded px-3 py-1`}
			onClick={updateUser}
		>
			{updateChampions.isLoading ? <LoadingComponent /> : "Update"}
		</Button>
	);
};
