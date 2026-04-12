import React, { createContext, useContext, useEffect, useState, useCallback, FC, ReactNode } from "react";
import { Preferences } from "@capacitor/preferences";
import { useAuth } from "./authContext";
import { useNetwork } from "./networkContext";
import { useOjt } from "./ojtContext";
import API from "@api/api";

export interface UserActivity {
  id: number;
  fullName?: string;
  ojtId: number;
  action: string;
  targetType: string;
  targetId: number;
  description: string;
  createdAt: string; 
}

interface ActivityContextType {
  activities: UserActivity[];
  getLatestActivities: (n: number) => UserActivity[];
  loadingActivities: boolean;
  fetchActivities: () => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | null>(null);

const CACHE_KEY = "cached_activities";

export const ActivityProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { token, databaseId, role } = useAuth();
  const { currentOjt } = useOjt();
  const { isConnected } = useNetwork();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [isLoadedFromCache, setIsLoadedFromCache] = useState(false);

  const fetchActivities = useCallback(async () => {
    if (!token || !databaseId) return;

    setLoadingActivities(true);
    try {
      const params: any = { databaseId, role };
      if (role === 'student' && currentOjt?.id) {
        params.ojtId = currentOjt.id;
      }

      const { data } = await API.get("/activities", { 
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      setActivities(data);

      await Preferences.set({ 
        key: CACHE_KEY, 
        value: JSON.stringify(data) 
      });
      
    } catch (err) {
      console.error("Failed to fetch activities", err);
    } finally {
      setLoadingActivities(false);
    }
  }, [token, databaseId, role, currentOjt?.id]);

  useEffect(() => {
    const loadCache = async () => {
      try {
        const { value } = await Preferences.get({ key: CACHE_KEY });
        if (value) {
          setActivities(JSON.parse(value));
        }
      } catch (err) {
        console.error("Failed to load activities cache", err);
      } finally {
        setIsLoadedFromCache(true);
      }
    };
    loadCache();
  }, []);

  useEffect(() => {
    if (!token || !databaseId) {
      setActivities([]);
      return;
    }

    if (isLoadedFromCache) {
      if (role === 'student' && !currentOjt?.id) return;
      
      // Fetch if empty AND connected
      if (activities.length === 0 && isConnected) {
        fetchActivities();
      }
    }
  }, [token, databaseId, currentOjt?.id, role, isLoadedFromCache, activities.length, isConnected, fetchActivities]);


  const getLatestActivities = (n: number) => {
    return activities.slice(0, n);
  };

  return (
    <ActivityContext.Provider value={{ activities, getLatestActivities, loadingActivities, fetchActivities }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) throw new Error("useActivity must be used inside ActivityProvider");
  return context;
};
