import React, { createContext, useContext, useEffect, useState, FC, ReactNode } from 'react';
import { useAuth } from './authContext';
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

export const isStudent = (user: User | null): user is StudentUser => user?.role === 'student';
export const isSupervisor = (user: User | null): user is SupervisorUser => user?.role === 'supervisor';
export const isAdmin = (user: User | null): user is AdminUser => user?.role === 'admin';

export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
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