import create from "zustand";
import { persist } from "zustand/middleware";

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
			// Custom serialization for persisting Set and profileId
			serialize: (state) => {
				const stateToSave = {
					...state,
					state: {
						...state.state,
						manuallyMarked: Object.fromEntries(
							Object.entries(state.state.manuallyMarked).map(([profileId, challenges]) => [
								profileId,
								Object.fromEntries(
									Object.entries(challenges).map(([challengeId, champions]) => [
										challengeId,
										Array.from(champions), // Convert Set to Array for serialization
									]),
								),
							]),
						),
					},
				};
				return JSON.stringify(stateToSave);
			},
			// Custom deserialization to restore Set from Array
			deserialize: (str) => {
				const stateFromStorage = JSON.parse(str);
				return {
					...stateFromStorage,
					state: {
						...stateFromStorage.state,
						manuallyMarked: Object.fromEntries(
							Object.entries(stateFromStorage.state.manuallyMarked).map(([profileId, challenges]) => [
								profileId,
								Object.fromEntries(
									Object.entries(challenges as Record<number, number[]>).map(
										([challengeId, champions]) => [
											challengeId,
											new Set(champions), // Convert Array back to Set for deserialization
										],
									),
								),
							]),
						),
					},
				};
			},
		},
	),
);
