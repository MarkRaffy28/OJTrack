import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthSession } from "@/schemas/auth.schema";

const KEY = "auth_session";

export const AuthStorage = {
  get: async () => {
    const value = await AsyncStorage.getItem(KEY);
    return value ? (JSON.parse(value) as AuthSession) : null;
  },

  set: async (session: AuthSession) =>
    await AsyncStorage.setItem(KEY, JSON.stringify(session)),

  clear: async () => await AsyncStorage.removeItem(KEY),
};
