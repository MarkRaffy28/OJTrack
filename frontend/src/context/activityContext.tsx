import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./authContext";
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

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, databaseId, role } = useAuth();
  const { currentOjt } = useOjt();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    if (token && databaseId) {
      if (role === 'student' && !currentOjt?.id) return;
      fetchActivities();
    }
  }, [token, databaseId, currentOjt?.id, role]);

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
    } catch (err) {
      console.error("Failed to fetch activities", err);
    } finally {
      setLoadingActivities(false);
    }
  }, [token, databaseId, role, currentOjt?.id]);

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
