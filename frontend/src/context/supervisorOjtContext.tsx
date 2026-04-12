import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, FC, ReactNode } from "react";
import { Preferences } from "@capacitor/preferences";
import { useAuth } from "./authContext";
import { useNetwork } from "./networkContext";
import API from "@api/api";

export interface SupervisorOjt {
  id: number; // student's user id
  fullName: string;
  profilePicture: string | null;
  ojtId: number;
  studentId: number;
  academicYear: string;
  term: string;
  requiredHours: number;
  renderedHours: number;
  status: "pending" | "ongoing" | "completed" | "dropped";
  startDate: string | null;
  endDate: string | null;
  program: string;
  year: number;
  section: string;
  officeName: string;
  isActive: boolean;
  supervisorNotes: string | null;
  progress: number;
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
  uniqueCohorts: { academicYear: string, term: string }[];
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  fetchAllOjts: () => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  selectOjt: (ojtId: number | null) => void;
  resetFilters: () => void;
  updateNotes: (ojtId: number, notes: string) => Promise<void>;
}

const SupervisorOjtContext = createContext<SupervisorOjtContextType | null>(null);

const CACHE_KEY_OJTS = "cached_supervisor_ojts";
const CACHE_KEY_STATS = "cached_supervisor_dashboard_stats";

export const SupervisorOjtProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { token, databaseId, role } = useAuth();
  const { isConnected } = useNetwork();
  
  const [allOjts, setAllOjts] = useState<SupervisorOjt[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentOjt, setCurrentOjt] = useState<SupervisorOjt | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoadedFromCache, setIsLoadedFromCache] = useState(false);
  const [hasTriedFetch, setHasTriedFetch] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    academicYear: "all",
    term: "all",
    search: "",
  });

  useEffect(() => {
    const loadCache = async () => {
      try {
        const [ojtsRes, statsRes] = await Promise.all([
          Preferences.get({ key: CACHE_KEY_OJTS }),
          Preferences.get({ key: CACHE_KEY_STATS })
        ]);
        
        if (ojtsRes.value) {
          setAllOjts(JSON.parse(ojtsRes.value));
        }
        if (statsRes.value) {
          setDashboardStats(JSON.parse(statsRes.value));
        }
      } catch (err) {
        console.error("Failed to load supervisor OJT cache", err);
      } finally {
        setIsLoadedFromCache(true);
      }
    };
    loadCache();
  }, []);

  const fetchAllOjts = useCallback(async () => {
    if (!token || !databaseId || role !== "supervisor") return;

    setLoading(true);

    try {
      const response = await API.get(`/ojts/supervisor/${databaseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const ojts: SupervisorOjt[] = response.data.map((ojt: any) => {
        if (ojt.profilePicture?.data) {
          const uint8Array = new Uint8Array(ojt.profilePicture.data);
          const decodedString = new TextDecoder().decode(uint8Array);
          ojt.profilePicture = decodedString;
        }
        ojt.progress = ojt.requiredHours > 0
          ? Math.min(100, Math.round((ojt.renderedHours / ojt.requiredHours) * 100))
          : 0;
        return ojt;
      });
      setAllOjts(ojts);

      await Preferences.set({
        key: CACHE_KEY_OJTS,
        value: JSON.stringify(ojts)
      });

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

      await Preferences.set({
        key: CACHE_KEY_STATS,
        value: JSON.stringify(response.data)
      });
      
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  }, [token, databaseId, role]);

  useEffect(() => {
    if (!token || !databaseId || role !== "supervisor") {
      setAllOjts([]);
      setCurrentOjt(null);
      setDashboardStats(null);
      setHasTriedFetch(false);
      return;
    }

    if (isLoadedFromCache && !hasTriedFetch) {
      setHasTriedFetch(true);
      if (isConnected) {
        fetchAllOjts();
        fetchDashboardStats();
      }
    }
  }, [token, databaseId, role, isLoadedFromCache, hasTriedFetch, isConnected, fetchAllOjts, fetchDashboardStats]);

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

  const updateNotes = useCallback(async (ojtId: number, notes: string) => {
    if (!token) return;
    try {
      await API.patch(`/ojts/${ojtId}/notes`, 
        { databaseId, notes }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedOjts = allOjts.map(o => o.ojtId === ojtId ? { ...o, supervisorNotes: notes } : o);
      setAllOjts(updatedOjts);

      await Preferences.set({
        key: CACHE_KEY_OJTS,
        value: JSON.stringify(updatedOjts)
      });

    } catch (err) {
      console.error("Failed to update supervisor notes:", err);
      throw err;
    }
  }, [token, allOjts, databaseId]);

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
      ? filteredOjts.reduce((acc, o) => acc + o.progress, 0) / filteredOjts.length
      : 0;

    return { ...counts, completionRate: Math.round(completionRate) };
  }, [filteredOjts]);

  const availableAcademicYears = useMemo(() => {
    const years = Array.from(new Set(allOjts.map(o => o.academicYear)));
    return years.sort((a, b) => b.localeCompare(a));
  }, [allOjts]);

  const availableTerms = useMemo(() => {
    const terms = Array.from(new Set(allOjts.map(o => o.term)));
    return terms.sort();
  }, [allOjts]);

  const uniqueCohorts = useMemo(() => {
    const map = new Map<string, { academicYear: string, term: string }>();
    allOjts.forEach(ojt => {
      const key = `${ojt.academicYear}|${ojt.term}`;
      if (!map.has(key)) {
        map.set(key, { academicYear: ojt.academicYear, term: ojt.term });
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      if (b.academicYear !== a.academicYear) {
         return b.academicYear.localeCompare(a.academicYear);
      }
      return b.term.localeCompare(a.term);
    });
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
      uniqueCohorts,
      setFilters,
      fetchAllOjts,
      fetchDashboardStats,
      selectOjt,
      resetFilters,
      updateNotes,
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
