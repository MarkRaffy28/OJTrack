import React, { useState, useEffect, useCallback } from 'react';
import { IonPage, IonContent, IonIcon, IonToast, IonRefresher, IonRefresherContent, RefresherEventDetail } from '@ionic/react';
import { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner';
import { calendarOutline, checkmarkCircleOutline, qrCodeOutline, scanOutline, refreshOutline, closeCircle, chevronDownCircleOutline } from 'ionicons/icons';
import { useAuth } from '@context/authContext';
import { useOjt } from '@context/ojtContext';
import { useUser } from '@context/userContext';
import { useNavigation } from '@hooks/useNavigation';
import { formatDate, formatTime12, todayISO } from '@utils/date';
import API from '@api/api';
import BottomNav from '@components/BottomNav';
import '@css/DTR.css';

interface AttendanceRecord {
  morningTimeIn:    string;
  morningTimeOut:   string;
  afternoonTimeIn:  string;
  afternoonTimeOut: string;
}

interface ScanResponse {
  message: string;
  session: 'morning_in' | 'morning_out' | 'afternoon_in' | 'afternoon_out';
  time:    string;  
  status?: 'success' | 'error' | 'warning';
}

type ToastType = 'success' | 'error' | 'warning';

const COLUMN_TO_KEY: Record<ScanResponse['session'], keyof AttendanceRecord> = {
  morning_in:    'morningTimeIn',
  morning_out:   'morningTimeOut',
  afternoon_in:  'afternoonTimeIn',
  afternoon_out: 'afternoonTimeOut',
};

const calcTotalHours = (r: AttendanceRecord) => {
  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  let total = 0;
  if (r.morningTimeIn   && r.morningTimeOut)   total += toMin(r.morningTimeOut)   - toMin(r.morningTimeIn);
  if (r.afternoonTimeIn && r.afternoonTimeOut) total += toMin(r.afternoonTimeOut) - toMin(r.afternoonTimeIn);
  return total ? `${Math.floor(total / 60)}h ${total % 60}m` : '—';
};

function DTR() {
  useNavigation(); 

  const { token }      = useAuth();
  const { currentOjt } = useOjt();
  const { user }       = useUser();

  const [selectedDate] = useState<string>(new Date().toISOString());
  const [attendance, setAttendance] = useState<AttendanceRecord>({
    morningTimeIn: '', morningTimeOut: '', afternoonTimeIn: '', afternoonTimeOut: '',
  });

  const [loadingFetch, setLoadingFetch] = useState(true);
  const [scanning,     setScanning]     = useState(false);
  const [lastScanned,  setLastScanned]  = useState<string | null>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg,  setToastMsg]  = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');

  const showToast = useCallback((type: ToastType, message: string) => {
    setToastType(type);
    setToastMsg(message);
    setToastOpen(true);
  }, []);

  const fetchAttendance = useCallback(async () => {
    if (!user?.databaseId || !currentOjt?.id) return;
    setLoadingFetch(true);
    try {
      const { data } = await API.get<AttendanceRecord>('/attendance/today', {
        headers: { Authorization: `Bearer ${token}` },
        params:  { studentId: user.databaseId, ojtId: currentOjt.id, date: todayISO() },
      });
      setAttendance({
        morningTimeIn:    data.morningTimeIn    ?? '',
        morningTimeOut:   data.morningTimeOut   ?? '',
        afternoonTimeIn:  data.afternoonTimeIn  ?? '',
        afternoonTimeOut: data.afternoonTimeOut ?? '',
      });
    } catch (err: any) {
      showToast('error', err?.response?.data?.message ?? 'Failed to load attendance.');
    } finally {
      setLoadingFetch(false);
    }
  }, [token, user?.databaseId, currentOjt?.id, showToast]);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchAttendance();
    event.detail.complete();
  };

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleScan = async () => {
    if (!user?.databaseId || !currentOjt?.id) return;
    try {
      setScanning(true);

      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.ALL,
      });

      if (!result?.ScanResult) {
        showToast('warning', 'No QR code detected. Please try again.');
        return;
      }

      const { data } = await API.post<ScanResponse>(
        '/attendance/scan',
        { studentId: user.databaseId, ojtId: currentOjt.id, qrPayLoad: result.ScanResult },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      showToast(data.status ?? 'success', data.message);
      const recordKey = COLUMN_TO_KEY[data.session];
      if (recordKey && data.time) {
        setAttendance(prev => ({ ...prev, [recordKey]: data.time }));
      }

      setLastScanned(data.session);
      setTimeout(() => setLastScanned(null), 2500);

      fetchAttendance();

    } catch (err: any) {
      showToast('error', err?.response?.data?.message ?? err?.message ?? 'Scan failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="dtr-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh} mode="md">
          <IonRefresherContent 
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="crescent"
          />
        </IonRefresher>

        {/* Hero */}
        <div className="dtr-hero">
          <div className="dtr-hero-bg" />
          <div className="dtr-hero-inner">
            <h1 className="dtr-hero-title">Log Your Work</h1>
            <p className="dtr-hero-sub">Scan your QR code to record attendance</p>
          </div>
        </div>

        <div className="dtr-container">

          {/* Date */}
          <div className="dtr-card dtr-date-card">
            <div className="dtr-card-icon-wrap dtr-icon-date">
              <IonIcon icon={calendarOutline} />
            </div>
            <div>
              <p className="dtr-card-label">Date</p>
              <p className="dtr-card-value">{formatDate(selectedDate)}</p>
            </div>
          </div>

          {/* QR Scan Card */}
          <div className="dtr-scan-card">
            <div className="dtr-scan-graphic">
              <div className={`dtr-scan-ring ${scanning ? 'dtr-scan-ring--active' : ''}`}>
                <div className="dtr-scan-ring-inner">
                  <IonIcon
                    icon={scanning ? scanOutline : qrCodeOutline}
                    className="dtr-scan-qr-icon"
                  />
                </div>
              </div>
              {scanning && (
                <div className="dtr-scan-laser">
                  <div className="dtr-scan-laser-line" />
                </div>
              )}
            </div>

            <div className="dtr-scan-info">
              <p className="dtr-scan-title">{scanning ? 'Scanning…' : 'Ready to Scan'}</p>
              <p className="dtr-scan-hint">
                {scanning
                  ? 'Point your camera at the QR code'
                  : 'Tap Scan — the system will automatically detect your current shift'}
              </p>
            </div>

            <button
              className={['dtr-scan-btn', scanning ? 'dtr-scan-btn--scanning' : ''].join(' ')}
              onClick={handleScan}
              disabled={scanning || loadingFetch}
            >
              <IonIcon icon={scanning ? scanOutline : qrCodeOutline} />
              <span>{scanning ? 'Scanning…' : 'Scan QR Code'}</span>
            </button>

            <button
              className="dtr-refresh-btn"
              onClick={fetchAttendance}
              disabled={loadingFetch || scanning}
            >
              <IonIcon icon={refreshOutline} className={loadingFetch ? 'dtr-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Summary */}
          <div className="dtr-summary-card">
            <div className="dtr-summary-header">
              <IonIcon icon={checkmarkCircleOutline} className="dtr-summary-icon" />
              <span className="dtr-summary-title">Summary</span>
            </div>
            <div className="dtr-summary-rows">
              {(
                [
                  { label: 'Morning Time In',    value: attendance.morningTimeIn,    key: 'morning_in'    },
                  { label: 'Morning Time Out',   value: attendance.morningTimeOut,   key: 'morning_out'   },
                  { label: 'Afternoon Time In',  value: attendance.afternoonTimeIn,  key: 'afternoon_in'  },
                  { label: 'Afternoon Time Out', value: attendance.afternoonTimeOut, key: 'afternoon_out' },
                ] as const
              ).map(row => (
                <div
                  key={row.key}
                  className={[
                    'dtr-summary-row',
                    row.value               ? 'dtr-summary-row--done'  : '',
                    lastScanned === row.key ? 'dtr-summary-row--flash' : '',
                  ].join(' ')}
                >
                  <div className="dtr-summary-dot" />
                  <span className="dtr-summary-label">{row.label}</span>
                  <span className={`dtr-summary-value${!row.value ? ' dtr-summary-value--pending' : ''}`}>
                    {row.value ? formatTime12(row.value) : 'Pending'}
                  </span>
                </div>
              ))}

              {/* Total */}
              {(() => {
                const hasTotal = !!(attendance.morningTimeIn && attendance.morningTimeOut);
                return (
                  <div className={['dtr-summary-row dtr-summary-row--total', hasTotal ? 'dtr-summary-row--done' : ''].join(' ')}>
                    <div className="dtr-summary-dot" />
                    <span className="dtr-summary-label">Total Working Hours</span>
                    <span className={`dtr-summary-value${!hasTotal ? ' dtr-summary-value--pending' : ''}`}>
                      {hasTotal ? calcTotalHours(attendance) : 'Pending'}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>

        </div>

        <IonToast
          isOpen={toastOpen}
          onDidDismiss={() => setToastOpen(false)}
          message={toastMsg}
          duration={3500}
          color={toastType === 'success' ? 'success' : toastType === 'warning' ? 'warning' : 'danger'}
          position="top"
          cssClass={`dtr-toast dtr-toast--${toastType}`}
          buttons={[{ icon: closeCircle, role: 'cancel' }]}
        />

      </IonContent>
      <BottomNav activeTab="dtr" />
    </IonPage>
  );
}

export default DTR;