import superjson from "superjson";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ChampionStore {
	manuallyMarked: Record<string, Record<number, Set<number>>>; // Record<profileId, Record<challengeId, Set<championId>>>
	markChampion: (profileId: string, challengeId: number, championId: number) => void;
	unmarkChampion: (profileId: string, challengeId: number, championId: number) => void;
}

export const useChampionStore = create<ChampionStore>()(
	persist(
		(set) => ({
			manuallyMarked: {},
			markChampion: (profileId, challengeId, championId) => {
				set((state) => {
					const profileData = state.manuallyMarked[profileId] || {};
					const currentSet = profileData[challengeId] || new Set<number>();
					currentSet.add(championId);

					return {
						manuallyMarked: {
							...state.manuallyMarked,
							[profileId]: {
								...profileData,
								[challengeId]: currentSet,
							},
						},
					};
				});
			},
			unmarkChampion: (profileId, challengeId, championId) => {
				set((state) => {
					const profileData = state.manuallyMarked[profileId];
					if (profileData) {
						const currentSet = profileData[challengeId];
						if (currentSet) {
							currentSet.delete(championId);
							return {
								manuallyMarked: {
									...state.manuallyMarked,
									[profileId]: {
										...profileData,
										[challengeId]: currentSet,
									},
								},
							};
						}
					}
					return state;
				});
			},
		}),
		{
			name: "different-challenge-manually-marked-champion-storage",
			storage: createJSONStorage(() => localStorage, {
				replacer: (key, value) => superjson.stringify(value),
				reviver: (key, value) => superjson.parse(value as any),
			}),
		},
	),
);
