import React, { useState, useEffect, useCallback } from 'react';
import { IonPage, IonContent, IonIcon, IonSpinner, IonRefresher, IonRefresherContent, RefresherEventDetail } from '@ionic/react';
import { calendarOutline, timeOutline, chevronBackOutline, chevronDownCircleOutline } from 'ionicons/icons';
import { useAuth } from '@context/authContext';
import { useOjt } from '@context/ojtContext';
import { useUser } from '@context/userContext';
import { useNavigation } from '@hooks/useNavigation';
import { formatDate } from '@utils/date';
import API from '@api/api';
import BottomNav from '@components/BottomNav';
import '@css/AttendanceLogs.css';

interface AttendanceRecord {
  attendanceId: number;
  date: string;
  morningIn: string | null;
  morningOut: string | null;
  afternoonIn: string | null;
  afternoonOut: string | null;
  totalHours: number;
}

function AttendanceLogs() {
  const { token } = useAuth();
  const { navigate } = useNavigation();
  const { currentOjt } = useOjt();
  const { user } = useUser();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!token || !user?.databaseId || !currentOjt?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get<AttendanceRecord[]>('/attendance/student', {
        headers: { Authorization: `Bearer ${token}` },
        params: { studentId: user.databaseId, ojtId: currentOjt.id }
      });
      setRecords(data);
    } catch (err: any) {
      console.error("Failed to fetch logs:", err);
      setError(err?.response?.data?.message || "Failed to load attendance logs.");
    } finally {
      setLoading(false);
    }
  }, [token, user?.databaseId, currentOjt?.id]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchLogs();
    event.detail.complete();
  };

  const totalRendered = records.reduce((acc, curr) => acc + Number(curr.totalHours || 0), 0);

  return (
    <IonPage>
      <IonContent fullscreen className="logs-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh} mode="md">
          <IonRefresherContent 
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="crescent"
          />
        </IonRefresher>

        <div className="logs-header">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            <IonIcon icon={chevronBackOutline} />
          </button>
          <div className="header-info">
            <h1 className="header-title">Attendance Logs</h1>
            <p className="header-sub">Your complete time records history</p>
          </div>
        </div>

        <div className="logs-container">
          <div className="stats-card">
            <div className="stat-item">
              <div className="stat-icon ic-hours">
                <IonIcon icon={timeOutline} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Total Hours</p>
                <p className="stat-val">{totalRendered.toFixed(1)} hrs</p>
              </div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-icon ic-days">
                <IonIcon icon={calendarOutline} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Days Logged</p>
                <p className="stat-val">{records.length} days</p>
              </div>
            </div>
          </div>

          <div className="section-title">History</div>

          {loading ? (
            <div className="loading-state">
              <IonSpinner name="crescent" />
              <p>Fetching records...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchLogs}>Try Again</button>
            </div>
          ) : records.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <p>No attendance records found yet.</p>
              <button onClick={() => navigate('/dtr')}>Go to DTR</button>
            </div>
          ) : (
            <div className="logs-list">
              {records.map((record) => (
                <div key={record.attendanceId} className="log-card">
                  <div className="log-date-row">
                    <div className="log-date">
                      <IonIcon icon={calendarOutline} />
                      {formatDate(record.date)}
                    </div>
                    <div className="log-hours">
                      {Number(record.totalHours || 0).toFixed(1)} hrs
                    </div>
                  </div>
                  
                  <div className="log-sessions">
                    <div className="session-item">
                      <span className="session-label">Morning</span>
                      <span className="session-time">
                        {record.morningIn || '—'} to {record.morningOut || '—'}
                      </span>
                    </div>
                    <div className="session-item">
                      <span className="session-label">Afternoon</span>
                      <span className="session-time">
                        {record.afternoonIn || '—'} to {record.afternoonOut || '—'}
                      </span>
                    </div>
                  </div>

                  <div className="log-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${Math.min((Number(record.totalHours || 0) / 8) * 100, 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </IonContent>
      <BottomNav activeTab="logs" />
    </IonPage>
  );
};

export default AttendanceLogs;
