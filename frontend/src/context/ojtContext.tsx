import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./authContext";
import API from "@api/api";

interface StudentOjt {
  id: number;
  academicYear: string;
  term: string;
  requiredHours: number;
  renderedHours: number;
  status: "pending" | "ongoing" | "completed" | "dropped";
  officeName: string;
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

export const OjtProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, databaseId, role } = useAuth();

  const [ojtRecords, setOjtRecords] = useState<StudentOjt[]>([]);
  const [currentOjt, setCurrentOjt] = useState<StudentOjt | null>(null);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && databaseId && role === "student") {
      fetchAllOjts();
    }
  }, [token, databaseId, role]);

  const fetchAllOjts = async () => {
    if (!token || role !== "student") return;

    setLoading(true);

    try {
      const { data } = await API.get(`/ojts/student/${databaseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const records: StudentOjt[] = data;

      setOjtRecords(records);

      if (records.length > 0) {
        const latest = records[0];
        setCurrentOjt(latest);
        setSelectedSchoolYear(latest.academicYear);
      }

    } catch (err) {
      console.error("Failed to fetch OJTs", err);
    } finally {
      setLoading(false);
    }
  };

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