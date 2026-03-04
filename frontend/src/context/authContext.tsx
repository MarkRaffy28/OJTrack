import React, { createContext, useContext, useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { jwtDecode } from 'jwt-decode';

type Role = "student" | "supervisor" | "admin";

interface JwtPayload {
  id: number,
  role: Role;
  exp: number;
}

interface AuthContextType {
  token: string | null;
  databaseId: number | null;
  role: Role | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [databaseId, setDatabaseId] = useState<number | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token on app start
  useEffect(() => {
    async function loadAuth() {
      const { value } = await Preferences.get({ key: 'auth_token' });

      if (value) {
        const decoded: JwtPayload = jwtDecode(value);
        setToken(value);
        setDatabaseId(decoded.id);
        setRole(decoded.role);
      }

      setLoading(false);
    }

    loadAuth();
  }, []);

  const login = async (newToken: string) => {
    await Preferences.set({ key: 'auth_token', value: newToken });

    const decoded: JwtPayload = jwtDecode(newToken);

    setToken(newToken);
    setDatabaseId(decoded.id);
    setRole(decoded.role);
  };

  const logout = async () => {
    await Preferences.remove({ key: 'auth_token' });
    setToken(null);
    setDatabaseId(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, databaseId, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};