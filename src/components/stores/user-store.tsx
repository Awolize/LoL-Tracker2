import type { Summoner } from "@prisma/client";
import type React from "react";
import { createContext, useContext, useRef } from "react";
import { createStore, useStore } from "zustand";

interface Store {
	user: Summoner;
}

interface StoreState extends Store {
	setUser: (newUser: Summoner) => void;
}

const createUserStore = (initProps: Store) => {
	return createStore<StoreState>()((set) => ({
		...initProps,
		setUser: (newUser) => set((state) => ({ ...state, user: newUser })),
	}));
};

type UserStore = ReturnType<typeof createUserStore>;
const UserContext = createContext<UserStore | null>(null);

type UserProviderProps = React.PropsWithChildren<Store>;

export function UserProvider({ children, ...props }: UserProviderProps) {
	const storeRef = useRef<UserStore>(null);
	if (!storeRef.current) {
		storeRef.current = createUserStore(props);
	}

	return <UserContext.Provider value={storeRef.current}>{children}</UserContext.Provider>;
}

export function useUserContext<T>(selector: (state: StoreState) => T): T {
	const store = useContext(UserContext);
	if (!store) throw new Error("Missing UserContext.Provider in the tree");
	return useStore(store, selector);
}
