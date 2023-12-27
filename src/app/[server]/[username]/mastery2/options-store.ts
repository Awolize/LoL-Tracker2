import { create } from "zustand";

type Store = {
    showMasteryPoints: boolean;
    showAvailableChests: boolean;
    showLevels: boolean;
    byRole: boolean;
    filterPoints: number;
    selectedChampions: Set<number>;
    championsScale: number;
    toggleMasteryPoints: () => void;
    toggleAvailableChests: () => void;
    toggleLevels: () => void;
    toggleSortedByRole: () => void;
    setFilterPoints: (newFilter: number) => void;
    toggleSelectedChampion: (championId: number) => void;
    setChampionsScale: (newScaleValue: number) => void;
};

export const useOptionsStore = create<Store>()((set) => ({
    showMasteryPoints: false,
    showAvailableChests: false,
    showLevels: false,
    byRole: true,
    filterPoints: 999999,
    selectedChampions: new Set<number>(),
    championsScale: 85,
    toggleMasteryPoints: () => set((state) => ({ ...state, showMasteryPoints: !state.showMasteryPoints })),
    toggleAvailableChests: () => set((state) => ({ ...state, showAvailableChests: !state.showAvailableChests })),
    toggleLevels: () => set((state) => ({ ...state, showLevels: !state.showLevels })),
    toggleSortedByRole: () => set((state) => ({ ...state, byRole: !state.byRole })),
    setFilterPoints: (newFilter) => set((state) => ({ ...state, filterPoints: newFilter })),
    toggleSelectedChampion: (championId) =>
        set((state) => {
            state.selectedChampions.has(championId)
                ? state.selectedChampions.delete(championId)
                : state.selectedChampions.add(championId);
            return { ...state };
        }),
    setChampionsScale: (newScaleValue) => set((state) => ({ ...state, championsScale: newScaleValue })),
}));
