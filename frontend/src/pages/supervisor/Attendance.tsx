import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { IonPage, IonContent, IonIcon, IonModal } from '@ionic/react';
import { qrCodeOutline, timeOutline, chevronDownOutline, chevronUpOutline, closeOutline } from 'ionicons/icons';
import { useAuth } from '@context/authContext';
import { useUser } from '@context/userContext';
import SupervisorBottomNav from '@components/SupervisorBottomNav';
import API from '@api/api';
import '@css/supervisor.css';

interface DTRRecord {
  id: number;
  date: string;
  morningIn: string | null;
  morningOut: string | null;
  afternoonIn: string | null;
  afternoonOut: string | null;
  hours: number;
}

interface AttendanceRecord {
  id: number;
  studentName: string;
  dtr: DTRRecord[];
}

const Attendance: React.FC = () => {
  const { databaseId, token } = useAuth();
  const { user } = useUser();
  const [filter, setFilter] = useState<'all' | 'today' | 'this_month'>('today');
  const [showQrModal, setShowQrModal] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  const [qrUrl, setQrUrl] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await API.get(`/attendance/supervisor/${databaseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecords(response.data);
      } catch (error) {
        console.error("Failed to fetch supervisor attendance:", error);
      }
    };

    if (databaseId && token) {
      fetchAttendance();
    }
  }, [databaseId, token]);

  // QR Generation Logic
  useEffect(() => {
    if (!showQrModal) return;

    const generateQr = async () => {
      try {
        setQrLoading(true);
        const oId = (user as any)?.officeId || 1;
        const response = await API.get(`/offices/${oId}/qr`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const qrValue = JSON.stringify(response.data);
        const url = await QRCode.toDataURL(qrValue, {
          width: 280,
          margin: 2,
          color: { dark: "#0f172a", light: "#f8fafc" },
        });
        setQrUrl(url);
        setLastUpdated(new Date());
        setCountdown(60);
      } catch (err) {
        console.error("QR Generation Error:", err);
      } finally {
        setQrLoading(false);
      }
    };

    generateQr();
    const interval = setInterval(generateQr, 60000);
    return () => clearInterval(interval);
  }, [showQrModal]);

  useEffect(() => {
    if (!showQrModal || !lastUpdated) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(timer);
  }, [showQrModal, lastUpdated]);

  const initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  //TODO
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayDateString = `${yyyy}-${mm}-${dd}`;
  const thisMonthString = `${yyyy}-${mm}`;

  const filteredRecords = records.map(rec => {
    let filteredDtr = rec.dtr;
    if (filter === 'today') {
      filteredDtr = rec.dtr.filter(d => d.date === todayDateString);
    } else if (filter === 'this_month') {
      filteredDtr = rec.dtr.filter(d => d.date.startsWith(thisMonthString));
    }

    filteredDtr = filteredDtr.filter(d => d.hours > 0 || d.morningIn || d.afternoonIn);
    filteredDtr = filteredDtr.sort((a,b) => b.date.localeCompare(a.date));

    return { ...rec, dtr: filteredDtr };
  }).filter(rec => {
    if (filter === 'today' && rec.dtr.length === 0) return false;
    if (rec.dtr.length === 0) return false;
    return true;
  });

  const circumference = 2 * Math.PI * 20;
  const progress = ((60 - countdown) / 60) * circumference;

  return (
    <IonPage>
      <IonContent fullscreen className="sv-content">

        {/* Hero */}
        <div className="sv-hero">
          <div className="sv-hero-bg" />
          <div className="sv-hero-inner" style={{ position: 'relative' }}>
            <p className="sv-hero-sub">Review logs</p>
            <h1 className="sv-hero-name">Attendance</h1>
            
            <button 
              className="sv-qr-btn" 
              onClick={() => setShowQrModal(true)}
            >
              <IonIcon icon={qrCodeOutline} size="large" />
            </button>
          </div>
        </div>

        <div className="sv-body">
          {/* Filter Tabs moved here */}
          <div className="act-filter-row">
            <button 
              className={`act-filter-btn ${filter === 'today' ? 'act-filter-active' : ''}`}
              onClick={() => setFilter('today')}
            >
              Today
            </button>
            <button 
              className={`act-filter-btn ${filter === 'this_month' ? 'act-filter-active' : ''}`}
              onClick={() => setFilter('this_month')}
            >
              This Month
            </button>
            <button 
              className={`act-filter-btn ${filter === 'all' ? 'act-filter-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
          </div>

          <div className="sv-list-header" style={{ marginTop: 24 }}>
            <span className="sv-list-title">Attendance Records</span>
            <span className="sv-list-count">{filteredRecords.length} students</span>
          </div>

          <div className="sv-attend-list">
            {filteredRecords.map(rec => {
              const isExpanded = expandedId === rec.id;

              return (
                <div key={rec.id} className="sv-attend-wrapper">
                  <div className="sv-attend-card">
                    <div className="sv-attend-avatar">{initials(rec.studentName)}</div>
                    <div className="sv-attend-info" style={{ flex: 1 }}>
                      <div className="sv-attend-name-row">
                        <span className="sv-attend-name">{rec.studentName}</span>
                      </div>

                      <div className="sv-attend-times">
                        {rec.dtr.slice(0, 1).map((dLog, idx) => (
                           <div key={idx} className="sv-time-row">
                             {dLog.morningIn && (
                               <span className="sv-time-pill sv-time-in">
                                 <IonIcon icon={timeOutline} /> AM In: {dLog.morningIn}
                               </span>
                             )}
                             {dLog.morningOut && (
                               <span className="sv-time-pill sv-time-out">
                                 <IonIcon icon={timeOutline} /> AM Out: {dLog.morningOut}
                               </span>
                             )}
                             {dLog.afternoonIn && (
                               <span className="sv-time-pill sv-time-in">
                                 <IonIcon icon={timeOutline} /> PM In: {dLog.afternoonIn}
                               </span>
                             )}
                             {dLog.afternoonOut && (
                               <span className="sv-time-pill sv-time-out">
                                 <IonIcon icon={timeOutline} /> PM Out: {dLog.afternoonOut}
                               </span>
                             )}
                           </div>
                        ))}
                      </div>
                    </div>

                    {filter !== 'today' && rec.dtr.length > 0 && (
                      <div className="sv-attend-right">
                        <button
                          className="sv-expand-btn"
                          onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                          title={isExpanded ? 'Collapse' : 'View DTR'}
                        >
                          <IonIcon icon={isExpanded ? chevronUpOutline : chevronDownOutline} />
                        </button>
                      </div>
                    )}
                  </div>

                  {isExpanded && filter !== 'today' && (
                    <div className="sv-dtr-panel">
                      <p className="sv-dtr-panel-title">Daily Time Record</p>
                      <div className="sv-dtr-cards">
                        {rec.dtr.map(dtr => (
                          <div key={dtr.id} className="sv-dtr-day-card">
                            <div className="sv-dtr-day-header">
                              <span className="sv-dtr-date">{dtr.date}</span>
                            </div>
                            <div className="sv-dtr-slots">
                              <div className="sv-dtr-slot">
                                <span className="sv-dtr-slot-lbl">Morning In</span>
                                <span className="sv-dtr-slot-val">{dtr.morningIn || '—'}</span>
                              </div>
                              <div className="sv-dtr-slot">
                                <span className="sv-dtr-slot-lbl">Morning Out</span>
                                <span className="sv-dtr-slot-val">{dtr.morningOut || '—'}</span>
                              </div>
                              <div className="sv-dtr-slot">
                                <span className="sv-dtr-slot-lbl">Afternoon In</span>
                                <span className="sv-dtr-slot-val">{dtr.afternoonIn || '—'}</span>
                              </div>
                              <div className="sv-dtr-slot">
                                <span className="sv-dtr-slot-lbl">Afternoon Out</span>
                                <span className="sv-dtr-slot-val">{dtr.afternoonOut || '—'}</span>
                              </div>
                            </div>
                            <div className="sv-dtr-hours">
                              <span className="sv-dtr-slot-lbl">Total Hours</span>
                              <span className="sv-dtr-hours-val">{dtr.hours.toFixed(2)} hrs</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </IonContent>

      {/* QR Code Modal Integration */}
      <IonModal isOpen={showQrModal} onDidDismiss={() => setShowQrModal(false)}>
        <IonContent fullscreen>
          <div className="qr-root">
            <button className="qr-close-btn" onClick={() => setShowQrModal(false)}>
              <IonIcon icon={closeOutline} size="large" />
            </button>
            
            <div className="qr-card">
              <div className="qr-frame">
                <div className="qr-frame-inner">
                  {qrLoading ? (
                    <div className="qr-skeleton" />
                  ) : (
                    <img className="qr-image" src={qrUrl} alt="Office QR Code" />
                  )}
                </div>
              </div>

              <div className="qr-footer">
                <div className="qr-office">
                  <span className="qr-office-label">Office Name</span>
                  <span className="qr-office-name">{(user as any)?.officeName || 'Office'}</span>
                </div>

                <div className="qr-timer">
                  <span className="qr-timer-count">
                    00:{String(countdown).padStart(2, "0")}
                  </span>
                  <svg width="32" height="32" viewBox="0 0 48 48" className="qr-ring">
                    <circle className="qr-ring-track" cx="24" cy="24" r="20" />
                    <circle 
                      className="qr-ring-progress" 
                      cx="24" cy="24" r="20" 
                      style={{ 
                        strokeDasharray: circumference, 
                        strokeDashoffset: circumference - progress 
                      }}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </IonContent>
      </IonModal>

      <SupervisorBottomNav activeTab="attendance" />
    </IonPage>
  );
};

export default Attendance;