import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { IonPage, IonContent, IonIcon, IonRefresher, IonRefresherContent, RefresherEventDetail } from '@ionic/react';
import {
  alertCircleOutline, arrowBackOutline, calendarOutline, documentTextOutline, schoolOutline, locationOutline, personOutline,
  createOutline, checkmarkOutline, closeOutline, warning, chevronDownCircleOutline
} from 'ionicons/icons';
import { useSupervisorOjt } from '@context/supervisorOjtContext';
import { useNavigation } from '@hooks/useNavigation';
import { formatDate } from '@utils/date';
import { capitalize, ordinal } from '@utils/string';
import { progressColor, progressTrackBg, progressGlowDot, progressBadgeBg } from '@utils/progress';
import Avatar from '@components/Avatar';
import SupervisorBottomNav from '@components/SupervisorBottomNav';
import '@css/Supervisor.css';

function TraineeDetail() {
  const { id } = useParams<{ id: string }>();
  
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const { navigate, goBack } = useNavigation(editingNotes ? {
    onBack: () => {
      setEditingNotes(false);
      setNotesDraft('');
      setUpdateError(null);
    }
  } : {});
  const { allOjts, updateNotes, fetchAllOjts } = useSupervisorOjt();

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchAllOjts();
    event.detail.complete();
  };

  const ojt = allOjts.find(o => o.studentId === parseInt(id));

  const handleEditNotes = () => {
    setNotesDraft(ojt?.supervisorNotes ?? '');
    setUpdateError(null);
    setEditingNotes(true);
  };

  const handleSaveNotes = async () => {
    if (!ojt) return;
    setSavingNotes(true);
    setUpdateError(null);
    try {
      await updateNotes(ojt.ojtId, notesDraft);
      setEditingNotes(false);
    } catch (err: any) {
      setUpdateError(err.response?.data?.message || 'Failed to update notes. Please try again.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleCancelNotes = () => {
    setEditingNotes(false);
    setNotesDraft('');
    setUpdateError(null);
  };

  if (!ojt) {
    return (
      <IonPage>
        <IonContent className="sv-content">
          <div className="sv-body sv-not-found-container">
            <div className="sv-card sv-not-found-card">
              <div className="sv-not-found-icon-wrap">
                <IonIcon icon={warning} />
              </div>
              <div>
                <h2 className="sv-not-found-title">Trainee Not Found</h2>
                <p className="sv-not-found-text">The trainee you are looking for does not exist or has been removed.</p>
              </div>
              <button 
                className="sv-notes-btn sv-notes-btn-cancel sv-not-found-btn" 
                onClick={() => navigate('/trainees')}
              >
                <IonIcon icon={arrowBackOutline} />
                Return to Trainees
              </button>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const color = progressColor(ojt.progress);

  const ojtDetails = [
    { icon: schoolOutline,       label: 'Office',          value: ojt.officeName },
    { icon: calendarOutline,     label: 'Academic Year',   value: ojt.academicYear },
    { icon: calendarOutline,     label: 'Term',            value: capitalize(ojt.term) },
    { icon: calendarOutline,     label: 'Start Date',      value: ojt.startDate ? formatDate(ojt.startDate) : '—' },
    { icon: calendarOutline,     label: 'End Date',        value: ojt.endDate ? formatDate(ojt.endDate) : '—' },
    { icon: documentTextOutline, label: 'Required Hours',  value: `${ojt.requiredHours} hrs` },
    { icon: documentTextOutline, label: 'Rendered Hours',  value: `${ojt.renderedHours} hrs` },
  ];

  const studentDetails = [
    { icon: schoolOutline,  label: 'Program',     value: ojt.program },
    { icon: personOutline,  label: 'Year Level',  value: ordinal(ojt.year) + " Year" },
    { icon: locationOutline, label: 'Section',    value: `Section ${ojt.section}` },
  ];

  return (
    <IonPage>
      <IonContent fullscreen className="sv-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh} mode="md">
          <IonRefresherContent 
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="crescent"
          />
        </IonRefresher>

        {/* Hero */}
        <div className="sv-hero-detail">
          <div className="sv-hero-bg" />
          <div className="sv-hero-inner">
            <button className="sv-back-btn" onClick={() => goBack()}>
              <IonIcon icon={arrowBackOutline} />
              Back
            </button>
            <div className="sv-detail-profile">
              <Avatar
                src={ojt.profilePicture}
                name={ojt.fullName}
                className="sv-detail-avatar"
              />
              <div className="sv-detail-profile-info">
                <h1 className="sv-detail-name">{ojt.fullName}</h1>
                <p className="sv-detail-meta">
                  {ordinal(ojt.year)} Year · Section {ojt.section}
                </p>
                <div className="sv-detail-badges">
                  {/* isActive badge */}
                  <span className={`sv-detail-status ${ojt.isActive ? 'sv-status-active' : 'sv-status-inactive'}`}>
                    {ojt.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {/* OJT status badge */}
                  <span className={`sv-detail-status status-${ojt.status}`}>
                    {capitalize(ojt.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sv-body">

          {/* Progress Card */}<br/>
          <div className="sv-card">
            <div className="sv-card-header">
              <div>
                <p className="sv-card-label">Training Progress</p>
                <h2 className="sv-card-title">Overall Completion</h2>
              </div>
              <span
                className="sv-pct-badge"
                style={{
                  color,
                  background: progressBadgeBg(ojt.progress),
                  border: `1px solid ${color}33`,
                }}
              >
                {ojt.progress}%
              </span>
            </div>

            <div className="sv-progress-track" style={{ background: progressTrackBg(ojt.progress) }}>
              <div
                className="sv-progress-fill"
                style={{
                  width: `${ojt.progress}%`,
                  background: `linear-gradient(90deg, ${color}cc, ${color})`,
                  boxShadow: `0 0 10px ${color}55`,
                }}
              >
                <div
                  className="sv-progress-glow"
                  style={{
                    background: color,
                    boxShadow: `0 0 0 4px ${progressGlowDot(ojt.progress)}`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* OJT Information */}
          <div className="sv-card">
            <div className="sv-card-header">
              <div>
                <p className="sv-card-label">OJT Information</p>
                <h2 className="sv-card-title">Placement Details</h2>
              </div>
            </div>
            <div className="sv-detail-list">
              {ojtDetails.map((d, i) => (
                <div key={i} className="sv-detail-item">
                  <div className="sv-detail-item-icon"><IonIcon icon={d.icon} /></div>
                  <div className="sv-detail-item-text">
                    <p className="sv-detail-item-lbl">{d.label}</p>
                    <p className="sv-detail-item-val">{d.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Details */}
          <div className="sv-card">
            <div className="sv-card-header">
              <div>
                <p className="sv-card-label">Student Information</p>
                <h2 className="sv-card-title">Academic Details</h2>
              </div>
            </div>
            <div className="sv-detail-list">
              {studentDetails.map((d, i) => (
                <div key={i} className="sv-detail-item">
                  <div className="sv-detail-item-icon"><IonIcon icon={d.icon} /></div>
                  <div className="sv-detail-item-text">
                    <p className="sv-detail-item-lbl">{d.label}</p>
                    <p className="sv-detail-item-val">{d.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supervisor Notes */}
          <div className="sv-card sv-notes-card">
            <div className="sv-card-header">
              <div>
                <p className="sv-card-label">Supervisor Notes</p>
              </div>
              {!editingNotes && (
                <button className="sv-edit-btn" onClick={handleEditNotes}>
                  <IonIcon icon={createOutline} />
                  Edit
                </button>
              )}
            </div>

            {editingNotes ? (
              <div className="sv-notes-edit">
                {updateError && (
                  <div className="sv-notes-error">
                    <IonIcon icon={alertCircleOutline} />
                    {updateError}
                  </div>
                )}
                <textarea
                  className="sv-notes-textarea"
                  value={notesDraft}
                  onChange={e => setNotesDraft(e.target.value)}
                  placeholder="Write your observations about this trainee…"
                  rows={5}
                  disabled={savingNotes}
                />
                <div className="sv-notes-actions">
                  <button
                    className="sv-notes-btn sv-notes-btn-cancel"
                    onClick={handleCancelNotes}
                    disabled={savingNotes}
                  >
                    <IonIcon icon={closeOutline} />
                    Cancel
                  </button>
                  <button
                    className="sv-notes-btn sv-notes-btn-save"
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                  >
                    <IonIcon icon={checkmarkOutline} />
                    {savingNotes ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="sv-notes-text">
                {ojt.supervisorNotes
                  ? ojt.supervisorNotes
                  : <span style={{ color: 'var(--c-text-muted)', fontStyle: 'normal' }}>No notes yet. Tap Edit to add observations.</span>
                }
              </p>
            )}
          </div>

        </div>
      </IonContent>
      <SupervisorBottomNav activeTab="trainees" />
    </IonPage>
  );
}

export default TraineeDetail;