import * as SecureStore from "expo-secure-store";
import { AuthSession } from "@/schemas/auth.schema";

const KEY = "auth_session";

export const AuthStorage = {
  get: async () => {
    const value = await SecureStore.getItemAsync(KEY);
    return value ? (JSON.parse(value) as AuthSession) : null;
  },

  set: async (session: AuthSession) =>
    await SecureStore.setItemAsync(KEY, JSON.stringify(session)),

  clear: async () => await SecureStore.deleteItemAsync(KEY),
};
