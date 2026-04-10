import React, { createContext, useContext, useEffect, useMemo, useState, useRef, FC, ReactNode } from 'react';
import { Preferences } from '@capacitor/preferences';
import { jwtDecode } from 'jwt-decode';
import API from '@api/api';

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

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [databaseId, setDatabaseId] = useState<number | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const logoutTimer = useRef<NodeJS.Timeout | null>(null);

  const clearLogoutTimer = () => {
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
      logoutTimer.current = null;
    }
  };

  const logout = async () => {
    clearLogoutTimer();

    // Fire-and-forget logout activity logging on the backend
    if (token && databaseId) {
      API.post("/auth/logout", { databaseId }).catch((err) => {
        console.warn("Logout activity log failed:", err);
      });
    }

    await Preferences.remove({ key: 'auth_token' });
    setToken(null);
    setDatabaseId(null);
    setRole(null);
  };

  const scheduleLogout = (expirationTime: number) => {
    clearLogoutTimer();
    const now = Math.floor(Date.now() / 1000);
    const timeout = (expirationTime - now) * 1000;

    if (timeout > 0) {
      logoutTimer.current = setTimeout(() => {
        console.log("Token expired during session. Logging out...");
        logout();
      }, timeout);
    } else {
      logout();
    }
  };

  useEffect(() => {
    const interceptor = API.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.log("Session expired (401). Logging out...");
          await logout();
        }
        return Promise.reject(error);
      }
    );

    async function loadAuth() {
      const { value } = await Preferences.get({ key: 'auth_token' });

      if (value) {
        try {
          const decoded: JwtPayload = jwtDecode(value);
          const now = Math.floor(Date.now() / 1000);
          
          if (decoded.exp < now) {
            console.log("Token already expired on load, removing...");
            await logout();
          } else {
            setToken(value);
            setDatabaseId(decoded.id);
            setRole(decoded.role);
            scheduleLogout(decoded.exp);
          }
        } catch (err) {
          console.log("Invalid token, removing...", err);
          await logout();
        }
      }

      setLoading(false);
    }

    loadAuth();

    return () => {
      clearLogoutTimer();
      API.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (newToken: string) => {
    await Preferences.set({ key: 'auth_token', value: newToken });

    const decoded: JwtPayload = jwtDecode(newToken);

    setToken(newToken);
    setDatabaseId(decoded.id);
    setRole(decoded.role);
    scheduleLogout(decoded.exp);
  };

  const authContextValue = useMemo(() => ({
    token, databaseId, role, loading, login, logout
  }), [token, databaseId, role, loading]);

  return (
    <AuthContext.Provider value={authContextValue}>
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