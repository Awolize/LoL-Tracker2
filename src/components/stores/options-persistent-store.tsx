import React, { createContext, useContext, useRef } from "react";
import superjson from "superjson";
import { create, useStore } from "zustand";
import { PersistStorage, persist } from "zustand/middleware";
import { SortOrder2 } from "../custom/header";
interface Store {
    showMasteryPoints: boolean;
    showAvailableChests: boolean;
    showLevels: boolean;
    byRole: boolean;
    filterPoints: number;
    selectedChampions: Set<number>;
    championsScale: number;
    sortOrder: number;
    showSelectedChampions: boolean;
}

interface StoreState extends Store {
    toggleMasteryPoints: () => void;
    toggleAvailableChests: () => void;
    toggleLevels: () => void;
    toggleSortedByRole: () => void;
    setFilterPoints: (newFilter: number) => void;
    setSortOrder: (newFilter: SortOrder2) => void;
    toggleSelectedChampion: (championId: number) => void;
    toggleShowSelectedChampions: () => void;
    setChampionsScale: (newScaleValue: number) => void;
}

const initialState = {
    showMasteryPoints: true,
    showAvailableChests: false,
    showLevels: true,
    byRole: true,
    filterPoints: Number.MAX_SAFE_INTEGER,
    selectedChampions: new Set<number>(),
    championsScale: 85,
    sortOrder: SortOrder2.Points,
    showSelectedChampions: false,
};

// const useOptionsStore: (persistName: string) => UseBoundStore<StoreApi<StoreState>>
// const useOptionsStore: (persistName: string) => UseBoundStore<Write<StoreApi<StoreState>, StorePersist<StoreState, Store>>>

export const useOptionsPersistentStore = (persistName: string) => {
    console.log(persistName);

    return create<StoreState>()(
        persist(
            (set) => ({
                ...initialState,
                toggleMasteryPoints: () => set((state) => ({ ...state, showMasteryPoints: !state.showMasteryPoints })),
                toggleAvailableChests: () =>
                    set((state) => ({ ...state, showAvailableChests: !state.showAvailableChests })),
                toggleLevels: () => set((state) => ({ ...state, showLevels: !state.showLevels })),
                toggleSortedByRole: () => set((state) => ({ ...state, byRole: !state.byRole })),
                toggleShowSelectedChampions: () =>
                    set((state) => ({ ...state, showSelectedChampions: !state.showSelectedChampions })),
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
            }),
            { name: persistName, storage },
        ),
    );
};

const storage: PersistStorage<Store> = {
    getItem: (name) => {
        const str = localStorage.getItem(name);
        if (!str) return null;
        return superjson.parse(str);
    },
    setItem: (name, value) => {
        localStorage.setItem(name, superjson.stringify(value));
    },
    removeItem: (name) => localStorage.removeItem(name),
};

type OptionsStore = ReturnType<typeof useOptionsPersistentStore>;
const OptionsContext = createContext<OptionsStore | null>(null);

type OptionsProviderProps = React.PropsWithChildren<{ persistName: string }>;

export function OptionsProvider({ children, persistName }: OptionsProviderProps) {
    const storeRef = useRef<OptionsStore>();
    if (!storeRef.current) {
        storeRef.current = useOptionsPersistentStore(persistName);
    }

    return <OptionsContext.Provider value={storeRef.current}>{children}</OptionsContext.Provider>;
}

export function useOptionsPersistentContext<T>(selector: (state: StoreState) => T): T {
    const store = useContext(OptionsContext);
    if (!store) throw new Error("Missing OptionsContext.Provider in the tree");
    return useStore(store, selector);
}
