import { create } from "zustand";

interface OptionsState {
    showMatchHistory: boolean;
    setShowMatchHistory: (newValue: boolean) => void;
    toggleShowMatchHistory: () => void;
}

export const useMatchHistoryStore = create<OptionsState>()((set) => ({
    showMatchHistory: false,
    setShowMatchHistory: (newValue) => set((state) => ({ ...state, showMatchHistory: newValue })),
    toggleShowMatchHistory: () => set((state) => ({ ...state, showMatchHistory: !state.showMatchHistory })),
}));
