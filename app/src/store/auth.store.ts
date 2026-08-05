import { create } from "zustand";

import { AuthSession } from "@/schemas/auth.schema";
import { User } from "@/schemas/user.schema";
import { AuthStorage } from "@/storage/auth.storage";

type AuthState = {
  accessToken: string | null;
  tokenType: string | null;
  user: User | null;
  isAuthenticated: boolean;
};

type AuthActions = {
  login: (session: AuthSession) => Promise<void>;
  logout: () => Promise<void>;

  hydrate: () => Promise<void>;
  reset: () => void;
};

type AuthStore = AuthState & AuthActions;

const DEFAULT_STATE: AuthState = {
  accessToken: null,
  tokenType: null,
  user: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()((set) => ({
  ...DEFAULT_STATE,

  login: async (session) => {
    await AuthStorage.set(session);

    set({
      accessToken: session.access_token,
      tokenType: session.token_type,
      user: session.user,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await AuthStorage.clear();
    set(DEFAULT_STATE);
  },

  hydrate: async () => {
    const session = await AuthStorage.get();

    if (!session) return;

    set({
      accessToken: session.access_token,
      tokenType: session.token_type,
      user: session.user,
      isAuthenticated: true,
    });
  },

  reset: () => {
    set(DEFAULT_STATE);
  },
}));
