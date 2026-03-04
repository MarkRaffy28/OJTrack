// UserContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './authContext';
import API from '../api/api';

interface BaseUser {
  id: number;
  username: string;
  profilePicture: string;
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  userId: string;
  birthDate: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  contactNumber: string;
  emailAddress: string;
  role: 'user' | 'supervisor' | 'admin';
}

interface StudentUser extends BaseUser {
  role: 'user';
  yearLevel: number;
  program: string;
  major: string;
}

interface SupervisorUser extends BaseUser {
  role: 'supervisor';
  officeId: number;
  officeName: string;
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

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { databaseId, token, role } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    if (!databaseId || !token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await API.post(`/users/fetch/${role}`,
        { databaseId: databaseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data;

      if (data.profilePicture?.data) {
        const uint8Array = new Uint8Array(data.profilePicture.data);
        const decodedString = new TextDecoder().decode(uint8Array);
        data.profilePicture = decodedString;
      }
      setUser(data);

    } catch (error) {
      console.error('Failed to fetch user', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [databaseId, token]);

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