import React, { createContext, useContext, useEffect, useState, FC, ReactNode } from 'react';
import { Preferences } from '@capacitor/preferences';
import { useAuth } from './authContext';
import { useNetwork } from './networkContext';
import API from '@api/api';

interface BaseUser {
  databaseId: number;
  username: string;
  profilePicture: string;
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  fullName: string;
  userId: string;
  birthDate: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  contactNumber: string;
  emailAddress: string;
  isEmailVerified: boolean;
  role: 'student' | 'supervisor' | 'admin';
}

interface StudentUser extends BaseUser {
  role: 'student';
  year: number;
  program: string;
  major: string;
  section: string;
}

interface SupervisorUser extends BaseUser {
  role: 'supervisor';
  officeId: number;
  officeName: string;
  position: string;
}

interface AdminUser extends BaseUser {
  role: 'admin';
}

type User = StudentUser | SupervisorUser | AdminUser;

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

const CACHE_KEY = "cached_user_profile";

export const isStudent = (user: User | null): user is StudentUser => user?.role === 'student';
export const isSupervisor = (user: User | null): user is SupervisorUser => user?.role === 'supervisor';
export const isAdmin = (user: User | null): user is AdminUser => user?.role === 'admin';

export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { databaseId, token, role } = useAuth();
  const { isConnected } = useNetwork();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [isLoadedFromCache, setIsLoadedFromCache] = useState(false);

  useEffect(() => {
    const loadCache = async () => {
      try {
        const { value } = await Preferences.get({ key: CACHE_KEY });
        if (value) {
          setUser(JSON.parse(value));
        }
      } catch (err) {
        console.error("Failed to load user cache", err);
      } finally {
        setIsLoadedFromCache(true);
      }
    };
    loadCache();
  }, []);

  const fetchUser = async () => {
    if (!databaseId || !token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await API.get(`/users/${role}/${databaseId}/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data;

      if (data.profilePicture?.data) {
        const uint8Array = new Uint8Array(data.profilePicture.data);
        const decodedString = new TextDecoder().decode(uint8Array);
        data.profilePicture = decodedString;
      }
      setUser(data);
      setHasFetched(true);

      await Preferences.set({
        key: CACHE_KEY,
        value: JSON.stringify(data)
      });

    } catch (error) {
      console.error('Failed to fetch user', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!databaseId || !token) {
      setUser(null);
      setLoading(false);
      return;
    }

    if (isLoadedFromCache && !hasFetched) {
      if (isConnected) {
        fetchUser();
      } else {
        setLoading(false);
      }
    }
  }, [databaseId, token, isLoadedFromCache, isConnected, hasFetched]);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }
  return context;
};