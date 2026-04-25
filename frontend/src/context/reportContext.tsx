import React, { createContext, useContext, useState, useEffect, useCallback, FC, ReactNode } from 'react';
import { Preferences } from '@capacitor/preferences';
import { useAuth } from './authContext';
import { useOjt } from './ojtContext';
import { useNetwork } from './networkContext';
import API from '@api/api';

export interface ReportAttachment {
  filename: string;
  path: string;
  originalName: string;
  size: number;
}

export interface Report {
  id: number;
  studentId: number;
  ojtId: number;
  type: 'daily' | 'weekly' | 'monthly' | 'midterm' | 'final' | 'incident';
  reportDate: string;
  title: string | null;
  content: string;
  attachments: ReportAttachment[] | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: number | null;
  reviewedAt: string | null;
  reviewerName: string | null;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
  studentName?: string;
  studentProfilePicture?: string;
}

export interface UpdateReportPayload {
  ojtId: number;
  type: Report['type'];
  reportDate: string;
  title: string | null;
  content: string;
  files?: File[];
  existingAttachments?: ReportAttachment[];
}

interface ReportContextValue {
  reports: Report[];
  loadingReports: boolean;
  fetchReports: () => Promise<void>;
  updateReport: (id: number, payload: UpdateReportPayload) => Promise<void>;
  updateReportStatus: (id: number, status: 'approved' | 'rejected' | 'pending', feedback?: string) => Promise<void>;
  deleteReport: (id: number) => Promise<void>;
} 

const ReportContext = createContext<ReportContextValue | null>(null);

const CACHE_KEY_PREFIX = "cached_reports_";

export const ReportProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { token, role, databaseId } = useAuth();
  const { currentOjt } = useOjt();
  const { isConnected } = useNetwork();

  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [isLoadedFromCache, setIsLoadedFromCache] = useState(false);

  const getCacheKey = useCallback(() => {
    if (!databaseId) return null;
    if (role === 'student' && currentOjt?.id) return `${CACHE_KEY_PREFIX}student_${currentOjt.id}`;
    if (role === 'supervisor') return `${CACHE_KEY_PREFIX}supervisor_${databaseId}`;
    return null;
  }, [role, databaseId, currentOjt?.id]);

  const saveToCache = useCallback(async (data: Report[]) => {
    const key = getCacheKey();
    if (key) {
      await Preferences.set({ key, value: JSON.stringify(data) });
    }
  }, [getCacheKey]);

  useEffect(() => {
    const loadCache = async () => {
      const key = getCacheKey();
      if (!key) {
        setIsLoadedFromCache(true);
        return;
      }
      try {
        const { value } = await Preferences.get({ key });
        if (value) {
          setReports(JSON.parse(value));
        }
      } catch (err) {
        console.error("Failed to load reports cache", err);
      } finally {
        setIsLoadedFromCache(true);
      }
    };
    loadCache();
  }, [getCacheKey]);

  const fetchReports = useCallback(async () => {
    if (!token) return;
    if (role === 'student' && !currentOjt?.id) return;
    if (role === 'supervisor' && !databaseId) return;

    setLoadingReports(true);
    try {
      let endpoint = '';
      if (role === 'student') {
        endpoint = `/reports/${currentOjt?.id}`;
      } else if (role === 'supervisor') {
        endpoint = `/reports/supervisor/${databaseId}`;
      }

      const res = await API.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawReports = res.data.data || [];
      const mappedReports: Report[] = rawReports.map((r: any) => {
        if (r.studentProfilePicture?.data) {
          const uint8Array = new Uint8Array(r.studentProfilePicture.data);
          const decodedString = new TextDecoder().decode(uint8Array);
          r.studentProfilePicture = decodedString;
        }
        return r;
      });

      setReports(mappedReports);
      await saveToCache(mappedReports);

    } catch (error) {
      console.error("Fetch reports error:", error);
    } finally {
      setLoadingReports(false);
    }
  }, [token, role, databaseId, currentOjt?.id, saveToCache]);

  useEffect(() => {
    if (!token || !databaseId) {
      setReports([]);
      return;
    }

    if (isLoadedFromCache) {
      const isStudentReady = role === 'student' && currentOjt?.id;
      const isSupervisorReady = role === 'supervisor';

      if ((isStudentReady || isSupervisorReady) && reports.length === 0 && isConnected) {
        fetchReports();
      }
    }
  }, [token, databaseId, role, currentOjt?.id, isLoadedFromCache, reports.length, fetchReports, isConnected]);

  const updateReport = useCallback(async (id: number, payload: UpdateReportPayload) => {
    const formData = new FormData();
    formData.append('ojtId', String(payload.ojtId));
    formData.append('type', payload.type);
    formData.append('reportDate', payload.reportDate);
    formData.append('title', payload.title ?? '');
    formData.append('content', payload.content);

    if (payload.existingAttachments) {
      formData.append('existingAttachments', JSON.stringify(payload.existingAttachments));
    }

    if (payload.files) {
      payload.files.forEach(file => formData.append('attachments', file));
    }

    await API.patch(`/reports/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    await fetchReports();
  }, [token, fetchReports]);

  const deleteReport = useCallback(async (id: number) => {
    await API.delete(`/reports/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    await saveToCache(updated);
  }, [token, reports, saveToCache]);

  const updateReportStatus = useCallback(async (id: number, status: 'approved' | 'rejected' | 'pending', feedback?: string) => {
    await API.patch(`/reports/${id}/status`, { status, feedback }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const updated = reports.map(r => r.id === id ? { ...r, status, feedback: feedback || r.feedback } : r);
    setReports(updated);
    await saveToCache(updated);
  }, [token, reports, saveToCache]);

  const value = React.useMemo(() => ({
    reports,
    loadingReports,
    fetchReports,
    updateReport,
    updateReportStatus,
    deleteReport
  }), [reports, loadingReports, fetchReports, updateReport, updateReportStatus, deleteReport]);

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) throw new Error("useReport must be used inside ReportProvider");
  return context;
};