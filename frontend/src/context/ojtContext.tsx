import React, { createContext, useContext, useEffect, useState, FC, ReactNode } from "react";
import { Preferences } from "@capacitor/preferences";
import { useAuth } from "./authContext";
import { useNetwork } from "./networkContext";
import API from "@api/api";

interface StudentOjt {
  id: number;
  academicYear: string;
  term: string;
  requiredHours: number;
  renderedHours: number;
  status: "pending" | "ongoing" | "completed" | "dropped";
  startDate: string | null;
  endDate: string | null;
  officeName: string;
  supervisorName: string | null;
  supervisorPosition: string | null;
}

interface OjtContextType {
  ojtRecords: StudentOjt[];
  currentOjt: StudentOjt | null;
  selectedSchoolYear: string | null;
  loading: boolean;
  fetchAllOjts: () => Promise<void>;
  selectSchoolYear: (year: string) => void;
}

const OjtContext = createContext<OjtContextType | null>(null);

const CACHE_KEY = "cached_ojt_records";

export const OjtProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { token, databaseId, role } = useAuth();
  const { isConnected } = useNetwork();

  const [ojtRecords, setOjtRecords] = useState<StudentOjt[]>([]);
  const [currentOjt, setCurrentOjt] = useState<StudentOjt | null>(null);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadedFromCache, setIsLoadedFromCache] = useState(false);

  const fetchAllOjts = async () => {
    if (!token || role !== "student") return;

    setLoading(true);

    try {
      const { data } = await API.get(`/ojts/student/${databaseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const records: StudentOjt[] = data;

      setOjtRecords(records);

      let latest: StudentOjt | null = null;
      let year: string | null = null;

      if (records.length > 0) {
        latest = records[0];
        setCurrentOjt(latest);
        year = latest.academicYear;
        setSelectedSchoolYear(year);
      }

      await Preferences.set({
        key: CACHE_KEY,
        value: JSON.stringify({
          records,
          current: latest,
          selectedYear: year
        })
      });

    } catch (err) {
      console.error("Failed to fetch OJTs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCache = async () => {
      try {
        const { value } = await Preferences.get({ key: CACHE_KEY });
        if (value) {
          const cached = JSON.parse(value);
          setOjtRecords(cached.records || []);
          setCurrentOjt(cached.current || null);
          setSelectedSchoolYear(cached.selectedYear || null);
        }
      } catch (err) {
        console.error("Failed to load OJT cache", err);
      } finally {
        setIsLoadedFromCache(true);
      }
    };
    loadCache();
  }, []);

  useEffect(() => {
    if (!token || !databaseId || role !== "student") {
      setOjtRecords([]);
      setCurrentOjt(null);
      setSelectedSchoolYear(null);
      return;
    }

    if (isLoadedFromCache) {
      if (ojtRecords.length === 0 && isConnected) {
        fetchAllOjts();
      }
    }
  }, [token, databaseId, role, isLoadedFromCache, isConnected, ojtRecords.length]);


  const selectSchoolYear = (year: string) => {
    const record = ojtRecords.find(r => r.academicYear === year);
    if (!record) return;

    setSelectedSchoolYear(year);
    setCurrentOjt(record);
  };

  return (
    <OjtContext.Provider value={{ ojtRecords, currentOjt, selectedSchoolYear, loading, fetchAllOjts, selectSchoolYear }}>
      {children}
    </OjtContext.Provider>
  );
};

export const useOjt = () => {
  const context = useContext(OjtContext);
  if (!context) throw new Error("useOjt must be used inside OjtProvider");
  return context;
};