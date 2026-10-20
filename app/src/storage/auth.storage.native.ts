import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthSession } from "@/schemas/auth.schema";

const KEY = "auth_session";
const PROFILE_PICTURE_KEY = "auth_profile_picture";

const withoutProfilePicture = (session: AuthSession): AuthSession => ({
  ...session,
  user: {
    ...session.user,
    profilePicture: null,
  },
});

const storeProfilePicture = async (profilePicture: string | null) => {
  if (profilePicture) {
    await AsyncStorage.setItem(PROFILE_PICTURE_KEY, profilePicture);
  } else {
    await AsyncStorage.removeItem(PROFILE_PICTURE_KEY);
  }
};

export const AuthStorage = {
  get: async () => {
    const value = await SecureStore.getItemAsync(KEY);
    if (!value) return null;

    const session = JSON.parse(value) as AuthSession;
    const storedProfilePicture = await AsyncStorage.getItem(PROFILE_PICTURE_KEY);
    const profilePicture = session.user.profilePicture ?? storedProfilePicture;

    // Migrate sessions written before profile pictures were stored separately.
    if (session.user.profilePicture) {
      await storeProfilePicture(session.user.profilePicture);
      await SecureStore.setItemAsync(KEY, JSON.stringify(withoutProfilePicture(session)));
    }

    return {
      ...session,
      user: {
        ...session.user,
        profilePicture,
      },
    };
  },

  set: async (session: AuthSession) => {
    await storeProfilePicture(session.user.profilePicture);
    await SecureStore.setItemAsync(KEY, JSON.stringify(withoutProfilePicture(session)));
  },

  clear: async () => {
    await SecureStore.deleteItemAsync(KEY);
    await AsyncStorage.removeItem(PROFILE_PICTURE_KEY);
  },
};
