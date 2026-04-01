import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./authContext";
import { useOjt } from "./ojtContext";
import API from "@api/api";

export interface StudentActivity {
  id: number;
  ojtId: number;
  action: string;
  targetType: string;
  targetId: number;
  description: string;
  createdAt: string; 
}

interface ActivityContextType {
  activities: StudentActivity[];
  getLatestActivities: (n: number) => StudentActivity[];
  loadingActivities: boolean;
  fetchActivities: () => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | null>(null);

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, databaseId } = useAuth();
  const { currentOjt } = useOjt();
  const [activities, setActivities] = useState<StudentActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    if (token && databaseId && currentOjt) {
      fetchActivities();
    }
  }, [token, databaseId, currentOjt]);

  const fetchActivities = async () => {
    if (!token || !databaseId || !currentOjt) return;

    setLoadingActivities(true);
    try {
      const { data } = await API.post("/users/fetch/student/activities", 
        { databaseId, ojtId: currentOjt.id }, 
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setActivities(data);
    } catch (err) {
      console.error("Failed to fetch activities", err);
    } finally {
      setLoadingActivities(false);
    }
  };

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
