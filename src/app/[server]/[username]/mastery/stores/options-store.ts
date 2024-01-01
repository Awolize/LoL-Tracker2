import { create } from "zustand";
import { SortOrder2 } from "../components/header";

type Store = {
    showMasteryPoints: boolean;
    showAvailableChests: boolean;
    showLevels: boolean;
    byRole: boolean;
    filterPoints: number;
    selectedChampions: Set<number>;
    championsScale: number;
    sortOrder: number;
    toggleMasteryPoints: () => void;
    toggleAvailableChests: () => void;
    toggleLevels: () => void;
    toggleSortedByRole: () => void;
    setFilterPoints: (newFilter: number) => void;
    setSortOrder: (newFilter: SortOrder2) => void;
    toggleSelectedChampion: (championId: number) => void;
    setChampionsScale: (newScaleValue: number) => void;
};

export const useOptionsStore = create<Store>()((set) => ({
    showMasteryPoints: true,
    showAvailableChests: false,
    showLevels: false,
    byRole: true,
    filterPoints: Number.MAX_SAFE_INTEGER,
    selectedChampions: new Set<number>(),
    championsScale: 85,
    sortOrder: SortOrder2.Points,
    toggleMasteryPoints: () => set((state) => ({ ...state, showMasteryPoints: !state.showMasteryPoints })),
    toggleAvailableChests: () => set((state) => ({ ...state, showAvailableChests: !state.showAvailableChests })),
    toggleLevels: () => set((state) => ({ ...state, showLevels: !state.showLevels })),
    toggleSortedByRole: () => set((state) => ({ ...state, byRole: !state.byRole })),
    setFilterPoints: (newFilter) => set((state) => ({ ...state, filterPoints: newFilter })),
    setSortOrder: (newSortOrder) => set((state) => ({ ...state, sortOrder: newSortOrder })),
    toggleSelectedChampion: (championId) =>
        set((state) => {
            state.selectedChampions.has(championId)
                ? state.selectedChampions.delete(championId)
                : state.selectedChampions.add(championId);
            return { ...state };
        }),
    setChampionsScale: (newScaleValue) => set((state) => ({ ...state, championsScale: newScaleValue })),
}));
