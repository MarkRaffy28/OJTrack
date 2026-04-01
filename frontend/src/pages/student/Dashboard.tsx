import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { IonPage, IonContent, IonIcon, IonAvatar, IonSelect, IonSelectOption, IonSpinner } from '@ionic/react';
import { timeOutline, documentTextOutline, cloudUploadOutline, logInOutline, logOutOutline, personOutline, shieldCheckmarkOutline, keyOutline, trashOutline, createOutline } from 'ionicons/icons';
import { useOjt } from '@context/ojtContext';
import { useUser } from '@context/userContext';
import { useActivity } from '@context/activityContext';
import { useOjtProgress } from '@hooks/useOJtProgress';
import { getGreeting, formatRelativeDate, formatTime12 } from '@utils/date';
import BottomNav from '@components/BottomNav';

const Dashboard = () => {
  const history = useHistory();
  const location = useLocation();
  const { ojtRecords, currentOjt, selectedSchoolYear, selectSchoolYear } = useOjt();
  const { user } = useUser();
  const { activities, getLatestActivities, loadingActivities, fetchActivities } = useActivity();
  const { requiredHours, renderedHours, remainingHours, progressPercentage } = useOjtProgress(currentOjt);

  // Get top 5 activities for the dashboard
  const recentActivities = getLatestActivities(5);

  const typeConfig: Record<string, { icon: string; color: string; bg: string; label: string; badge: string }> = {
    'TIME_IN':        { icon: logInOutline,          color: '#34d399', bg: 'rgba(52,211,153,0.15)',  label: 'Time In',      badge: 'badge-success' },
    'TIME_OUT':       { icon: logOutOutline,         color: '#f87171', bg: 'rgba(248,113,113,0.15)', label: 'Time Out',     badge: 'badge-danger' },
    'SUBMIT_REPORT':  { icon: cloudUploadOutline,    color: '#60a5fa', bg: 'rgba(96,165,250,0.15)',  label: 'Report',       badge: 'badge-blue' },
    'CREATE_REPORT':  { icon: cloudUploadOutline,    color: '#60a5fa', bg: 'rgba(96,165,250,0.15)',  label: 'Report',       badge: 'badge-blue' },
    'UPDATE_REPORT':  { icon: createOutline,         color: '#60a5fa', bg: 'rgba(96,165,250,0.15)',  label: 'Update',       badge: 'badge-blue' },
    'DELETE_REPORT':  { icon: trashOutline,          color: '#f87171', bg: 'rgba(248,113,113,0.15)', label: 'Delete',       badge: 'badge-danger' },
    'LOGIN':          { icon: personOutline,         color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', label: 'Login',        badge: 'badge-purple' },
    'LOGOUT':         { icon: personOutline,         color: '#ec4899', bg: 'rgba(236,72,153,0.15)',  label: 'Logout',       badge: 'badge-pink' },
    'REGISTER':       { icon: shieldCheckmarkOutline, color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Register',     badge: 'badge-success' },
    'UPDATE_PROFILE': { icon: personOutline,         color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  label: 'Profile',      badge: 'badge-orange' },
    'UPDATE_PASSWORD':{ icon: keyOutline,            color: '#6366f1', bg: 'rgba(99,102,241,0.15)',  label: 'Password',     badge: 'badge-indigo' },
  };

  const handleNavigation = (route: string) => {
    history.push(route);
  };

  useEffect(() => {
    fetchActivities();
  }, [location.pathname]);
  
  return (
    <IonPage>
      <IonContent fullscreen className="dashboard-content">

        {/* Hero Header */}
        <div className="dash-hero">
          <div className="dash-hero-bg" />
          <div className="dash-hero-inner">
            <div className="dash-hero-top">
              <IonAvatar className="dash-avatar">
                <img src={user?.profilePicture} alt="Profile" />
              </IonAvatar>
              
              {/* OJT Selector */}
              <div className="dash-ojt-selector">
                <IonSelect 
                  value={selectedSchoolYear} 
                  interface="popover"
                  onIonChange={e => selectSchoolYear(e.detail.value)}
                  className="dash-year-select"
                >
                  {ojtRecords.map(ojt => (
                    <IonSelectOption key={ojt.id} value={ojt.academicYear}>
                      A.Y. {ojt.academicYear} - {ojt.term} Term
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>
            </div>
            
            <div className="dash-greeting">
              <p className="dash-greeting-sub">{getGreeting()} 👋</p>
              <h1 className="dash-greeting-name">{user?.firstName}</h1>
            </div>
          </div>
        </div>

        <div className="dash-body">

          {/* Progress Card */}<br/> <br />
          <div className="dash-card progress-main-card">
            <div className="progress-card-label">
              <span className="progress-card-tag">{currentOjt?.officeName || "OJT Progress"}</span>
              <span className="progress-pct">{progressPercentage.toFixed(1)}%</span>
            </div>

            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }}>
                <div className="progress-glow" />
              </div>
            </div>

            <div className="hours-row">
              <div className="hours-pill required-pill">
                <span className="hours-pill-value">{requiredHours}</span>
                <span className="hours-pill-label">Required</span>
              </div>
              <div className="hours-divider" />
              <div className="hours-pill rendered-pill">
                <span className="hours-pill-value">{renderedHours}</span>
                <span className="hours-pill-label">Rendered</span>
              </div>
              <div className="hours-divider" />
              <div className="hours-pill remaining-pill">
                <span className="hours-pill-value">{remainingHours}</span>
                <span className="hours-pill-label">Remaining</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dash-section-header">
            <span className="dash-section-title">Quick Actions</span>
          </div>
          <div className="quick-actions-grid">
            <button className="qa-card qa-timein" onClick={() => handleNavigation('/qr')}>
              <div className="qa-icon"><IonIcon icon={logInOutline} /></div>
              <span className="qa-label">Scan QR</span>
            </button>
            <button className="qa-card qa-dtr" onClick={() => handleNavigation('/dtr')}>
              <div className="qa-icon"><IonIcon icon={documentTextOutline} /></div>
              <span className="qa-label">Daily Record</span>
            </button>
            <button className="qa-card qa-report" onClick={() => handleNavigation('/upload-report')}>
              <div className="qa-icon"><IonIcon icon={cloudUploadOutline} /></div>
              <span className="qa-label">New Report</span>
            </button>
            <button className="qa-card qa-activity" onClick={() => handleNavigation('/activity')}>
              <div className="qa-icon"><IonIcon icon={timeOutline} /></div>
              <span className="qa-label">Timeline</span>
            </button>
          </div>

          {/* Recent Activity */}
          <div className="dash-section-header">
            <span className="dash-section-title">Recent Activity</span>
            <button className="dash-view-all" onClick={() => handleNavigation('/activity')}>View All</button>
          </div>

          <div className="activity-feed">
            {loadingActivities && (
              <div className="dash-loading">
                <IonSpinner name="crescent" />
              </div>
            )}

            {!loadingActivities && recentActivities.length === 0 && (
              <p className="no-data-msg">No recent activity</p>
            )}

            {recentActivities.map((activity, idx) => {
              const cfg = typeConfig[activity.action] || { 
                icon: timeOutline, 
                color: '#6b7280', 
                bg: 'rgba(107,114,128,0.1)', 
                label: activity.action,
                badge: 'badge-gray'
              };
              const isLast = idx === recentActivities.length - 1;

              return (
                <div key={activity.id} className={`activity-feed-item ${isLast ? 'last-item' : ''}`}>
                  <div className={`feed-dot`} style={{ background: cfg.color }} />
                  {!isLast && <div className="feed-line" />}
                  <div className="feed-content">
                    <div className="feed-icon-wrap" style={{ background: cfg.bg, color: cfg.color }}>
                      <IonIcon icon={cfg.icon} />
                    </div>
                    <div className="feed-info">
                      <span className="feed-title">{cfg.label}</span>
                      <span className="feed-meta">
                        {formatTime12(activity.createdAt)} · {formatRelativeDate(activity.createdAt)}
                      </span>
                    </div>
                    <span className={`feed-badge ${cfg.badge}`}>
                      {activity.targetType || 'Log'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </IonContent>
      <BottomNav activeTab="home" />
    </IonPage>
  );
};

export default Dashboard;