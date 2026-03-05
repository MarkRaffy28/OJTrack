import { useEffect, useState } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { timeOutline, documentTextOutline, cloudUploadOutline, logInOutline, notificationsOutline, settingsOutline } from 'ionicons/icons';
import { getGreeting } from '../../utils/getGreeting';
import { useOjt } from '../../context/ojtContext';
import { useUser } from '../../context/userContext';
import BottomNav from '../../components/BottomNav';

const Dashboard = () => {
  const { currentOjt } = useOjt();
  const { user, loading } = useUser();

  const [requiredHours, setRequiredHours] = useState<number>(0);
  const [renderedHours, setRenderedHours] = useState<number>(0);

  const remainingHours = requiredHours - renderedHours;
  const progressPercentage = Math.min((renderedHours / requiredHours) * 100, 100);

  useEffect(() => {
    setRequiredHours(Math.round(currentOjt?.requiredHours ?? 0));
    setRenderedHours(Math.round(currentOjt?.renderedHours ?? 0));
  });

  const handleNavigation = (route: string) => {
    // Use history.pushState for SPA navigation
    window.history.pushState({ path: route }, '', route);
    
    try {
      if (window.self !== window.top) {
        const parentWindow = window.parent;
        if (parentWindow && parentWindow.history) {
          parentWindow.history.pushState({ path: route }, '', route);
        }
      }
    } catch (e) {
      // Cross-origin restrictions may prevent accessing parent - ignore errors
    }
    
    // Force router to recognize the navigation
    window.dispatchEvent(new PopStateEvent('popstate', { state: { path: route } }));
  };
  
  return (
    <IonPage>
      <IonContent fullscreen className="dashboard-content">

        {/* Hero Header */}
        <div className="dash-hero">
          <div className="dash-hero-bg" />
          <div className="dash-hero-inner">
            <div className="dash-hero-top">
              <div className="dash-avatar">
                <img src={user?.profilePicture} alt="" />
              </div>
              <div className="dash-header-actions">
                <button className="dash-icon-btn"><IonIcon icon={notificationsOutline} /></button>
                <button className="dash-icon-btn"><IonIcon icon={settingsOutline} /></button>
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
              <span className="progress-card-tag">OJT Progress</span>
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
            <button className="qa-card qa-timein" onClick={() => handleNavigation('/dtr')}>
              <div className="qa-icon"><IonIcon icon={logInOutline} /></div>
              <span className="qa-label">Time In</span>
            </button>
            <button className="qa-card qa-dtr" onClick={() => handleNavigation('/dtr')}>
              <div className="qa-icon"><IonIcon icon={documentTextOutline} /></div>
              <span className="qa-label">Log DTR</span>
            </button>
            <button className="qa-card qa-report" onClick={() => handleNavigation('/reports')}>
              <div className="qa-icon"><IonIcon icon={cloudUploadOutline} /></div>
              <span className="qa-label">Upload Report</span>
            </button>
            <button className="qa-card qa-activity" onClick={() => handleNavigation('/activity')}>
              <div className="qa-icon"><IonIcon icon={timeOutline} /></div>
              <span className="qa-label">Activity</span>
            </button>
          </div>

          {/* Recent Activity */}
          <div className="dash-section-header">
            <span className="dash-section-title">Recent Activity</span>
            <button className="dash-view-all">View All</button>
          </div>

          <div className="activity-feed">
            <div className="activity-feed-item">
              <div className="feed-dot dot-in" />
              <div className="feed-line" />
              <div className="feed-content">
                <div className="feed-icon-wrap feed-icon-in"><IonIcon icon={logInOutline} /></div>
                <div className="feed-info">
                  <span className="feed-title">Time In</span>
                  <span className="feed-meta">8:00 AM · Today</span>
                </div>
                <span className="feed-badge badge-success">Done</span>
              </div>
            </div>

            <div className="activity-feed-item">
              <div className="feed-dot dot-doc" />
              <div className="feed-line" />
              <div className="feed-content">
                <div className="feed-icon-wrap feed-icon-doc"><IonIcon icon={documentTextOutline} /></div>
                <div className="feed-info">
                  <span className="feed-title">DTR Submitted</span>
                  <span className="feed-meta">Yesterday</span>
                </div>
                <span className="feed-badge badge-purple">DTR</span>
              </div>
            </div>

            <div className="activity-feed-item last-item">
              <div className="feed-dot dot-report" />
              <div className="feed-content">
                <div className="feed-icon-wrap feed-icon-report"><IonIcon icon={cloudUploadOutline} /></div>
                <div className="feed-info">
                  <span className="feed-title">Weekly Report</span>
                  <span className="feed-meta">2 days ago</span>
                </div>
                <span className="feed-badge badge-gray">Report</span>
              </div>
            </div>
          </div>

        </div>
      </IonContent>
      <BottomNav activeTab="home" />
    </IonPage>
  );
};

export default Dashboard;