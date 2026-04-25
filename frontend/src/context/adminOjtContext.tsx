import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, FC, ReactNode } from "react";
import { Preferences } from "@capacitor/preferences";
import { useAuth } from "./authContext";
import API from "@api/api";

export interface AdminTrainee {
  databaseId: number;
  traineeId: string;
  fullName: string;
  profilePicture?: string | null;
  startDate?: string | null;
  status: "pending" | "ongoing" | "completed" | "dropped";
  academicYear?: string | null;
  term?: string | null;
  officeId?: number | null;
  officeName?: string | null;
  supervisorId?: number | null;
  ojtId?: number | null;
  requiredHours?: number | null;
  renderedHours?: number | null;
}

export interface CohortOption {
  academicYear: string;
  term: string;
}

export interface OfficeOption {
  id: number;
  name: string;
}

export interface AdminTraineeFilters {
  search: string;
  status: string;
  cohort: string;
  officeId: string;
  sort: "nameAsc" | "nameDesc" | "startNewest" | "startOldest";
  assignment: "all" | "assigned" | "unassigned";
}

interface AdminTraineeStats {
  total: number;
  active: number;
  assigned: number;
  officesCount: number;
  activeRate: number;
}

interface AdminOjtContextType {
  loading: boolean;
  allTrainees: AdminTrainee[];
  visibleTrainees: AdminTrainee[];
  cohorts: CohortOption[];
  offices: OfficeOption[];
  filters: AdminTraineeFilters;
  stats: AdminTraineeStats;
  setFilters: React.Dispatch<React.SetStateAction<AdminTraineeFilters>>;
  setSearchInput: (value: string) => void;
  fetchTrainees: () => Promise<void>;
  resetFilters: () => void;
}

const CACHE_KEY_ADMIN_TRAINEES = "cached_admin_trainees";
const CACHE_KEY_ADMIN_FILTER_META = "cached_admin_filter_meta";

const AdminOjtContext = createContext<AdminOjtContextType | null>(null);

const decodeProfilePicture = (profilePicture: any): string | null => {
  if (!profilePicture) return null;
  if (typeof profilePicture === "string") return profilePicture;
  if (profilePicture?.data && Array.isArray(profilePicture.data)) {
    const uint8Array = new Uint8Array(profilePicture.data);
    return new TextDecoder().decode(uint8Array);
  }
  return null;
};

const DEFAULT_FILTERS: AdminTraineeFilters = {
  search: "",
  status: "all",
  cohort: "all",
  officeId: "all",
  sort: "nameAsc",
  assignment: "all",
};

export const AdminOjtProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { token, databaseId, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [allTrainees, setAllTrainees] = useState<AdminTrainee[]>([]);
  const [cohorts, setCohorts] = useState<CohortOption[]>([]);
  const [offices, setOffices] = useState<OfficeOption[]>([]);
  const [filters, setFilters] = useState<AdminTraineeFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    const loadCache = async () => {
      try {
        const [traineesRes, metaRes] = await Promise.all([
          Preferences.get({ key: CACHE_KEY_ADMIN_TRAINEES }),
          Preferences.get({ key: CACHE_KEY_ADMIN_FILTER_META }),
        ]);

        if (traineesRes.value) {
          setAllTrainees(JSON.parse(traineesRes.value));
        }

        if (metaRes.value) {
          const parsed = JSON.parse(metaRes.value);
          setCohorts(parsed.cohorts || []);
          setOffices(parsed.offices || []);
        }
      } catch (error) {
        console.error("Failed to load admin trainees cache:", error);
      }
    };

    loadCache();
  }, []);

  const fetchTrainees = useCallback(async () => {
    if (!token || !databaseId || role !== "admin") return;
    setLoading(true);

    try {
      const { data } = await API.get(`/ojts/admin/${databaseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const normalized: AdminTrainee[] = (data || []).map((item: any) => ({
        ...item,
        profilePicture: decodeProfilePicture(item.profilePicture),
      }));

      const fetchedCohorts: CohortOption[] = Array.from(
        new Map(
          normalized
            .filter((item) => item.academicYear && item.term)
            .map((item) => [`${item.academicYear}|${item.term}`, { academicYear: item.academicYear as string, term: item.term as string }])
        ).values()
      ).sort((a, b) => b.academicYear.localeCompare(a.academicYear) || b.term.localeCompare(a.term));

      const fetchedOffices: OfficeOption[] = Array.from(
        new Map(
          normalized
            .filter((item) => item.officeId && item.officeName)
            .map((item) => [item.officeId, { id: item.officeId as number, name: item.officeName as string }])
        ).values()
      ).sort((a, b) => a.name.localeCompare(b.name));

      setAllTrainees(normalized);
      setCohorts(fetchedCohorts);
      setOffices(fetchedOffices);

      await Promise.all([
        Preferences.set({ key: CACHE_KEY_ADMIN_TRAINEES, value: JSON.stringify(normalized) }),
        Preferences.set({
          key: CACHE_KEY_ADMIN_FILTER_META,
          value: JSON.stringify({ cohorts: fetchedCohorts, offices: fetchedOffices }),
        }),
      ]);
    } catch (error) {
      console.error("Failed to fetch admin trainees:", error);
    } finally {
      setLoading(false);
    }
  }, [token, databaseId, role]);

  useEffect(() => {
    if (!token || !databaseId || role !== "admin") {
      setAllTrainees([]);
      setCohorts([]);
      setOffices([]);
      setFilters(DEFAULT_FILTERS);
      return;
    }
    fetchTrainees();
  }, [token, databaseId, role, fetchTrainees]);

  const setSearchInput = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const visibleTrainees = useMemo(() => {
    const searchLower = filters.search.trim().toLowerCase();
    const filtered = allTrainees.filter((item) => {
      const matchesSearch =
        !searchLower ||
        item.fullName.toLowerCase().includes(searchLower) ||
        item.traineeId.toLowerCase().includes(searchLower) ||
        (item.officeName || "").toLowerCase().includes(searchLower);

      const matchesStatus = filters.status === "all" || item.status === filters.status;
      const itemCohort = item.academicYear && item.term ? `${item.academicYear}|${item.term}` : "all";
      const matchesCohort = filters.cohort === "all" || itemCohort === filters.cohort;
      const matchesOffice = filters.officeId === "all" || String(item.officeId || "") === filters.officeId;
      const matchesAssignment =
        filters.assignment === "all" ||
        (filters.assignment === "assigned" && Boolean(item.officeId)) ||
        (filters.assignment === "unassigned" && !item.officeId);

      return matchesSearch && matchesStatus && matchesCohort && matchesOffice && matchesAssignment;
    });

    return [...filtered].sort((a, b) => {
      if (filters.sort === "nameDesc") return b.fullName.localeCompare(a.fullName);
      if (filters.sort === "startNewest") return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime();
      if (filters.sort === "startOldest") return new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime();
      return a.fullName.localeCompare(b.fullName);
    });
  }, [allTrainees, filters]);

  const stats = useMemo(() => {
    const total = visibleTrainees.length;
    const active = visibleTrainees.filter((item) => item.status === "ongoing").length;
    const assigned = visibleTrainees.filter((item) => item.officeId).length;
    const officesCount = new Set(visibleTrainees.map((item) => item.officeName).filter(Boolean)).size;
    return {
      total,
      active,
      assigned,
      officesCount,
      activeRate: total ? Math.round((active / total) * 100) : 0,
    };
  }, [visibleTrainees]);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const value = useMemo(() => ({
    loading,
    allTrainees,
    visibleTrainees,
    cohorts,
    offices,
    filters,
    stats,
    setFilters,
    setSearchInput,
    fetchTrainees,
    resetFilters,
  }), [
    loading,
    allTrainees,
    visibleTrainees,
    cohorts,
    offices,
    filters,
    stats,
    fetchTrainees,
  ]);

  return (
    <AdminOjtContext.Provider value={value}>
      {children}
    </AdminOjtContext.Provider>
  );
};

export const useAdminOjt = () => {
  const context = useContext(AdminOjtContext);
  if (!context) {
    throw new Error("useAdminOjt must be used within an AdminOjtProvider");
  }
  return context;
};
