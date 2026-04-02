import React, { useState } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { peopleOutline, documentTextOutline, personOutline, timeOutline, notificationsOutline, settingsOutline } from 'ionicons/icons';
import SupervisorBottomNav from '../../components/SupervisorBottomNav';
import { useUser } from '../../context/userContext';
import '@css/Supervisor.css';

function SupervisorDashboard() {
  const { user } = useUser();
  const [assignedTrainees] = useState(25);
  const [pendingReports] = useState(5);
  const [presentTrainees] = useState(18);
  const [averageProgress] = useState(75);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="sv-content">

        {/* Hero */}
        <div className="sv-hero">
          <div className="sv-hero-bg" />
          <div className="sv-hero-inner">
            <div className="sv-hero-top">
              <div className="sv-avatar">{user ? getInitials(user.fullName) : 'SV'}</div>
              <div className="sv-hero-actions">
                <button className="sv-icon-btn"><IonIcon icon={notificationsOutline} /></button>
                <button className="sv-icon-btn"><IonIcon icon={settingsOutline} /></button>
              </div>
            </div>
            <p className="sv-hero-sub">Welcome back 👋</p>
            <h1 className="sv-hero-name">{user ? user.fullName : 'Supervisor'}</h1>
            <span className="sv-role-badge">{user?.role === 'supervisor' ? user.position : 'Supervisor'}</span>
          </div>
        </div>

        <div className="sv-body">

          {/* Stats Row */} <br/>
          <div className="sv-stats-grid">
            <div className="sv-stat-card sv-stat-purple">
              <div className="sv-stat-icon-wrap">
                <IonIcon icon={peopleOutline} />
              </div>
              <p className="sv-stat-num">{assignedTrainees}</p>
              <p className="sv-stat-lbl">Total Trainees</p>
            </div>
            <div className="sv-stat-card sv-stat-amber">
              <div className="sv-stat-icon-wrap">
                <IonIcon icon={documentTextOutline} />
              </div>
              <p className="sv-stat-num">{pendingReports}</p>
              <p className="sv-stat-lbl">Pending Reports</p>
            </div>
            <div className="sv-stat-card sv-stat-green">
              <div className="sv-stat-icon-wrap">
                <IonIcon icon={personOutline} />
              </div>
              <p className="sv-stat-num">{presentTrainees}</p>
              <p className="sv-stat-lbl">Logged In</p>
            </div>
          </div>

          {/* Progress Card */}
          <div className="sv-card">
            <div className="sv-card-header">
              <div>
                <p className="sv-card-label">Average Progress</p>
                <h2 className="sv-card-title">Trainee Overview</h2>
              </div>
              <span className="sv-pct-badge">{averageProgress}%</span>
            </div>
            <div className="sv-progress-track">
              <div className="sv-progress-fill" style={{ width: `${averageProgress}%` }}>
                <div className="sv-progress-glow" />
              </div>
            </div>
            <div className="sv-progress-legend">
              <span className="sv-legend-item sv-legend-done">
                <span className="sv-legend-dot" style={{ background: 'var(--c-purple)' }} />
                Completed: {averageProgress}%
              </span>
              <span className="sv-legend-item">
                <span className="sv-legend-dot" style={{ background: 'var(--c-border)' }} />
                Remaining: {100 - averageProgress}%
              </span>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="sv-card">
            <div className="sv-card-header">
              <div>
                <p className="sv-card-label">Today</p>
                <h2 className="sv-card-title">Quick Summary</h2>
              </div>
              <div className="sv-card-icon-wrap sv-icon-time">
                <IonIcon icon={timeOutline} />
              </div>
            </div>
            <div className="sv-summary-rows">
              <div className="sv-summary-row">
                <div className="sv-summary-row-left">
                  <div className="sv-summary-dot sv-dot-green" />
                  <span className="sv-summary-label">Active sessions today</span>
                </div>
                <span className="sv-summary-val">{presentTrainees}</span>
              </div>
              <div className="sv-summary-row">
                <div className="sv-summary-row-left">
                  <div className="sv-summary-dot sv-dot-purple" />
                  <span className="sv-summary-label">Reports submitted this week</span>
                </div>
                <span className="sv-summary-val">12</span>
              </div>
              <div className="sv-summary-row">
                <div className="sv-summary-row-left">
                  <div className="sv-summary-dot sv-dot-amber" />
                  <span className="sv-summary-label">Awaiting your review</span>
                </div>
                <span className="sv-summary-val sv-val-amber">{pendingReports}</span>
              </div>
            </div>
          </div>

        </div>
      </IonContent>
      <SupervisorBottomNav activeTab="home" />
    </IonPage>
  );
};

export default SupervisorDashboard;