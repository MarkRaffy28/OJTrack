import React, { useState } from 'react';
import { IonPage, IonContent, IonText, IonIcon, IonInput, IonLabel } from '@ionic/react';
import { calendarOutline, timeOutline, checkmarkCircleOutline, addOutline } from 'ionicons/icons';
import BottomNav from '../../components/BottomNav';
import '../../css/DTR.css';

interface DTRProps {}

const DTR: React.FC<DTRProps> = () => {
  const [selectedDate] = useState<string>(new Date().toISOString());
  const [morningTimeIn, setMorningTimeIn] = useState<string>('');
  const [morningTimeOut, setMorningTimeOut] = useState<string>('');
  const [afternoonTimeIn, setAfternoonTimeIn] = useState<string>('');
  const [afternoonTimeOut, setAfternoonTimeOut] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatTime12Hour = (time: string) => {
    if (!time) return '—';
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const calculateTotalHours = () => {
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    let total = 0;
    if (morningTimeIn && morningTimeOut) total += toMin(morningTimeOut) - toMin(morningTimeIn);
    if (afternoonTimeIn && afternoonTimeOut) total += toMin(afternoonTimeOut) - toMin(afternoonTimeIn);
    if (!total) return '—';
    return `${Math.floor(total / 60)}h ${total % 60}m`;
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => { setIsSubmitting(false); setIsSubmitted(true); }, 1000);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const isFormComplete = !!(morningTimeIn && morningTimeOut);

  const TimeBlock = ({
    label, value, onChange, onSetCurrent, minTime, maxTime, colorClass
  }: {
    label: string; value: string; onChange: (v: string) => void;
    onSetCurrent: () => void; minTime: string; maxTime: string; colorClass: string;
  }) => (
    <div className={`dtr-time-block ${value ? 'dtr-time-block--done' : ''}`}>
      <div className="dtr-time-block-header">
        <div className={`dtr-time-indicator ${colorClass}`} />
        <span className="dtr-time-block-label">{label}</span>
        {value && <span className="dtr-time-check">✓</span>}
      </div>
      <div className="dtr-time-input-row">
        <IonInput
          type="time"
          value={value}
          onIonChange={(e) => onChange(e.detail.value!)}
          className="dtr-ion-input"
          min={minTime}
          max={maxTime}
          disabled={isSubmitted}
        />
        <button className="dtr-now-btn" onClick={onSetCurrent} disabled={isSubmitted}>
          Now
        </button>
      </div>
      {value && <p className="dtr-time-display">{formatTime12Hour(value)}</p>}
    </div>
  );

  return (
    <IonPage>
      <IonContent fullscreen className="dtr-content">

        {/* Header */}
        <div className="dtr-hero">
          <div className="dtr-hero-bg" />
          <div className="dtr-hero-inner">
            <h1 className="dtr-hero-title">Log Your Work</h1>
            <p className="dtr-hero-sub">Track your daily hours accurately</p>
          </div>
        </div>

        <div className="dtr-container">

          {/* Date Card */}
          <div className="dtr-card dtr-date-card">
            <div className="dtr-card-icon-wrap dtr-icon-date">
              <IonIcon icon={calendarOutline} />
            </div>
            <div>
              <p className="dtr-card-label">Date</p>
              <p className="dtr-card-value">{formatDate(selectedDate)}</p>
            </div>
          </div>

          {/* Morning Shift */}
          <div className="dtr-shift-card">
            <div className="dtr-shift-header">
              <div className="dtr-card-icon-wrap dtr-icon-morning">
                <IonIcon icon={timeOutline} />
              </div>
              <div>
                <p className="dtr-card-label">Morning Shift</p>
                <p className="dtr-card-value-small">7:00 AM – 12:00 PM</p>
              </div>
              <div className="dtr-shift-status">
                {morningTimeIn && morningTimeOut
                  ? <span className="dtr-shift-complete">Complete</span>
                  : <span className="dtr-shift-pending">Pending</span>}
              </div>
            </div>
            <div className="dtr-time-blocks">
              <TimeBlock
                label="Time In" value={morningTimeIn}
                onChange={setMorningTimeIn} onSetCurrent={() => setMorningTimeIn(getCurrentTime())}
                minTime="07:00" maxTime="12:00" colorClass="indicator-green"
              />
              <div className="dtr-blocks-sep"><IonIcon icon={addOutline} /></div>
              <TimeBlock
                label="Time Out" value={morningTimeOut}
                onChange={setMorningTimeOut} onSetCurrent={() => setMorningTimeOut(getCurrentTime())}
                minTime="07:00" maxTime="12:00" colorClass="indicator-amber"
              />
            </div>
          </div>

          {/* Afternoon Shift */}
          <div className="dtr-shift-card">
            <div className="dtr-shift-header">
              <div className="dtr-card-icon-wrap dtr-icon-afternoon">
                <IonIcon icon={timeOutline} />
              </div>
              <div>
                <p className="dtr-card-label">Afternoon Shift</p>
                <p className="dtr-card-value-small">1:00 PM – 5:00 PM</p>
              </div>
              <div className="dtr-shift-status">
                {afternoonTimeIn && afternoonTimeOut
                  ? <span className="dtr-shift-complete">Complete</span>
                  : <span className="dtr-shift-pending">Pending</span>}
              </div>
            </div>
            <div className="dtr-time-blocks">
              <TimeBlock
                label="Time In" value={afternoonTimeIn}
                onChange={setAfternoonTimeIn} onSetCurrent={() => setAfternoonTimeIn(getCurrentTime())}
                minTime="13:00" maxTime="17:00" colorClass="indicator-green"
              />
              <div className="dtr-blocks-sep"><IonIcon icon={addOutline} /></div>
              <TimeBlock
                label="Time Out" value={afternoonTimeOut}
                onChange={setAfternoonTimeOut} onSetCurrent={() => setAfternoonTimeOut(getCurrentTime())}
                minTime="13:00" maxTime="17:00" colorClass="indicator-amber"
              />
            </div>
          </div>

          {/* Summary Card */}
          <div className="dtr-summary-card">
            <div className="dtr-summary-header">
              <IonIcon icon={checkmarkCircleOutline} className="dtr-summary-icon" />
              <span className="dtr-summary-title">Summary</span>
            </div>
            <div className="dtr-summary-rows">
              {[
                { label: 'Morning Time In', value: formatTime12Hour(morningTimeIn), done: !!morningTimeIn },
                { label: 'Morning Time Out', value: formatTime12Hour(morningTimeOut), done: !!morningTimeOut },
                { label: 'Afternoon Time In', value: formatTime12Hour(afternoonTimeIn), done: !!afternoonTimeIn },
                { label: 'Afternoon Time Out', value: formatTime12Hour(afternoonTimeOut), done: !!afternoonTimeOut },
                { label: 'Total Working Hours', value: calculateTotalHours(), done: isFormComplete },
              ].map((row, i) => (
                <div key={i} className={`dtr-summary-row ${row.done ? 'dtr-summary-row--done' : ''}`}>
                  <div className="dtr-summary-dot" />
                  <span className="dtr-summary-label">{row.label}</span>
                  <span className="dtr-summary-value">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            className={`dtr-submit-btn ${isFormComplete && !isSubmitted ? 'dtr-submit-ready' : ''} ${isSubmitting ? 'dtr-submit-loading' : ''} ${isSubmitted ? 'dtr-submit-done' : ''}`}
            onClick={handleSubmit}
            disabled={!isFormComplete || isSubmitting || isSubmitted}
          >
            <IonIcon icon={checkmarkCircleOutline} />
            <span>{isSubmitted ? 'Submitted!' : isSubmitting ? 'Submitting…' : 'Submit DTR'}</span>
          </button>

        </div>
      </IonContent>
      <BottomNav activeTab="dtr" />
    </IonPage>
  );
};

export default DTR;