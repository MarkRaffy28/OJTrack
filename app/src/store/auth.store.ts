import { create } from "zustand";

import { AuthSession } from "@/schemas/auth.schema";
import { User } from "@/schemas/user.schema";
import { AuthStorage } from "@/storage/auth.storage";

type AuthState = {
  session: AuthSession | null;
  isHydrated: boolean;
};

type AuthActions = {
  login: (session: AuthSession) => Promise<void>;
  updateUser: (user: User) => void;
  logout: () => Promise<void>;

  hydrate: () => Promise<void>;
  reset: () => Promise<void>;
};

type AuthStore = AuthState & AuthActions;

const DEFAULT_STATE: AuthState = {
  session: null,
  isHydrated: false,
};

export const useAuthStore = create<AuthStore>()((set, get) => ({
  ...DEFAULT_STATE,

  login: async (session) => {
    await AuthStorage.set(session);

    set({
      session,
      isHydrated: true,
    });
  },

  updateUser: async (user) => {
    const session = get().session;

    if (!session) return;

    const updatedSession = {
      ...session,
      user,
    };

    await AuthStorage.set(updatedSession);

    set({
      session: updatedSession,
    });
  },

  logout: async () => {
    await AuthStorage.clear();

    set({
      ...DEFAULT_STATE,
      isHydrated: true,
    });
  },

  hydrate: async () => {
    const session = await AuthStorage.get();

    if (!session) {
      set({ isHydrated: true });

      return;
    }

    set({
      session,
      isHydrated: true,
    });
  },

  reset: async () => {
    await AuthStorage.clear();

    set({
      ...DEFAULT_STATE,
      isHydrated: true,
    });
  },
}));
export const useIsHydrated = () => useAuthStore((s) => s.isHydrated);
export const useAuthSession = () => useAuthStore((s) => s.session);
export const useAuthUser = () => useAuthStore((s) => s.session?.user);

export const useLogin = () => useAuthStore((s) => s.login);
export const useUpdateUser = () => useAuthStore((s) => s.updateUser);
export const useLogout = () => useAuthStore((s) => s.logout);
