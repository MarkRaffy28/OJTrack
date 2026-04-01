import React, { createContext, useContext, useState, useEffect } from 'react';
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
  deleteReport: (id: number) => Promise<void>;
} 

const ReportContext = createContext<ReportContextValue>({
  reports: [],
  loadingReports: false,
  fetchReports: async () => {},
  updateReport: async () => {},
  deleteReport: async () => {},
});

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const { currentOjt } = useOjt();

  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const fetchReports = async () => {
    if (!currentOjt?.id || !token) return;

    setLoadingReports(true);
    try {
      const res = await API.get(`/reports/fetch/${currentOjt?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const reports: Report[] = res.data.data;
      setReports(reports);

    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoadingReports(false);
    }
  };

  // Auto-fetch when OJT context changes
  useEffect(() => {
    if (currentOjt?.id && token) {
      fetchReports();
    }
  }, [currentOjt?.id, token]);

  const updateReport = async (id: number, payload: UpdateReportPayload) => {
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

      await API.patch(`/reports/update/${id}`, formData, {
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
  };

  const deleteReport = async (id: number) => {
    try {
      await API.delete(`/reports/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReports(prev => prev.filter(r => r.id !== id));

    } catch (error) {
      console.error("Delete error:", error);
      throw error;
    }
  };

  return (
    <ReportContext.Provider
      value={{ reports, loadingReports, fetchReports, updateReport, deleteReport }}
    >
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => useContext(ReportContext);