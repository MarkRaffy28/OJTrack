import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './authContext';
import { useOjt } from './ojtContext';
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

const ReportContext = createContext<ReportContextValue>({
  reports: [],
  loadingReports: false,
  fetchReports: async () => {},
  updateReport: async () => {},
  updateReportStatus: async () => {},
  deleteReport: async () => {},
});

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, role, databaseId } = useAuth();
  const { currentOjt } = useOjt();

  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const fetchReports = useCallback(async () => {
    if (!token) return;

    if (role === 'student' && !currentOjt?.id) {
      return;
    }

    if (role === 'supervisor' && !databaseId) {
      return;
    }

    setLoadingReports(true);
    try {
      let endpoint = '';
      if (role === 'student') {
        endpoint = `/reports/${currentOjt?.id}`;
      } else if (role === 'supervisor') {
        endpoint = `/reports/supervisor/${databaseId}`;
      }

      if (!endpoint) return;

      const res = await API.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawReports = res.data.data;
      const reports: Report[] = rawReports.map((r: any) => {
        if (r.studentProfilePicture?.data) {
          const uint8Array = new Uint8Array(r.studentProfilePicture.data);
          const decodedString = new TextDecoder().decode(uint8Array);
          r.studentProfilePicture = decodedString;
        }
        return r;
      });
      setReports(reports);

    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoadingReports(false);
    }
  }, [currentOjt?.id, token, role, databaseId]);

  // Auto-fetch when context changes
  useEffect(() => {
    if (token && ((role === 'student' && currentOjt?.id) || (role === 'supervisor' && databaseId))) {
      fetchReports();
    }
  }, [currentOjt?.id, token, role, databaseId, fetchReports]);

  const updateReport = useCallback(async (id: number, payload: UpdateReportPayload) => {
    try {
      const formData = new FormData();
      formData.append('type', payload.type);
      formData.append('reportDate', payload.reportDate);
      formData.append('title', payload.title ?? '');
      formData.append('content', payload.content);

      // Send existing attachments the user wants to keep
      if (payload.existingAttachments) {
        formData.append('existingAttachments', JSON.stringify(payload.existingAttachments));
      }

      if (payload.files) {
        payload.files.forEach(file => {
          formData.append('attachments', file);
        });
      }

      await API.patch(`/reports/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh from server to get accurate updated data
      await fetchReports();

    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  }, [token, fetchReports]);

  const deleteReport = useCallback(async (id: number) => {
    try {
      await API.delete(`/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReports(prev => prev.filter(r => r.id !== id));

    } catch (error) {
      console.error("Delete error:", error);
      throw error;
    }
  }, [token]);

  const updateReportStatus = useCallback(async (id: number, status: 'approved' | 'rejected' | 'pending', feedback?: string) => {
    try {
      await API.patch(`/reports/${id}/status`, { status, feedback }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReports(prev => prev.map(r => r.id === id ? { ...r, status, feedback: feedback || r.feedback } : r));
    } catch (error) {
      console.error("Status update error:", error);
      throw error;
    }
  }, [token]);

  return (
    <ReportContext.Provider
      value={{ reports, loadingReports, fetchReports, updateReport, updateReportStatus, deleteReport }}
    >
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => useContext(ReportContext);