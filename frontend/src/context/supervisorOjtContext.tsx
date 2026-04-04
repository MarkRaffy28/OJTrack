import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "./authContext";
import API from "@api/api";

export interface SupervisorOjt {
  id: number; // student's user id
  fullName: string;
  ojtId: number;
  studentId: number;
  academicYear: string;
  term: string;
  requiredHours: number;
  renderedHours: number;
  status: "pending" | "ongoing" | "completed" | "dropped";
  startDate: string | null;
  endDate: string | null;
}

interface DashboardStats {
  pendingReports: number;
  activeToday: number;
}

interface FilterOptions {
  status: string;
  academicYear: string;
  term: string;
  search: string;
}

interface Stats {
  total: number;
  ongoing: number;
  pending: number;
  completed: number;
  dropped: number;
  completionRate: number; // Average percentage across all students
}

interface SupervisorOjtContextType {
  allOjts: SupervisorOjt[];
  filteredOjts: SupervisorOjt[];
  currentOjt: SupervisorOjt | null;
  loading: boolean;
  filters: FilterOptions;
  stats: Stats;
  dashboardStats: DashboardStats | null;
  availableAcademicYears: string[];
  availableTerms: string[];
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  fetchAllOjts: () => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  selectOjt: (ojtId: number | null) => void;
  resetFilters: () => void;
}

const SupervisorOjtContext = createContext<SupervisorOjtContextType | null>(null);

export const SupervisorOjtProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, databaseId, role } = useAuth();
  
  const [allOjts, setAllOjts] = useState<SupervisorOjt[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentOjt, setCurrentOjt] = useState<SupervisorOjt | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    academicYear: "all",
    term: "all",
    search: "",
  });

  const fetchAllOjts = useCallback(async () => {
    if (!token || !databaseId || role !== "supervisor") return;

    setLoading(true);

    try {
      const response = await API.get(`/ojts/supervisor/${databaseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const ojts: SupervisorOjt[] = response.data;
      setAllOjts(ojts);

      if (ojts.length > 0) {
        let latestOjt = ojts[0];
        for (let i = 1; i < ojts.length; i++) {
          if (ojts[i].academicYear > latestOjt.academicYear) {
            latestOjt = ojts[i];
          } else if (ojts[i].academicYear === latestOjt.academicYear) {
            if (ojts[i].term > latestOjt.term) {
              latestOjt = ojts[i];
            }
          }
        }
        setFilters(prev => ({
          ...prev,
          academicYear: latestOjt.academicYear,
          term: latestOjt.term
        }));
      } else {
        setFilters(prev => ({
          ...prev,
          academicYear: "all",
          term: "all"
        }));
      }
    } catch (err) {
      console.error("Failed to fetch supervisor OJTs:", err);
    } finally {
      setLoading(false);
    }
  }, [token, databaseId, role]);

  const fetchDashboardStats = useCallback(async () => {
    if (!token || !databaseId || role !== "supervisor") return;

    try {
      const response = await API.get(`/supervisor/dashboard/${databaseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardStats(response.data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  }, [token, databaseId, role]);

  useEffect(() => {
    if (token && databaseId && role === "supervisor") {
      fetchAllOjts();
      fetchDashboardStats();
    }
  }, [token, databaseId, role, fetchAllOjts, fetchDashboardStats]);

  const selectOjt = (ojtId: number | null) => {
    if (ojtId === null) {
      setCurrentOjt(null);
      return;
    }
    const ojt = allOjts.find(o => o.ojtId === ojtId);
    if (ojt) {
      setCurrentOjt(ojt);
    }
  };

  const resetFilters = () => {
    setFilters({
      status: "all",
      academicYear: "all",
      term: "all",
      search: "",
    });
  };

  const filteredOjts = useMemo(() => {
    return allOjts.filter(ojt => {
      const matchesStatus = filters.status === "all" || ojt.status === filters.status;
      const matchesYear = filters.academicYear === "all" || ojt.academicYear === filters.academicYear;
      const matchesTerm = filters.term === "all" || ojt.term === filters.term;
      
      const searchLower = filters.search.toLowerCase();
      const fullNameLower = ojt.fullName.toLowerCase();
      const matchesSearch = filters.search === "" ||
        fullNameLower.includes(searchLower) ||
        ojt.studentId.toString().includes(searchLower);
      
      return matchesStatus && matchesYear && matchesTerm && matchesSearch;
    });
  }, [allOjts, filters]);

  const stats = useMemo(() => {
    const counts = {
      total: filteredOjts.length,
      ongoing:   filteredOjts.filter(o => o.status === "ongoing"  ).length,
      pending:   filteredOjts.filter(o => o.status === "pending"  ).length,
      completed: filteredOjts.filter(o => o.status === "completed").length,
      dropped:   filteredOjts.filter(o => o.status === "dropped"  ).length,
    };

    const completionRate = filteredOjts.length > 0 
      ? filteredOjts.reduce((acc, o) => acc + (o.renderedHours / o.requiredHours), 0) / filteredOjts.length 
      : 0;

    return { ...counts, completionRate: Math.round(completionRate * 100) };
  }, [filteredOjts]);

  const availableAcademicYears = useMemo(() => {
    const years = Array.from(new Set(allOjts.map(o => o.academicYear)));
    return years.sort((a, b) => b.localeCompare(a));
  }, [allOjts]);

  const availableTerms = useMemo(() => {
    const terms = Array.from(new Set(allOjts.map(o => o.term)));
    return terms.sort();
  }, [allOjts]);

  return (
    <SupervisorOjtContext.Provider value={{
      allOjts,
      filteredOjts,
      currentOjt,
      loading,
      filters,
      stats,
      dashboardStats,
      availableAcademicYears,
      availableTerms,
      setFilters,
      fetchAllOjts,
      fetchDashboardStats,
      selectOjt,
      resetFilters,
    }}>
      {children}
    </SupervisorOjtContext.Provider>
  );
};

export const useSupervisorOjt = () => {
  const context = useContext(SupervisorOjtContext);
  if (!context) {
    throw new Error("useSupervisorOjt must be used within a SupervisorOjtProvider");
  }
  return context;
};
